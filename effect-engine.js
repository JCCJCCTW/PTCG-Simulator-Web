(function initEffectEngine(global) {
  "use strict";

  function u() { return global.effectHandlerUtils || {}; }
  function ok(extra) { return typeof u().ok === "function" ? u().ok(extra) : Object.assign({ success: true, damage_modifier: 0, message: "" }, extra || {}); }
  function num(value, fallback) { return typeof u().num === "function" ? u().num(value, fallback || 0) : (Number.isFinite(Number(value)) ? Number(value) : (fallback || 0)); }
  function arr(value) { return typeof u().arr === "function" ? u().arr(value) : (Array.isArray(value) ? value : []); }
  function call(name, args, fallback) { return typeof u().call === "function" ? u().call(name, args, fallback) : fallback; }

  function state() {
    const next = typeof u().state === "function" ? u().state() : (global.__effectEngineState || (global.__effectEngineState = {}));
    if (!Array.isArray(next.attackLocks)) next.attackLocks = [];
    if (!Array.isArray(next.protections)) next.protections = [];
    if (!Array.isArray(next.damageBoosts)) next.damageBoosts = [];
    if (!next.knockoutsLastOpponentTurn || typeof next.knockoutsLastOpponentTurn !== "object") next.knockoutsLastOpponentTurn = { player1: false, opponent: false };
    if (!Number.isInteger(next.nextEffectId)) next.nextEffectId = 1;
    return next;
  }

  function nextId() { const id = state().nextEffectId || 1; state().nextEffectId = id + 1; return id; }
  function normalizeStatus(value) { const raw = String(value || "").trim().toLowerCase(); if (raw === "sleep") return "asleep"; if (raw === "paralysis") return "paralyzed"; if (raw === "confusion") return "confused"; return raw; }
  function parseDamage(attack, fallback) { const parsed = parseInt(attack && attack.damage, 10); return Number.isFinite(parsed) ? parsed : num(fallback, 0); }
  function normalizeSpec(spec) {
    if (!spec || typeof spec !== "object") return null;
    let params = spec.params;
    if (!params && spec.payload_json) {
      try { params = typeof spec.payload_json === "string" ? JSON.parse(spec.payload_json) : spec.payload_json; } catch { params = {}; }
    }
    return {
      source_type: spec.source_type || spec.sourceType || "attack",
      source_index: num(spec.source_index || spec.sourceIndex, 1),
      status: String(spec.status || "pending").trim(),
      handler: String(spec.handler || spec.simulator_handler || "").trim(),
      params: params && typeof params === "object" ? params : {},
      notes: String(spec.notes || "").trim()
    };
  }

  function catalogSpecs(card) {
    const finder = global.findDeckBuilderCatalogCardForEntry;
    if (typeof finder !== "function") return [];
    const meta = finder(card);
    return meta && Array.isArray(meta.effectSpecs || meta.effect_specs) ? (meta.effectSpecs || meta.effect_specs) : [];
  }

  function allSpecsForCard(card) {
    const own = Array.isArray(card && card.effectSpecs) ? card.effectSpecs : Array.isArray(card && card.effect_specs) ? card.effect_specs : [];
    return (own.length ? own : catalogSpecs(card)).map(normalizeSpec).filter(Boolean);
  }

  function resolveEffectSpecs(card, sourceType, sourceIndex) {
    return allSpecsForCard(card).filter((spec) => spec.source_type === sourceType && num(spec.source_index, 1) === num(sourceIndex, 1));
  }

  function catalog(card) { return typeof u().catalog === "function" ? u().catalog(card) : null; }
  function attr(card) { return typeof u().attr === "function" ? u().attr(card) : ""; }
  function mainZones(owner) { return typeof u().mainZones === "function" ? u().mainZones(owner) : [`${owner}-active`]; }
  function mainCard(zoneId) { return typeof u().mainCard === "function" ? u().mainCard(zoneId) : null; }
  function attached(zoneId) { return typeof u().attached === "function" ? u().attached(zoneId) : []; }
  function owners() { return ["player1", "opponent"]; }
  function isBench(zoneId) { return /-bench-\d+$/.test(String(zoneId || "")); }
  function isActive(zoneId) { return /-active$/.test(String(zoneId || "")); }
  function isMain(zoneId) { return isBench(zoneId) || isActive(zoneId); }
  function isAttach(zoneId) { return /-attach$/.test(String(zoneId || "")); }

  function haystack(card) {
    const meta = catalog(card) || {};
    return [card && card.name, card && card.ruleText, card && card.effectText, card && card.subtype, card && card.cardType, card && card.attribute, meta.name, meta.ruleText, meta.rule_text, meta.effectText, meta.effect_text, meta.subtype, meta.trainer_subtype_raw, meta.cardType, meta.card_type, meta.attribute].map((v) => String(v || "").toLowerCase()).join(" ");
  }

  function stage(card) { const meta = catalog(card) || {}; return String(card && card.evolutionStage || meta.evolutionStage || meta.evolution_stage || "").trim(); }
  function isBasic(card) { return stage(card) === "基礎"; }
  function isEx(card) { const text = haystack(card); return text.includes("寶可夢【ex】") || text.includes("pokemon ex") || text.includes(" ex"); }
  function isV(card) { const text = haystack(card); return text.includes("寶可夢【v】") || text.includes("pokemon v") || text.includes(" v"); }
  function isExOrV(card) { return isEx(card) || isV(card); }
  function isRuleBox(card) { const text = haystack(card); return isExOrV(card) || text.includes("rule box") || text.includes("規則"); }
  function hasAbility(card) { const meta = catalog(card) || {}; const list = Array.isArray(card && card.abilities) && card.abilities.length ? card.abilities : meta.abilities; return Array.isArray(list) && list.length > 0; }
  function isAncient(card) { return haystack(card).includes("古代") || haystack(card).includes("ancient"); }
  function isTera(card) { return haystack(card).includes("太晶") || haystack(card).includes("tera"); }
  function isEnergy(card) { return typeof u().isEnergy === "function" ? u().isEnergy(card) : false; }
  function isSpecialEnergy(card) { if (!isEnergy(card)) return false; return !haystack(card).includes("基本") && !haystack(card).includes("basic"); }
  function hasSpecialEnergy(card) { return attached(card && card.zoneId).some((item) => isSpecialEnergy(item)); }

  function allProviderCards() {
    const list = [];
    owners().forEach((owner) => {
      mainZones(owner).forEach((zoneId) => {
        const card = mainCard(zoneId);
        if (card) list.push(card);
        attached(zoneId).forEach((item) => list.push(item));
      });
    });
    arr(call("getCardsInZone", ["stadium"], [])).forEach((card) => list.push(card));
    return list;
  }

  function findBySync(syncId, owner) {
    const wanted = num(syncId, 0);
    if (!wanted) return null;
    return allProviderCards().find((card) => num(card && card.syncId, 0) === wanted && (!owner || card.owner === owner)) || null;
  }

  function hostForAttached(card) { return card && isAttach(card.zoneId) ? mainCard(String(card.zoneId).replace(/-attach$/, "")) : null; }
  function buildContext(attackerCard, defenderCard, attack) {
    const owner = attackerCard && attackerCard.owner === "opponent" ? "opponent" : "player1";
    return { attacker: attackerCard || null, defender: defenderCard || null, attack: attack || null, owner, opponentOwner: owner === "player1" ? "opponent" : "player1", baseDamage: parseDamage(attack, 0), runtime: { cancelBaseDamage: false, attackFailed: false, ignoreWeakness: false } };
  }

  function sourceInfo(attacker, options) {
    const next = options && typeof options === "object" ? options : {};
    return { owner: attacker && attacker.owner || next.owner || "", attacker: attacker || null, attack: next.attack || null, amount: num(next.amount, parseDamage(next.attack, 0)), kind: String(next.kind || next.source || "attack").trim(), interaction: String(next.interaction || "damage").trim() };
  }

  function clearStateForSync(syncId) {
    state().attackLocks = state().attackLocks.filter((item) => num(item && item.syncId, 0) !== num(syncId, 0));
    state().protections = state().protections.filter((item) => num(item && item.targetSyncId, 0) !== num(syncId, 0) && num(item && item.sourceSyncId, 0) !== num(syncId, 0));
  }

  function notifyCardMovedForEffects(card, fromZoneId, toZoneId) {
    if (!card || fromZoneId === toZoneId) return;
    clearStateForSync(card.syncId);
    // 追蹤昏厥：寶可夢從戰鬥/備戰區移到棄牌堆，且 HP 歸零才視為被擊倒
    if (isMain(fromZoneId) && /discard$/.test(String(toZoneId || ""))) {
      const hp = Number(card.currentHP || card.hp || 0);
      const damage = typeof global.getZoneDamage === "function" ? Number(global.getZoneDamage(fromZoneId) || 0) : 0;
      if (hp <= 0 || damage >= hp) {
        const cardOwner = card.owner === "opponent" ? "opponent" : "player1";
        state().knockoutsLastOpponentTurn[cardOwner] = true;
      }
    }
  }

  function expiryFor(duration, context) {
    const key = String(duration || "").trim();
    if (key === "opponent_next_turn") return context && context.opponentOwner || "";
    if (key === "self_next_turn" || key === "own_next_turn") return context && context.owner || "";
    return "";
  }

  function entry(config, context) {
    const next = config && typeof config === "object" ? config : {};
    const targetCard = next.targetCard || null;
    return {
      id: next.id || nextId(),
      sourceSyncId: num(next.sourceSyncId || next.sourceCard && next.sourceCard.syncId, 0) || 0,
      sourceOwner: String(next.sourceOwner || next.sourceCard && next.sourceCard.owner || "").trim(),
      sourceZoneId: String(next.sourceZoneId || next.sourceCard && next.sourceCard.zoneId || "").trim(),
      requireSourceBench: next.requireSourceBench === true,
      requireSourceActive: next.requireSourceActive === true,
      targetSyncId: num(next.targetSyncId || targetCard && targetCard.syncId, 0) || 0,
      targetOwner: String(next.targetOwner || targetCard && targetCard.owner || "").trim(),
      targetZoneId: String(next.targetZoneId || targetCard && targetCard.zoneId || "").trim(),
      targetFilters: Object.assign({}, next.targetFilters || {}),
      sourceFilters: Object.assign({}, next.sourceFilters || {}),
      preventDamage: next.preventDamage === true,
      preventEffects: next.preventEffects === true,
      preventStatus: next.preventStatus === true,
      preventDamageCounters: next.preventDamageCounters === true,
      reduceDamage: num(next.reduceDamage, 0),
      statuses: arr(next.statuses).map((value) => normalizeStatus(value)).filter(Boolean),
      cureExistingStatus: next.cureExistingStatus === true,
      expiresAfterEndingOwner: String(next.expiresAfterEndingOwner || expiryFor(next.duration, context) || "").trim()
    };
  }

  function protectionTemplate(effect, providerCard, params) {
    const key = String(effect || "").trim();
    const self = { targetCard: providerCard, sourceCard: providerCard, sourceFilters: { relativeOwner: "opponent", kind: "attack" } };
    switch (key) {
      case "prevent_damage_and_effects_to_self_next_opponent_turn":
      case "prevent_attack_damage_and_effects_to_self":
        return Object.assign({}, self, { preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true });
      case "prevent_damage_and_effects_from_opponent_ex_next_turn":
        return Object.assign({}, self, { preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isPokemonEx: true } });
      case "prevent_damage_from_opponent_basic_pokemon_attacks_next_turn":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isBasic: true } });
      case "prevent_damage_from_opponent_basic_except_colorless_next_turn":
      case "prevent_damage_from_opponent_basic_except_colorless":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isBasic: true, excludeAttribute: "Colorless" } });
      case "prevent_damage_from_opponent_pokemon_with_special_energy":
      case "prevent_damage_and_effects_from_opponent_pokemon_with_special_energy":
        return Object.assign({}, self, { preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", hasSpecialEnergy: true } });
      case "prevent_damage_from_opponent_pokemon_with_abilities":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", hasAbility: true } });
      case "prevent_damage_from_opponent_ex":
      case "prevent_damage_from_opponent_pokemon_ex":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isPokemonEx: true } });
      case "prevent_damage_from_opponent_ex_or_v":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isExOrV: true } });
      case "prevent_damage_and_effects_from_opponent_tera_pokemon_attacks":
        return Object.assign({}, self, { preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", isTera: true } });
      case "prevent_damage_from_opponent_attacks_with_damage_200_or_more":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", minDamage: 200 } });
      case "prevent_damage_from_attack_60_or_less_next_turn":
      case "prevent_damage_from_attacks_lte_next_turn":
        return Object.assign({}, self, { preventDamage: true, sourceFilters: { relativeOwner: "opponent", kind: "attack", maxDamage: num(params && (params.max_damage || params.lte || params.amount), 60) } });
      case "prevent_damage_and_effects_to_all_own_bench":
        return { sourceCard: providerCard, targetFilters: { owner: providerCard && providerCard.owner, benchOnly: true, requireMainZone: true }, sourceFilters: { relativeOwner: "opponent", kind: "attack" }, preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true };
      case "prevent_damage_and_effects_while_on_bench":
      case "while_on_bench_prevent_damage_and_effects_from_opponent_attacks":
        return Object.assign({}, self, { requireSourceBench: true, preventDamage: true, preventEffects: true, preventStatus: true, preventDamageCounters: true });
      case "while_on_bench_prevent_attack_damage":
        return Object.assign({}, self, { requireSourceBench: true, preventDamage: true });
      case "prevent_bench_damage_to_own_non_rule_pokemon":
        return { sourceCard: providerCard, targetFilters: { owner: providerCard && providerCard.owner, benchOnly: true, requireMainZone: true, nonRuleBox: true }, sourceFilters: { relativeOwner: "opponent", kind: "attack" }, preventDamage: true };
      case "prevent_damage_counters_on_benched_from_opponent_attacks_and_abilities":
        return { sourceCard: providerCard, targetFilters: { owner: providerCard && providerCard.owner, benchOnly: true, requireMainZone: true }, sourceFilters: { relativeOwner: "opponent" }, preventDamageCounters: true };
      case "prevent_damage_to_non_rule_box_pokemon_from_opponent_ex_and_v":
        return { sourceCard: providerCard, targetFilters: { requireMainZone: true, nonRuleBox: true }, sourceFilters: { relativeOwner: "opponent", kind: "attack", isExOrV: true }, preventDamage: true };
      case "ancient_pokemon_hp_plus_60_and_cure_prevent_special_conditions":
        return { sourceCard: providerCard, preventStatus: true, statuses: ["all"], cureExistingStatus: true };
      default:
        return null;
    }
  }

  function targetMatches(targetCard, filters) {
    const current = filters && typeof filters === "object" ? filters : {};
    if (!targetCard) return false;
    if (current.owner && targetCard.owner !== current.owner) return false;
    if (current.requireMainZone && !isMain(targetCard.zoneId)) return false;
    if (current.benchOnly && !isBench(targetCard.zoneId)) return false;
    if (current.activeOnly && !isActive(targetCard.zoneId)) return false;
    if (current.nonRuleBox && isRuleBox(targetCard)) return false;
    if (current.isAncient && !isAncient(targetCard)) return false;
    if (current.attribute && String(attr(targetCard) || "").toLowerCase() !== String(current.attribute).toLowerCase()) return false;
    if (current.hasAttachedEnergy && attached(targetCard.zoneId).filter(function(c) { return isEnergy(c); }).length === 0) return false;
    return true;
  }

  function sourceMatches(info, targetCard, filters) {
    const current = filters && typeof filters === "object" ? filters : {};
    if (!info) return false;
    if (current.relativeOwner === "opponent" && info.owner === targetCard.owner) return false;
    if (current.relativeOwner === "self" && info.owner !== targetCard.owner) return false;
    if (current.kind && info.kind !== current.kind) return false;
    if (current.isBasic && !isBasic(info.attacker)) return false;
    if (current.excludeAttribute && String(attr(info.attacker) || "").toLowerCase() === String(current.excludeAttribute).toLowerCase()) return false;
    if (current.isPokemonEx && !isEx(info.attacker)) return false;
    if (current.isPokemonV && !isV(info.attacker)) return false;
    if (current.isExOrV && !isExOrV(info.attacker)) return false;
    if (current.hasAbility && !hasAbility(info.attacker)) return false;
    if (current.hasSpecialEnergy && !hasSpecialEnergy(info.attacker)) return false;
    if (current.isTera && !isTera(info.attacker)) return false;
    if (Number.isFinite(current.minDamage) && num(info.amount, 0) < num(current.minDamage, 0)) return false;
    if (Number.isFinite(current.maxDamage) && num(info.amount, 0) > num(current.maxDamage, 0)) return false;
    return true;
  }

  function entryBlocks(item, kind, statusName) {
    if (kind === "damage") return !!item.preventDamage;
    if (kind === "effect") return !!item.preventEffects;
    if (kind === "damage_counter") return !!item.preventDamageCounters || !!item.preventEffects;
    if (kind === "status") {
      if (!(item.preventStatus || item.preventEffects)) return false;
      if (!Array.isArray(item.statuses) || item.statuses.length === 0) return true;
      return item.statuses.some((value) => value === "all" || value === statusName);
    }
    return false;
  }

  function sourceValid(item) {
    if (!item || !item.sourceSyncId) return true;
    const sourceCard = findBySync(item.sourceSyncId, item.sourceOwner);
    if (!sourceCard) return false;
    if (item.sourceZoneId && item.sourceZoneId !== sourceCard.zoneId) return false;
    if (item.requireSourceBench && !isBench(sourceCard.zoneId)) return false;
    if (item.requireSourceActive && !isActive(sourceCard.zoneId)) return false;
    return true;
  }

  function prune() {
    state().protections = state().protections.filter((item) => {
      if (!item || !sourceValid(item)) return false;
      if (item.targetSyncId) {
        const target = findBySync(item.targetSyncId, item.targetOwner);
        if (!target) return false;
        if (item.targetZoneId && item.targetZoneId !== target.zoneId) return false;
      }
      return true;
    });
    state().attackLocks = state().attackLocks.filter((item) => {
      const target = item ? findBySync(item.syncId, item.owner) : null;
      return !!target && (!item.zoneId || item.zoneId === target.zoneId);
    });
  }

  function passiveEntries(targetCard) {
    const list = [];
    allSpecsForCard(targetCard).forEach((spec) => {
      if ((spec.source_type === "ability" || spec.source_type === "card") && spec.status === "ready" && spec.handler === "reduceDamage") list.push(entry({ targetCard, sourceCard: targetCard, sourceFilters: { relativeOwner: "opponent", kind: "attack" }, reduceDamage: num(spec.params && spec.params.amount, 0) }));
      if ((spec.source_type === "ability" || spec.source_type === "card") && spec.status === "ready" && spec.handler === "preventStatus") list.push(entry({ targetCard, sourceCard: targetCard, preventStatus: true, statuses: arr(spec.params && spec.params.statuses).length ? arr(spec.params && spec.params.statuses) : ["all"] }));
    });
    allProviderCards().forEach((providerCard) => {
      allSpecsForCard(providerCard).forEach((spec) => {
        if ((spec.source_type !== "ability" && spec.source_type !== "card") || spec.status !== "custom") return;
        const template = protectionTemplate(spec.params && spec.params.effect, providerCard, spec.params || {});
        if (!template) return;
        if (String(spec.params && spec.params.effect || "").trim() === "ancient_pokemon_hp_plus_60_and_cure_prevent_special_conditions") {
          const host = hostForAttached(providerCard);
          if (host && isAncient(host)) list.push(entry(Object.assign({}, template, { targetCard: host, sourceCard: providerCard })));
          return;
        }
        list.push(entry(template));
      });
    });
    return list.filter((item) => {
      if (item.targetSyncId) return num(item.targetSyncId, 0) === num(targetCard.syncId, 0) && (!item.targetZoneId || item.targetZoneId === targetCard.zoneId) && sourceValid(item);
      return targetMatches(targetCard, item.targetFilters) && sourceValid(item);
    });
  }

  function matchingEntries(targetCard, info, kind, statusName) {
    prune();
    const items = passiveEntries(targetCard).concat(state().protections.filter((item) => {
      if (!item || !sourceValid(item)) return false;
      if (item.targetSyncId) return num(item.targetSyncId, 0) === num(targetCard.syncId, 0) && (!item.targetZoneId || item.targetZoneId === targetCard.zoneId);
      return targetMatches(targetCard, item.targetFilters);
    }));
    return items.filter((item) => sourceMatches(info, targetCard, item.sourceFilters) && entryBlocks(item, kind, statusName));
  }

  function reduction(targetCard, info) {
    prune();
    return passiveEntries(targetCard).concat(state().protections)
      .filter((item) => item && num(item.reduceDamage, 0) > 0 && sourceValid(item) && ((item.targetSyncId && num(item.targetSyncId, 0) === num(targetCard.syncId, 0) && (!item.targetZoneId || item.targetZoneId === targetCard.zoneId)) || (!item.targetSyncId && targetMatches(targetCard, item.targetFilters))) && sourceMatches(info, targetCard, item.sourceFilters))
      .reduce((sum, item) => sum + num(item.reduceDamage, 0), 0);
  }

  function clearStatus(card, statusName) {
    let changed = false;
    if ((statusName === "all" || statusName === "poison") && card.poison) { card.poison = false; changed = true; }
    if ((statusName === "all" || statusName === "burn") && card.burn) { card.burn = false; changed = true; }
    if (card.behaviorStatus && (statusName === "all" || normalizeStatus(card.behaviorStatus) === statusName)) { card.behaviorStatus = ""; card.rotationDeg = 0; changed = true; }
    return changed;
  }

  function syncContinuousEffectState() {
    prune();
    const changed = [];
    owners().forEach((owner) => {
      mainZones(owner).forEach((zoneId) => {
        const card = mainCard(zoneId);
        if (!card) return;
        const items = passiveEntries(card).filter((item) => item.preventStatus || item.cureExistingStatus);
        let dirty = false;
        items.forEach((item) => (item.statuses && item.statuses.length ? item.statuses : ["all"]).forEach((statusName) => { if (clearStatus(card, statusName)) dirty = true; }));
        if (dirty) {
          changed.push(zoneId);
          if (typeof global.broadcastCardStats === "function") global.broadcastCardStats(card, zoneId);
        }
      });
    });
    return changed;
  }

  function registerEffectProtection(config, context) {
    const next = Object.assign({}, config || {});
    if (next.effect) {
      const template = protectionTemplate(next.effect, next.sourceCard || context && context.attacker || null, next.params || {});
      if (!template) return null;
      Object.assign(next, template, next);
    }
    const item = entry(next, context);
    if (!item.targetSyncId && (!item.targetFilters || Object.keys(item.targetFilters).length === 0)) return null;
    state().protections.push(item);
    return item;
  }

  async function executeEffectSpec(spec, context) {
    const normalized = normalizeSpec(spec);
    if (!normalized) return ok({ success: false });
    if (normalized.status === "skip") return ok();
    if (normalized.status === "manual") { if (normalized.notes && typeof global.showToast === "function") global.showToast(normalized.notes, "warn", 2200); return ok({ message: normalized.notes }); }
    if (normalized.status === "pending" || normalized.status === "error") return ok({ success: false });
    if (normalized.status === "custom" || normalized.handler === "custom") {
      const custom = typeof global.resolveCustomHandler === "function" ? global.resolveCustomHandler(normalized) : null;
      if (typeof custom === "function") return custom(normalized.params || {}, context, normalized);
      return typeof global.runCustomHandlerFallback === "function" ? global.runCustomHandlerFallback(normalized, context) : ok();
    }
    const handler = (global.effectHandlers && global.effectHandlers[normalized.handler])
      || (typeof global.resolveCustomHandler === "function" ? global.resolveCustomHandler(normalized) : null);
    if (typeof handler !== "function") { console.warn("[EffectEngine] Unknown handler:", normalized.handler, normalized); return ok({ success: false }); }
    return handler(normalized.params || {}, context, normalized);
  }

  async function resolveAndExecuteAttackEffects(card, attack) {
    const defender = typeof global.getActiveCard === "function" ? global.getActiveCard(card.owner === "player1" ? "opponent" : "player1") : null;
    const context = buildContext(card, defender, attack);
    const specs = resolveEffectSpecs(card, "attack", attack && attack.index);
    let damageModifier = 0;
    for (const spec of specs) {
      if (context.runtime.attackFailed) break;
      try {
        const result = await executeEffectSpec(spec, context);
        damageModifier += num(result && result.damage_modifier, 0);
        if (result && result.cancel_damage) context.runtime.cancelBaseDamage = true;
      } catch (err) {
        console.error("[EffectEngine] handler error:", spec && spec.handler, err);
      }
    }
    if (context.runtime.cancelBaseDamage) damageModifier = -num(context.baseDamage, 0);
    // 消費一次性傷害加成（如大力鱷奔流之心）
    const boosts = state().damageBoosts;
    for (let i = boosts.length - 1; i >= 0; i--) {
      const b = boosts[i];
      if (b && b.owner === context.owner && num(b.syncId, 0) === num(card.syncId, 0)) {
        damageModifier += num(b.bonus, 0);
        boosts.splice(i, 1); // 使用後移除
      }
    }
    return { success: !context.runtime.attackFailed, damage_modifier: damageModifier, cancel_attack: !!context.runtime.attackFailed, ignoreWeakness: !!context.runtime.ignoreWeakness };
  }

  function canAttackWithEffects(card, attack) {
    prune();
    const attackName = String(attack && attack.name || "").trim();
    const lock = state().attackLocks.find((item) => item && item.owner === card.owner && num(item.syncId, 0) === num(card.syncId, 0) && item.active && (item.attackName === "" || item.attackName === attackName));
    if (!lock) return { allowed: true };
    const msg = lock.attackName ? `這隻寶可夢下回合不能使用「${lock.attackName}」` : "這隻寶可夢下回合不能攻擊";
    if (typeof global.showToast === "function") global.showToast(msg, "warn", 1800);
    return { allowed: false, reason: lock.attackName || "all" };
  }

  function applyIncomingAttackModifiers(attacker, defender, amount, options) {
    const info = sourceInfo(attacker, Object.assign({}, options || {}, { amount, interaction: "damage" }));
    const blocked = matchingEntries(defender, info, "damage", "").length > 0;
    let damage = blocked ? 0 : num(amount, 0);
    if (damage > 0) damage = Math.max(0, damage - reduction(defender, info));
    return { damage, prevented: blocked || (damage === 0 && num(amount, 0) > 0), options: options || {} };
  }

  function isAttackEffectPreventedOnTarget(attacker, targetCard, options) {
    const interaction = String(options && options.interaction || "effect").trim();
    const info = sourceInfo(attacker, Object.assign({}, options || {}, { interaction }));
    return matchingEntries(targetCard, info, interaction, normalizeStatus(options && options.status)).length > 0;
  }

  function canApplyStatusEffect(targetCard, status, context) {
    if (!targetCard) return false;
    const normalized = normalizeStatus(status);
    const info = sourceInfo(context && context.attacker || null, { owner: context && context.owner, attack: context && context.attack, interaction: "status" });
    return matchingEntries(targetCard, info, "status", normalized).length === 0;
  }

  async function handleAfterAttackDamage(payload) {
    const attacker = payload && payload.attacker;
    const defender = payload && payload.defender;
    const attack = payload && payload.attack;
    const actualDamage = num(payload && payload.actualDamage, 0);
    if (!attacker || !defender || actualDamage <= 0 || !isActive(defender.zoneId)) return ok();
    const context = buildContext(defender, attacker, attack);
    context.owner = defender.owner;
    context.opponentOwner = attacker.owner;
    context.attacker = defender;
    context.defender = attacker;
    allSpecsForCard(defender).forEach((spec) => {
      if ((spec.source_type !== "ability" && spec.source_type !== "card") || spec.status !== "custom") return;
      const effect = String(spec.params && spec.params.effect || "").trim();
      if (effect === "when_damaged_by_opponent_attack_poison_attacking_pokemon" || effect === "when_damaged_by_opponent_attack_poison_attacker_if_self_active") {
        if (global.canApplyStatusEffect(attacker, "poison", context) !== false) {
          call("applyStatusAction", [attacker, "poison"], undefined);
          call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
          call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
        }
      }
      if (effect === "when_active_damaged_by_opponent_attack_put_3_damage_counters_on_attacker" || effect === "when_active_damaged_by_opponent_attack_put_damage_counters_on_attacker") {
        const counters = num(spec.params && (spec.params.counters || spec.params.damage_counters), 3);
        if (counters > 0) {
          call("adjustCardDamage", [attacker, counters * 10, attacker.zoneId], undefined);
          call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
          call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
        }
      }
      if (effect === "when_active_damaged_by_opponent_attack_burn_attacker" || effect === "when_in_active_takes_damage_from_opponent_attack_burn_attacker") {
        if (global.canApplyStatusEffect(attacker, "burn", context) !== false) {
          call("applyStatusAction", [attacker, "burn"], undefined);
          call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
          call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
        }
      }
      // 受到傷害時對攻擊方放置傷害指示物（依附加金屬能量數量）
      if (effect === "when_damaged_by_opponent_attack_place_2_damage_counters_per_attached_metal_energy_on_attacker") {
        var metalCount = attached(defender.zoneId).filter(function(c) { return isEnergy(c) && String(attr(c) || "").toLowerCase() === "metal"; }).length;
        var counterDamage = metalCount * 20;
        if (counterDamage > 0) {
          call("adjustCardDamage", [attacker, counterDamage, attacker.zoneId], undefined);
          call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
          call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
        }
      }
      // 受到傷害時抽卡
      if (effect === "when_attached_pokemon_in_active_takes_damage_from_opponent_attack_draw_2") {
        draw(defender.owner, 2);
      }
      // 受到傷害時放置指定數量的傷害指示物（下回合反擊型）
      if (/^if_damaged_by_attack_next_opponent_turn_place_(\d+)_damage_counters_on_attacker$/.test(effect)) {
        var counterMatch = effect.match(/place_(\d+)_damage_counters/);
        var cntVal = counterMatch ? Number(counterMatch[1]) : 0;
        if (cntVal > 0) {
          call("adjustCardDamage", [attacker, cntVal * 10, attacker.zoneId], undefined);
          call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
          call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
        }
      }
      // 被攻擊時放置傷害指示物（附加道具版）
      if (effect === "when_active_attached_takes_damage_place_2_counters_on_attacker" || effect === "when_attached_pokemon_in_active_takes_damage_from_opponent_attack_place_12_damage_counters_on_attacker_then_discard_tool") {
        var toolCounters = effect.indexOf("12") >= 0 ? 12 : 2;
        call("adjustCardDamage", [attacker, toolCounters * 10, attacker.zoneId], undefined);
        call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
        call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
      }
    });
    return ok();
  }

  async function runBetweenTurnEffectHooks(payload) {
    const endingOwner = payload && payload.endingOwner;
    const nextOwner = payload && payload.nextOwner;
    state().knockoutsLastOpponentTurn[endingOwner] = false;
    state().attackLocks = state().attackLocks.filter((item) => {
      if (!item) return false;
      if (item.active && endingOwner === item.owner) return false;
      if (!item.active && nextOwner === item.owner) item.active = true;
      return true;
    });
    state().protections = state().protections.filter((item) => item && item.expiresAfterEndingOwner !== endingOwner);
    const changed = syncContinuousEffectState();
    if (changed.length > 0 && typeof global.renderBoard === "function") global.renderBoard({ zoneIds: changed, overlay: false });
    return ok();
  }

  global.resolveEffectSpecs = resolveEffectSpecs;
  global.executeEffectSpec = executeEffectSpec;
  global.buildEffectContext = buildContext;
  global.resolveAndExecuteAttackEffects = resolveAndExecuteAttackEffects;
  global.canAttackWithEffects = canAttackWithEffects;
  global.applyIncomingAttackModifiers = applyIncomingAttackModifiers;
  global.isAttackEffectPreventedOnTarget = isAttackEffectPreventedOnTarget;
  global.canApplyStatusEffect = canApplyStatusEffect;
  global.registerEffectProtection = registerEffectProtection;
  global.notifyCardMovedForEffects = notifyCardMovedForEffects;
  global.syncContinuousEffectState = syncContinuousEffectState;
  global.handleAfterAttackDamage = handleAfterAttackDamage;
  global.runBetweenTurnEffectHooks = runBetweenTurnEffectHooks;
})(typeof window !== "undefined" ? window : globalThis);
