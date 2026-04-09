(function initEffectHandlers(global) {
  "use strict";

  const effectHandlers = {};

  function ok(extra) {
    return Object.assign({ success: true, damage_modifier: 0, message: "" }, extra || {});
  }

  function num(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function call(name, args, fallback) {
    const fn = global[name];
    return typeof fn === "function" ? fn.apply(global, args || []) : fallback;
  }

  function state() {
    if (!global.__effectEngineState) {
      global.__effectEngineState = {
        attackLocks: [],
        protections: [],
        knockoutsLastOpponentTurn: { player1: false, opponent: false }
      };
    }
    return global.__effectEngineState;
  }

  function cardsIn(zoneId) { return arr(call("getCardsInZone", [zoneId], [])); }
  function mainCard(zoneId) { return cardsIn(zoneId)[0] || null; }
  function attachZone(zoneId) { return call("getAttachZoneForMainZone", [zoneId], zoneId ? `${zoneId}-attach` : ""); }
  function attached(zoneId) { return zoneId ? cardsIn(attachZone(zoneId)) : []; }
  function benchZones(owner) {
    const prefix = owner === "opponent" ? "opponent" : "player1";
    return Array.from({ length: 8 }, (_, i) => `${prefix}-bench-${i + 1}`);
  }
  function mainZones(owner) { return [`${owner}-active`, ...benchZones(owner)]; }
  function prizeZone(owner) { return call("getOwnerPrizeZone", [owner], `${owner}-prize`); }
  function deckZone(owner) { return call("getOwnerDeckZone", [owner], `${owner}-deck`); }
  function handZone(owner) { return call("getOwnerHandZone", [owner], `${owner}-hand`); }
  function discardZone(owner) { return call("getOwnerDiscardZone", [owner], `${owner}-discard`); }
  function ownerOf(ref, context) { return ref === "opponent" ? context.opponentOwner : context.owner; }
  function zoneDamage(zoneId) { return num(call("getZoneDamage", [zoneId], 0), 0); }
  function setDamage(zoneId, value) { call("setZoneDamage", [zoneId, value], undefined); }
  function render(zoneIds) { call("renderBoard", [{ zoneIds: arr(zoneIds).filter(Boolean), overlay: false }], undefined); }
  function sync(card, zoneId) { if (card) call("broadcastCardStats", [card, zoneId || card.zoneId], undefined); }
  function catalog(card) {
    if (!card) return null;
    if (card.__catalogCard) return card.__catalogCard;
    const found = call("findDeckBuilderCatalogCardForEntry", [card], null);
    if (found) card.__catalogCard = found;
    return found || null;
  }
  function attr(card) {
    const meta = catalog(card) || {};
    return String(card && (card.elementType || card.attribute) || meta.attribute || meta.elementType || "").trim();
  }
  function isEnergy(card) {
    const meta = catalog(card) || {};
    const value = String(card && card.cardType || meta.cardType || meta.card_type || "").toLowerCase();
    return value.includes("energy") || value.includes("能量");
  }
  function sameText(a, b) { return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase(); }
  function statusName(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "sleep" || raw === "asleep") return "asleep";
    if (raw === "paralysis" || raw === "paralyzed") return "paralyzed";
    if (raw === "confusion" || raw === "confused") return "confused";
    return raw;
  }

  function move(cards, toZoneId, options) {
    const moved = arr(cards).filter(Boolean);
    if (!toZoneId || moved.length === 0) return [];
    const before = call("snapshotCardZones", [], null);
    moved.forEach((card) => {
      // 排隊移動動畫
      if (typeof global.queueMoveAnimation === "function") {
        global.queueMoveAnimation(card, card.zoneId, toZoneId);
      }
      call("moveCardToZone", [card, toZoneId], undefined);
      if (options && options.faceUp === true) card.isFaceUp = true;
      if (options && options.faceDown === true) card.isFaceUp = false;
    });
    const ids = moved.map((card) => card.id);
    if (before && typeof global.renderBoardForMovedCards === "function") {
      global.renderBoardForMovedCards(before, ids, { extraZoneIds: [toZoneId] });
    } else {
      render([toZoneId]);
    }
    call("broadcastMoveSync", [ids, before], undefined);
    return moved;
  }

  function draw(owner, count) {
    const pulled = [];
    const before = call("snapshotCardZones", [], null);
    for (let i = 0; i < Math.max(0, count); i += 1) {
      const card = call("drawCardFromDeck", [owner, false], null);
      if (!card) break;
      pulled.push(card);
      // 排隊移動動畫（從牌組到手牌）
      if (typeof global.queueMoveAnimation === "function") {
        global.queueMoveAnimation(card, deckZone(owner), handZone(owner));
      }
      call("moveCardToZone", [card, handZone(owner)], undefined);
      card.isFaceUp = true;
    }
    if (pulled.length) {
      const ids = pulled.map((card) => card.id);
      if (before && typeof global.renderBoardForMovedCards === "function") {
        global.renderBoardForMovedCards(before, ids, { extraZoneIds: [handZone(owner), deckZone(owner)] });
      } else {
        render([handZone(owner), deckZone(owner)]);
      }
      call("broadcastMoveSync", [ids, before], undefined);
    }
    return pulled;
  }

  function shuffle(owner) {
    if (typeof global.reorderDeck !== "function") return;
    const deck = cardsIn(deckZone(owner));
    const ordered = typeof global.fisherYatesShuffle === "function"
      ? global.fisherYatesShuffle(deck)
      : [...deck].sort(() => Math.random() - 0.5);
    global.reorderDeck(owner, ordered);
    render([deckZone(owner)]);
    // 觸發洗牌動畫
    if (typeof global.triggerShuffleAnimation === "function") {
      global.triggerShuffleAnimation(deckZone(owner));
    }
  }

  function putIntoDeck(owner, cards, where) {
    const moved = arr(cards).filter(Boolean);
    if (!moved.length && where !== "shuffle") return [];
    if (typeof global.reorderDeck !== "function") return [];
    const before = call("snapshotCardZones", [], null);
    const movedIds = new Set(moved.map((card) => card.id));
    moved.forEach((card) => {
      // 排隊移動動畫（卡片回到牌組）
      if (typeof global.queueMoveAnimation === "function") {
        global.queueMoveAnimation(card, card.zoneId, deckZone(owner));
      }
      call("moveCardToZone", [card, deckZone(owner)], undefined);
      card.isFaceUp = false;
    });
    const rest = cardsIn(deckZone(owner)).filter((card) => !movedIds.has(card.id));
    let ordered;
    if (where === "top") {
      ordered = [...moved, ...rest];
    } else if (where === "bottom") {
      ordered = [...rest, ...moved];
    } else {
      // shuffle: 合併後用 Fisher-Yates 洗牌
      const combined = [...rest, ...moved];
      ordered = typeof global.fisherYatesShuffle === "function"
        ? global.fisherYatesShuffle(combined)
        : combined.sort(() => Math.random() - 0.5);
    }
    global.reorderDeck(owner, ordered);
    if (moved.length) {
      call("broadcastMoveSync", [moved.map((card) => card.id), before], undefined);
    }
    render([deckZone(owner)]);
    // 如果是洗牌方式放入，觸發洗牌動畫
    if (where === "shuffle" && typeof global.triggerShuffleAnimation === "function") {
      global.triggerShuffleAnimation(deckZone(owner));
    }
    return moved;
  }

  function matchEnergy(card, energyType) {
    const raw = String(energyType || "any").trim().toLowerCase();
    if (!isEnergy(card)) return false;
    if (!raw || raw === "any" || raw === "all") return true;
    if (raw === "basic") return String(card.cardType || "").toLowerCase().includes("基本");
    return sameText(attr(card), raw);
  }

  function matchFilter(card, filter) {
    const meta = catalog(card) || {};
    const current = filter && typeof filter === "object" ? filter : {};
    const name = String(card && card.name || meta.name || "").trim();
    const stage = String(card && card.evolutionStage || meta.evolutionStage || meta.evolution_stage || "").trim();
    if (current.name && !sameText(name, current.name)) return false;
    if (current.name_contains && !name.toLowerCase().includes(String(current.name_contains).trim().toLowerCase())) return false;
    if (current.stage && !sameText(stage, current.stage)) return false;
    if (current.evolution_stage) {
      const target = String(current.evolution_stage).trim().toLowerCase();
      if (target === "basic" || target === "基礎") {
        if (stage && stage !== "基礎") return false;
      } else if (!sameText(stage, current.evolution_stage)) return false;
    }
    if (current.basic === true && stage !== "基礎") return false;
    if (current.is_basic === true) {
      if (stage && stage !== "基礎") return false;
    }
    // HP 過濾
    const cardHp = Number(card && card.hp || meta.hp || 0);
    if (current.max_hp != null && cardHp > Number(current.max_hp)) return false;
    if (current.hp_lte != null && cardHp > Number(current.hp_lte)) return false;
    if (current.min_hp != null && cardHp < Number(current.min_hp)) return false;
    if (current.hp_gte != null && cardHp < Number(current.hp_gte)) return false;
    if (current.pokemon_attribute && !sameText(attr(card), current.pokemon_attribute)) return false;
    // 排除擁有規則的寶可夢（ex, V, VSTAR, VMAX 等）
    if (current.exclude_rule_box === true) {
      const ruleText = String(meta.ruleText || meta.rule_text || "").trim();
      const cardName = String(card && card.name || meta.name || "");
      const hasRuleBox = ruleText.length > 0 || /(?:ex|EX|V|VSTAR|VMAX|GX|BREAK|TAG\s?TEAM|Prism\s?Star|◇)$/i.test(cardName);
      if (hasRuleBox) return false;
    }
    if (current.tag) {
      const haystack = [meta.ruleText, meta.rule_text, meta.effectText, meta.effect_text, meta.subtype, meta.trainer_subtype_raw]
        .map((v) => String(v || "").toLowerCase()).join(" ");
      if (!haystack.includes(String(current.tag || "").toLowerCase())) return false;
    }
    return true;
  }

  function matchFind(card, find, filter) {
    const meta = catalog(card) || {};
    const kind = String(find || "any").trim().toLowerCase();
    const type = String(card && card.cardType || meta.cardType || meta.card_type || "").toLowerCase();
    if (kind === "any") return matchFilter(card, filter);
    if (kind === "pokemon") return (type.includes("pokemon") || type.includes("\u5bf6\u53ef\u5922")) && matchFilter(card, filter);
    if (kind === "evolution") {
      const stage = String(card && (card.evolutionStage || card.evolution_stage) || meta.evolutionStage || meta.evolution_stage || "").toLowerCase();
      const isPokemon = type.includes("pokemon") || type.includes("\u5bf6\u53ef\u5922");
      const isBasic = !stage || stage.includes("basic") || stage.includes("\u57fa\u790e");
      return isPokemon && !isBasic && matchFilter(card, filter);
    }
    if (kind === "basic_energy") { return isEnergy(card) && !String(card && card.name || meta.name || "").includes("特殊") && matchFilter(card, filter); }
    if (kind === "energy") return isEnergy(card) && matchFilter(card, filter);
    if (kind === "pokemon_or_basic_energy") {
      const isPokemon = type.includes("pokemon") || type.includes("\u5bf6\u53ef\u5922");
      const isBasicEnergy = isEnergy(card) && !String(card && card.name || meta.name || "").includes("特殊");
      return (isPokemon || isBasicEnergy) && matchFilter(card, filter);
    }
    if (kind === "trainer") return (type.includes("trainer") || type.includes("\u8a13\u7df4\u5bb6")) && matchFilter(card, filter);
    if (kind === "item" || kind === "supporter") return matchFilter(card, filter);
    return matchFilter(card, filter);
  }

  function targets(ref, context) {
    if (ref === "self_active") return [`${context.owner}-active`];
    if (ref === "opponent_active") return [`${context.opponentOwner}-active`];
    if (ref === "self_bench" || ref === "self_bench_all") return benchZones(context.owner).filter((zoneId) => !!mainCard(zoneId));
    if (ref === "self_choose" || ref === "self_all" || ref === "self_any") return mainZones(context.owner).filter((zoneId) => !!mainCard(zoneId));
    if (ref === "opponent_choose" || ref === "opponent_all" || ref === "opponent_any") return mainZones(context.opponentOwner).filter((zoneId) => !!mainCard(zoneId));
    if (ref === "opponent_bench_all" || ref === "opponent_bench_choose") return benchZones(context.opponentOwner).filter((zoneId) => !!mainCard(zoneId));
    return /^(player1|opponent)-(active|bench-\d+)$/.test(String(ref || "")) ? [String(ref)] : [];
  }

  let lastChoiceCancelled = false;
  function consumeChoiceCancelled() {
    const cancelled = lastChoiceCancelled;
    lastChoiceCancelled = false;
    return cancelled;
  }

  async function choose(list, count, options) {
    const items = arr(list).filter(Boolean);
    const config = options && typeof options === "object" ? options : {};
    const maxCount = Math.max(0, num(config.maxCount, count));
    const minCount = Math.max(0, num(config.minCount, maxCount));
    lastChoiceCancelled = false;
    if (items.length === 0 || maxCount <= 0) return [];
    if (typeof global.promptEffectCardChoice !== "function") {
      return items.slice(0, maxCount);
    }
    if (typeof items[0] === "string") {
      const entries = items.map((zoneId) => ({ zoneId, card: mainCard(zoneId) })).filter((entry) => !!entry.card);
      if (!entries.length) return [];
      const selectedCards = await global.promptEffectCardChoice({
        title: String(config.title || "選擇目標"),
        hint: String(config.hint || ""),
        cards: entries.map((entry) => entry.card),
        minCount: Math.min(minCount, entries.length),
        maxCount: Math.min(maxCount, entries.length),
        owner: String(config.owner || entries[0].card.owner || "player1"),
        sourceZoneId: String(config.sourceZoneId || "effect-choice-view"),
        sortMode: String(config.sortMode || ""),
        allowCancel: config.allowCancel !== false
      });
      lastChoiceCancelled = typeof global.consumeOverlayChoiceCancelled === "function"
        ? !!global.consumeOverlayChoiceCancelled()
        : false;
      const pickedIds = new Set(arr(selectedCards).map((card) => Number(card.id)));
      return entries.filter((entry) => pickedIds.has(Number(entry.card.id))).map((entry) => entry.zoneId);
    }
    const selectedCards = await global.promptEffectCardChoice({
      title: String(config.title || "選擇卡片"),
      hint: String(config.hint || ""),
      cards: items,
      minCount: Math.min(minCount, items.length),
      maxCount: Math.min(maxCount, items.length),
      owner: String(config.owner || items[0].owner || "player1"),
      sourceZoneId: String(config.sourceZoneId || items[0].zoneId || "effect-choice-view"),
      sortMode: String(config.sortMode || ""),
      allowCancel: config.allowCancel !== false
    });
    lastChoiceCancelled = typeof global.consumeOverlayChoiceCancelled === "function"
      ? !!global.consumeOverlayChoiceCancelled()
      : false;
    return arr(selectedCards);
  }

  function attachedEnergy(zoneIds, energyType, count) {
    const picked = [];
    arr(zoneIds).forEach((zoneId) => {
      attached(zoneId).forEach((card) => {
        if (picked.length < count && matchEnergy(card, energyType)) picked.push(card);
      });
    });
    return picked;
  }

  function applyStatus(card, rawStatus, context) {
    const value = statusName(rawStatus);
    if (!card || !value) return false;
    if (typeof global.isAttackEffectPreventedOnTarget === "function" && context && context.attacker) {
      const blocked = global.isAttackEffectPreventedOnTarget(context.attacker, card, {
        attack: context.attack,
        interaction: "status",
        status: value
      });
      if (blocked) return false;
    }
    if (typeof global.canApplyStatusEffect === "function" && global.canApplyStatusEffect(card, value, context) === false) return false;
    call("applyStatusAction", [card, value], undefined);
    return true;
  }

  async function flips(count) {
    const results = [];
    for (let i = 0; i < Math.max(1, count); i += 1) {
      const result = Math.random() < 0.5 ? "正面" : "反面";
      if (typeof global.playCoinToss === "function") {
        await global.playCoinToss(result, { broadcast: true, startedAt: Date.now() + 180, flipCount: 10 });
      }
      results.push(result);
      if (typeof global.delayMs === "function") await global.delayMs(120);
    }
    return results;
  }

  function condition(name, context) {
    const raw = String(name || "").trim();
    let match = raw.match(/^opponent_prize_lte_(\d+)$/);
    if (match) return cardsIn(prizeZone(context.opponentOwner)).length <= Number(match[1]);
    match = raw.match(/^self_prize_lte_(\d+)$/);
    if (match) return cardsIn(prizeZone(context.owner)).length <= Number(match[1]);
    match = raw.match(/^self_active_is_(.+)$/);
    if (match) return sameText(attr(mainCard(`${context.owner}-active`)), match[1]);
    match = raw.match(/^energy_attached_gte_(\d+)$/);
    if (match) return attached(context.attacker && context.attacker.zoneId).filter(isEnergy).length >= Number(match[1]);
    match = raw.match(/^opponent_bench_count_gte_(\d+)$/);
    if (match) return benchZones(context.opponentOwner).filter((zoneId) => !!mainCard(zoneId)).length >= Number(match[1]);
    if (raw === "opponent_has_damage") return zoneDamage(`${context.opponentOwner}-active`) > 0;
    if (raw === "last_turn_knocked_out") return !!state().knockoutsLastOpponentTurn[context.owner];
    if (raw === "first_turn") return !!(global.boardState && global.boardState.state && global.boardState.state.turn && global.boardState.state.turn.turnNumber === 1);
    if (raw === "is_evolved") { const meta = catalog(context.attacker) || {}; const s = String(context.attacker && context.attacker.evolutionStage || meta.evolutionStage || meta.evolution_stage || ""); return s !== "" && s !== "基礎" && !s.toLowerCase().includes("basic"); }
    match = raw.match(/^self_bench_has_(.+)$/);
    if (match) return benchZones(context.owner).some((zoneId) => { const card = mainCard(zoneId); return card && sameText(card.name, match[1]); });
    match = raw.match(/^self_bench_count_gte_?(\d+)?$/);
    if (match) return benchZones(context.owner).filter((zoneId) => !!mainCard(zoneId)).length >= Number(match[1] || 1);
    match = raw.match(/^self_prize_more_than_opponent$|^self_prizes_remaining_more_than_opponent$|^self_prizes_gt_opponent_prizes$/);
    if (match) return cardsIn(prizeZone(context.owner)).length > cardsIn(prizeZone(context.opponentOwner)).length;
    match = raw.match(/^only_if_behind_on_prizes$/);
    if (match) return cardsIn(prizeZone(context.owner)).length > cardsIn(prizeZone(context.opponentOwner)).length;
    match = raw.match(/^self_prizes_remaining_equals_?(\d+)?$/);
    if (match) return match[1] ? cardsIn(prizeZone(context.owner)).length === Number(match[1]) : false;
    match = raw.match(/^opponent_prizes_remaining_max_?(\d+)?$/);
    if (match) return match[1] ? cardsIn(prizeZone(context.opponentOwner)).length <= Number(match[1]) : false;
    if (raw === "opponent_active_has_damage_counters" || raw === "opponent_active_damage_counters_equals") return zoneDamage(`${context.opponentOwner}-active`) > 0;
    if (raw === "self_has_damage_counters") return context.attacker && zoneDamage(context.attacker.zoneId) > 0;
    if (raw === "self_has_no_damage_counters" || raw === "self_full_hp") return context.attacker && zoneDamage(context.attacker.zoneId) === 0;
    if (raw === "self_has_no_attached_energy") return context.attacker && attached(context.attacker.zoneId).filter(isEnergy).length === 0;
    if (raw === "opponent_active_is_evolved") { const def = mainCard(`${context.opponentOwner}-active`); const meta = catalog(def) || {}; const s = String(def && def.evolutionStage || meta.evolutionStage || meta.evolution_stage || ""); return s !== "" && s !== "基礎" && !s.toLowerCase().includes("basic"); }
    if (raw === "opponent_active_is_basic") { const def = mainCard(`${context.opponentOwner}-active`); const meta = catalog(def) || {}; const s = String(def && def.evolutionStage || meta.evolutionStage || meta.evolution_stage || ""); return s === "" || s === "基礎" || s.toLowerCase().includes("basic"); }
    if (raw === "opponent_active_is_poisoned") { const def = mainCard(`${context.opponentOwner}-active`); return !!(def && def.poison); }
    if (raw === "opponent_active_is_burned") { const def = mainCard(`${context.opponentOwner}-active`); return !!(def && def.burn); }
    if (raw === "opponent_active_has_special_condition" || raw === "opponent_active_has_special_status") { const def = mainCard(`${context.opponentOwner}-active`); return !!(def && (def.poison || def.burn || (def.behaviorStatus && def.behaviorStatus !== ""))); }
    if (raw === "self_is_poisoned") return !!(context.attacker && context.attacker.poison);
    if (raw === "self_is_active" || raw === "self_active") return context.attacker && isActive(context.attacker.zoneId);
    if (raw === "opponent_active_is_ex" || raw === "opponent_active_is_pokemon_ex") { const def = mainCard(`${context.opponentOwner}-active`); return def && /ex$/i.test(String(def.name || "")); }
    if (raw === "self_has_pokemon_tool" || raw === "self_active_has_pokemon_tool" || raw === "self_has_pokemon_tool_attached") { return context.attacker && attached(context.attacker.zoneId).some((c) => { const meta = catalog(c) || {}; const ct = String(c.cardType || meta.cardType || meta.card_type || "").toLowerCase(); return ct.includes("tool") || ct.includes("道具"); }); }
    if (raw === "opponent_active_has_pokemon_tool") { const def = mainCard(`${context.opponentOwner}-active`); if (!def) return false; const defAttach = `${context.opponentOwner}-active-attach`; return cardsIn(defAttach).some((c) => { const meta = catalog(c) || {}; const ct = String(c.cardType || meta.cardType || meta.card_type || "").toLowerCase(); return ct.includes("tool") || ct.includes("道具"); }); }
    if (raw === "self_pokemon_knocked_out_last_opponent_turn" || raw === "self_pokemon_knocked_out_by_attack_last_opponent_turn" || raw === "hop_pokemon_knocked_out_by_attack_last_opponent_turn") return !!state().knockoutsLastOpponentTurn[context.owner];
    match = raw.match(/^self_hp_remaining_max_?(\d+)?$/);
    if (match) { const maxHp = Number(match[1] || 0); const meta = catalog(context.attacker) || {}; const fullHp = num(context.attacker && context.attacker.hp || meta.hp, 0); const dmg = context.attacker ? zoneDamage(context.attacker.zoneId) : 0; return maxHp > 0 ? (fullHp - dmg) <= maxHp : false; }
    if (raw === "stadium_in_play" || raw === "self_stadium_in_play") return !!mainCard("stadium");
    return false;
  }

  function swap(owner, targetZoneId) {
    const active = `${owner}-active`;
    if (!mainCard(active) || !mainCard(targetZoneId) || active === targetZoneId) return false;
    const before = call("snapshotCardZones", [], null);
    call("swapZoneDamage", [active, targetZoneId], undefined);
    call("swapZoneCards", [active, targetZoneId], undefined);
    call("swapZoneCards", [attachZone(active), attachZone(targetZoneId)], undefined);
    call("broadcastMoveSync", [mainZones(owner).flatMap((zoneId) => cardsIn(zoneId).map((card) => card.id)), before], undefined);
    render([active, targetZoneId, attachZone(active), attachZone(targetZoneId)]);
    return true;
  }

  effectHandlers.skip = async function skip() { return ok(); };
  effectHandlers.damage = async function damage(params, context) { return ok({ damage_modifier: num(params && params.amount, 0) - num(context.baseDamage, 0) }); };
  effectHandlers.draw = async function drawHandler(params, context) {
    const owner = ownerOf(params && params.player, context);
    let count = Math.max(1, num(params && params.count, 1));
    if (params && params.draw_to != null) {
      const target = num(params.draw_to, 0);
      const currentHand = cardsIn(handZone(owner)).length;
      count = Math.max(0, target - currentHand);
      if (count === 0) return ok({ message: "hand already at target" });
    }
    const pulled = draw(owner, count);
    return ok({ message: `${owner} draw ${pulled.length}` });
  };
  effectHandlers.coinFlipOrFail = async function coinFlipOrFail(params, context) {
    const results = await flips(num(params && params.flips, 1));
    if (results.some((item) => item === "反面")) {
      context.runtime.cancelBaseDamage = true;
      context.runtime.attackFailed = true;
      return ok({ success: false, cancel_damage: true, damage_modifier: -num(context.baseDamage, 0), message: "attack failed" });
    }
    return ok({ message: "heads" });
  };
  effectHandlers.coinFlipBonus = async function coinFlipBonus(params) {
    const results = await flips(num(params && params.flips, 1));
    const heads = results.filter((item) => item === "正面").length;
    return ok({ damage_modifier: heads * num(params && params.per_heads, 0), message: `heads ${heads}` });
  };
  effectHandlers.coinFlipUntilTails = async function coinFlipUntilTails(params) {
    let heads = 0;
    while (true) {
      const result = await flips(1);
      if (result[0] === "反面") break;
      heads += 1;
    }
    return ok({ damage_modifier: heads * num(params && params.per_heads, 0), message: `heads ${heads}` });
  };
  effectHandlers.damageRecoil = async function damageRecoil(params, context) {
    const zoneId = `${context.owner}-active`;
    const card = mainCard(zoneId) || context.attacker;
    if (!card) return ok({ success: false });
    call("adjustCardDamage", [card, num(params && params.self_damage, 0), zoneId], undefined);
    render([zoneId]);
    sync(card, zoneId);
    return ok();
  };
  effectHandlers.damagePlus = async function damagePlus(params, context) {
    const base = num(params && params.base, num(context.baseDamage, 0));
    const bonus = condition(params && params.condition, context) ? num(params && params.bonus, 0) : 0;
    return ok({ damage_modifier: base + bonus - num(context.baseDamage, 0) });
  };
  effectHandlers.damageMultiply = async function damageMultiply(params, context) {
    const filter = params && params.count_filter || {};
    const side = filter.side === "opponent" ? context.opponentOwner : context.owner;
    let count = mainZones(side).map(mainCard).filter(Boolean).filter((card) => matchFilter(card, filter)).length;
    if (params && params.include_self === false && context.attacker) {
      const attackerMatches = matchFilter(context.attacker, filter);
      if (attackerMatches) count = Math.max(0, count - 1);
    }
    return ok({ damage_modifier: num(params && params.base_per, 0) * count - num(context.baseDamage, 0) });
  };
  effectHandlers.heal = async function heal(params, context) {
    let zoneIds = targets(params && params.target, context);
    if (String(params && params.target || "").includes("choose")) zoneIds = await choose(zoneIds, 1, {
      title: "選擇治療目標",
      hint: "請選擇要治療的寶可夢",
      owner: context.owner
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    zoneIds.forEach((zoneId) => {
      const card = mainCard(zoneId);
      if (!card) return;
      call("adjustCardDamage", [card, -num(params && params.amount, 0), zoneId], undefined);
      sync(card, zoneId);
    });
    render(zoneIds);
    return ok();
  };
  effectHandlers.healAll = async function healAll(params, context) {
    const zoneIds = targets(params && params.target, context);
    zoneIds.forEach((zoneId) => {
      const card = mainCard(zoneId);
      if (!card) return;
      setDamage(zoneId, 0);
      sync(card, zoneId);
    });
    render(zoneIds);
    return ok();
  };
  effectHandlers.discardHand = async function discardHand(params, context) {
    const owner = ownerOf(params && params.player, context);
    const cards = cardsIn(handZone(owner));
    let count = num(params && params.count, 0);
    if (params && params.discard_to != null) {
      const target = num(params.discard_to, 0);
      count = Math.max(0, cards.length - target);
      if (count === 0) return ok({ success: true, message: "hand already at target" });
    }
    const shouldChoose = params && params.choose !== false;
    const selected = count === 0 ? cards : shouldChoose ? await choose(cards, count, {
      title: "選擇手牌",
      hint: `請選擇要丟棄的手牌（${count}張）`,
      owner,
      sourceZoneId: handZone(owner)
    }) : cards.sort(() => Math.random() - 0.5).slice(0, count);
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    move(selected, discardZone(owner), { faceUp: true });
    return ok({ success: selected.length > 0 || count === 0 });
  };
  effectHandlers.searchDeck = async function searchDeck(params, context) {
    const owner = ownerOf(params && params.player, context);
    let pool = cardsIn(deckZone(owner));
    const fromTop = num(params && params.from_top, 0);
    if (fromTop > 0) pool = pool.slice(0, fromTop);
    const matched = pool.filter((card) => matchFind(card, params && params.find, params && params.find_filter));
    const requested = Math.max(1, num(params && params.count, 1));
    const found = await choose(matched, requested, {
      title: fromTop > 0 ? `從牌庫上方${fromTop}張選擇卡片` : "從牌庫選擇卡片",
      hint: "請從牌庫中選擇要加入效果的卡片",
      owner,
      sourceZoneId: deckZone(owner),
      sortMode: "deck",
      minCount: params && (params.optional || params.up_to || params.choose_up_to) ? 0 : requested
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const target = String(params && params.to || "hand");
    if (target === "hand") move(found, handZone(owner), { faceUp: true });
    if (target === "bench") {
      found.forEach((card) => { const zoneId = benchZones(owner).find((z) => !mainCard(z)); if (zoneId) move([card], zoneId, { faceUp: true }); });
    }
    if (target === "active" && !mainCard(`${owner}-active`)) move(found.slice(0, 1), `${owner}-active`, { faceUp: true });
    if (target === "deck_top") putIntoDeck(owner, found, "top");
    if (params && params.discard_rest && fromTop > 0) {
      const foundIds = new Set(found.map((c) => c.id));
      const rest = pool.filter((c) => !foundIds.has(c.id));
      if (rest.length > 0) move(rest, discardZone(owner), { faceUp: true });
    }
    // 搜尋整個牌庫時預設要洗牌（from_top 只看頂部不洗）
    const shouldShuffle = params && params.shuffle_after !== undefined
      ? !!params.shuffle_after
      : fromTop <= 0;
    if (shouldShuffle) shuffle(owner);
    return ok({ success: found.length > 0 });
  };
  effectHandlers.recycleFromDiscard = async function recycle(params, context) {
    const matched = cardsIn(discardZone(context.owner)).filter((card) => matchFind(card, params && params.find, params && params.find_filter));
    const requested = Math.max(1, num(params && params.count, 1));
    const found = await choose(matched, requested, {
      title: "從棄牌區選擇卡片",
      hint: "請選擇要回收的卡片",
      owner: context.owner,
      sourceZoneId: discardZone(context.owner),
      minCount: params && (params.optional || params.up_to || params.choose_up_to) ? 0 : requested
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const target = String(params && params.to || "hand");
    if (target === "hand") move(found, handZone(context.owner), { faceUp: true });
    if (target === "deck") putIntoDeck(context.owner, found, "shuffle");
    if (target === "deck_top") putIntoDeck(context.owner, found, "top");
    if (target === "deck_bottom") putIntoDeck(context.owner, found, "bottom");
    return ok({ success: found.length > 0 });
  };
  effectHandlers.shuffleHandToDeck = async function shuffleHandToDeck(params, context) {
    const owner = ownerOf(params && params.player, context);
    const cards = cardsIn(handZone(owner));
    putIntoDeck(owner, cards, String(params && params.to || "deck") === "deck_top" ? "top" : String(params && params.to || "deck") === "deck_bottom" ? "bottom" : "shuffle");
    const td = params && params.then_draw;
    if (td && typeof td === "object") {
      let drawCount = num(td.count, 0);
      const opponentOwner = owner === "player1" ? "opponent" : "player1";
      if (td.if_self_prizes_remaining != null) {
        if (cardsIn(prizeZone(owner)).length === num(td.if_self_prizes_remaining, 0)) {
          drawCount = num(td.then_count, drawCount);
        }
      }
      if (td.if_opponent_prizes_remaining_lte != null) {
        if (cardsIn(prizeZone(opponentOwner)).length <= num(td.if_opponent_prizes_remaining_lte, 0)) {
          drawCount = num(td.then_count, drawCount);
        }
      }
      if (drawCount > 0) draw(owner, drawCount);
    } else if (num(td, 0) > 0) {
      draw(owner, num(td, 0));
    }
    return ok();
  };
  effectHandlers.switchSelf = async function switchSelf(params, context) {
    const occupied = benchZones(context.owner).filter((zoneId) => !!mainCard(zoneId));
    if (occupied.length === 0) return ok({ success: false });
    const selected = await choose(occupied, 1, { title: "選擇要換上場的寶可夢", hint: "請選擇備戰區的寶可夢與戰鬥區交換", owner: context.owner });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    return ok({ success: swap(context.owner, selected[0] || "") });
  };
  effectHandlers.attachEnergyFromDeck = async function attachFromDeck(params, context) {
    const matched = cardsIn(deckZone(context.owner)).filter((card) => matchEnergy(card, params && params.energy_type));
    const requested = Math.max(1, num(params && params.count, 1));
    const found = await choose(matched, requested, {
      title: "從牌庫選擇能量",
      hint: "請選擇要附加的能量卡",
      owner: context.owner,
      sourceZoneId: deckZone(context.owner),
      sortMode: "deck",
      minCount: params && (params.optional || params.up_to || params.choose_up_to) ? 0 : requested
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const target = String(params && params.to || "self_active");
    let zoneId;
    if (target === "self_active") { zoneId = `${context.owner}-active`; }
    else if (target === "self_bench") {
      const benchOccupied = benchZones(context.owner).filter((zone) => !!mainCard(zone));
      if (benchOccupied.length > 1) {
        const benchPicked = await choose(benchOccupied, 1, { title: "選擇要附加能量的備戰寶可夢", hint: "請選擇目標", owner: context.owner });
        if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
        zoneId = benchPicked[0];
      } else { zoneId = benchOccupied[0]; }
    }
    else if (target === "self_choose" || target === "self_any") {
      const occupied = mainZones(context.owner).filter((zone) => !!mainCard(zone));
      const picked = await choose(occupied, 1, { title: "選擇要附加能量的寶可夢", hint: "請選擇目標寶可夢", owner: context.owner });
      if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
      zoneId = picked[0];
    } else { zoneId = mainZones(context.owner).find((zone) => !!mainCard(zone)); }
    move(found, attachZone(zoneId), { faceUp: true });
    return ok({ success: found.length > 0 });
  };
  effectHandlers.attachEnergyFromDiscard = async function attachFromDiscard(params, context) {
    const matched = cardsIn(discardZone(context.owner)).filter((card) => matchEnergy(card, params && params.energy_type));
    const requested = Math.max(1, num(params && params.count, 1));
    const found = await choose(matched, requested, {
      title: "從棄牌區選擇能量",
      hint: "請選擇要附加的能量卡",
      owner: context.owner,
      sourceZoneId: discardZone(context.owner),
      minCount: params && (params.optional || params.up_to || params.choose_up_to) ? 0 : requested
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const toRef = String(params && params.to || "self_choose");
    let zoneId;
    if (toRef === "self_active") { zoneId = `${context.owner}-active`; }
    else { const occupied = mainZones(context.owner).filter((zone) => !!mainCard(zone)); const picked = await choose(occupied, 1, { title: "選擇要附加能量的寶可夢", hint: "請選擇目標寶可夢", owner: context.owner }); if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" }); zoneId = picked[0]; }
    move(found, attachZone(zoneId), { faceUp: true });
    return ok({ success: found.length > 0 });
  };
  effectHandlers.attachEnergyFromHand = async function attachFromHand(params, context) {
    const matched = cardsIn(handZone(context.owner)).filter((card) => matchEnergy(card, params && params.energy_type));
    const requested = Math.max(1, num(params && params.count, 1));
    const found = await choose(matched, requested, {
      title: "從手牌選擇能量",
      hint: "請選擇要附加的能量卡",
      owner: context.owner,
      sourceZoneId: handZone(context.owner),
      minCount: params && (params.optional || params.up_to || params.choose_up_to) ? 0 : requested
    });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const toRef = String(params && params.to || "self_choose");
    let zoneId;
    if (toRef === "self_active") { zoneId = `${context.owner}-active`; }
    else { const occupied = mainZones(context.owner).filter((zone) => !!mainCard(zone)); const picked = await choose(occupied, 1, { title: "選擇要附加能量的寶可夢", hint: "請選擇目標寶可夢", owner: context.owner }); if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" }); zoneId = picked[0]; }
    move(found, attachZone(zoneId), { faceUp: true });
    return ok({ success: found.length > 0 });
  };
  effectHandlers.moveEnergy = async function moveEnergy(params, context) {
    const fromZones = mainZones(context.owner).filter((zoneId) => attached(zoneId).some((card) => matchEnergy(card, params && params.energy_type)));
    if (fromZones.length === 0) return ok({ success: false });
    const fromPicked = await choose(fromZones, 1, { title: "選擇要移動能量的來源", hint: "請選擇提供能量的寶可夢", owner: context.owner });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    const selected = attachedEnergy(fromPicked, params && params.energy_type, Math.max(1, num(params && params.count, 1)));
    if (selected.length === 0) return ok({ success: false });
    const toZones = mainZones(context.owner).filter((zoneId) => !!mainCard(zoneId) && zoneId !== fromPicked[0]);
    const toPicked = await choose(toZones, 1, { title: "選擇要接收能量的目標", hint: "請選擇接收能量的寶可夢", owner: context.owner });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    move(selected, attachZone(toPicked[0]), { faceUp: true });
    return ok({ success: selected.length > 0 });
  };
  effectHandlers.preventStatus = async function preventStatus(params) { return ok({ message: `prevent ${arr(params && params.statuses).join(",")}` }); };
  effectHandlers.freeRetreat = async function freeRetreat() { return ok({ message: "free retreat" }); };
  effectHandlers.energyProvide = async function energyProvide(params) { return ok({ message: String(params && params.provides || "") }); };
  effectHandlers.fail = async function fail(params, context) {
    if (context && context.runtime) context.runtime.attackFailed = true;
    return ok({ success: true, message: "attack failed" });
  };
  effectHandlers.shuffleSelfToDeck = async function shuffleSelfToDeck(params, context) {
    const zoneId = context && context.attacker && context.attacker.zoneId;
    if (!zoneId) return ok({ success: false });
    const card = mainCard(zoneId);
    if (!card) return ok({ success: false });
    const attachedCards = attached(zoneId);
    const allCards = [card].concat(attachedCards);
    putIntoDeck(context.owner, allCards, "shuffle");
    render();
    return ok({ success: true, message: "shuffled self to deck" });
  };
  effectHandlers.sequence = async function sequence(params, context) {
    let damage = 0;
    for (const step of arr(params && params.steps)) {
      if (!step || !step.handler || typeof global.executeEffectSpec !== "function") continue;
      const result = await global.executeEffectSpec({ status: "ready", handler: step.handler, params: step.params || {} }, context);
      if (result && result.cancelled) return ok({ success: false, cancelled: true, message: result.message || "cancelled", damage_modifier: damage });
      damage += num(result && result.damage_modifier, 0);
      if (result && result.cancel_damage) return ok({ success: false, cancel_damage: true, damage_modifier: damage });
    }
    return ok({ damage_modifier: damage });
  };
  effectHandlers.conditional = async function conditional(params, context) {
    const branch = condition(params && params.if, context) ? params && params.then : params && params.else;
    if (!branch || !branch.handler || typeof global.executeEffectSpec !== "function") return ok();
    return global.executeEffectSpec({ status: "ready", handler: branch.handler, params: branch.params || {} }, context);
  };

  effectHandlers.coinFlipEffect = async function coinFlipEffect(params, context) {
    const results = await flips(num(params && params.flips, 1));
    const action = results.some((item) => item === "正面") ? params && params.on_heads : params && params.on_tails;
    if (action && typeof action === "object" && action.handler && typeof global.executeEffectSpec === "function") {
      return global.executeEffectSpec({ status: "ready", handler: action.handler, params: action.params || {} }, context);
    }
    if (String(action || "").startsWith("apply_status:")) {
      return effectHandlers.applyStatus({ target: "opponent_active", status: String(action).split(":")[1] || "" }, context);
    }
    return ok({ message: String(action || "none") });
  };

  effectHandlers.applyStatus = async function applyStatusHandler(params, context) {
    const zoneId = targets(params && params.target, context)[0];
    return ok({ success: applyStatus(mainCard(zoneId), params && params.status, context) });
  };

  effectHandlers.applyStatusMulti = async function applyStatusMulti(params, context) {
    const zoneId = targets(params && params.target, context)[0];
    const card = mainCard(zoneId);
    let applied = 0;
    arr(params && params.statuses).forEach((value) => { if (applyStatus(card, value, context)) applied += 1; });
    return ok({ success: applied > 0, message: `status ${applied}` });
  };

  effectHandlers.discardEnergy = async function discardEnergy(params, context) {
    const from = String(params && params.from || "");
    if (from === "opponent_active") {
      const targetCard = mainCard(`${context.opponentOwner}-active`);
      if (targetCard && typeof global.isAttackEffectPreventedOnTarget === "function") {
        const blocked = global.isAttackEffectPreventedOnTarget(context.attacker, targetCard, {
          attack: context.attack,
          interaction: "effect"
        });
        if (blocked) return ok({ success: false });
      }
    }
    const sourceZones = from === "self_active" ? [`${context.owner}-active`] : from === "opponent_active" ? [`${context.opponentOwner}-active`] : mainZones(context.owner).filter((zoneId) => !!mainCard(zoneId));
    const rawType = String(params && params.energy_type || "any").trim().toLowerCase();
    const rawCount = num(params && params.count, 1);
    // count=0 或 energy_type=all 表示丟棄全部能量
    const discardAll = rawCount === 0 || rawType === "all";
    const selected = discardAll
      ? sourceZones.flatMap((zoneId) => attached(zoneId).filter((card) => matchEnergy(card, params && params.energy_type)))
      : attachedEnergy(sourceZones, params && params.energy_type, Math.max(1, rawCount));
    move(selected, discardZone(from === "opponent_active" ? context.opponentOwner : context.owner), { faceUp: true });
    return ok({ success: selected.length > 0 });
  };

  effectHandlers.switchOpponent = async function switchOpponent(params, context) {
    const targetCard = mainCard(`${context.opponentOwner}-active`);
    if (targetCard && typeof global.isAttackEffectPreventedOnTarget === "function") {
      const blocked = global.isAttackEffectPreventedOnTarget(context.attacker, targetCard, {
        attack: context.attack,
        interaction: "effect"
      });
      if (blocked) return ok({ success: false });
    }
    const occupied = benchZones(context.opponentOwner).filter((zoneId) => !!mainCard(zoneId));
    if (occupied.length === 0) return ok({ success: false });
    const chooser = String(params && params.choose_by || "self") === "opponent" ? context.opponentOwner : context.owner;
    const selected = await choose(occupied, 1, { title: "選擇對手要換上場的寶可夢", hint: "請選擇對手備戰區的寶可夢與戰鬥區交換", owner: chooser });
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    return ok({ success: swap(context.opponentOwner, selected[0] || "") });
  };

  effectHandlers.reduceDamage = async function reduceDamage(params, context, spec) {
    if (spec && spec.source_type === "attack" && context && context.attacker && typeof global.registerEffectProtection === "function") {
      global.registerEffectProtection({
        targetCard: context.attacker,
        sourceCard: context.attacker,
        sourceFilters: { relativeOwner: "opponent", kind: "attack" },
        reduceDamage: num(params && params.amount, 0),
        duration: "opponent_next_turn"
      }, context);
    }
    return ok({ message: `reduce ${num(params && params.amount, 0)}` });
  };

  effectHandlers.damageBench = async function damageBenchFinal(params, context) {
    let zoneIds = targets(params && params.target, context);
    if (String(params && params.target || "").includes("choose")) {
      zoneIds = await choose(zoneIds, num(params && params.choose_count, 1), {
        title: "選擇備戰寶可夢",
        hint: "請選擇要受到傷害的寶可夢",
        owner: context.owner
      });
    }
    if (consumeChoiceCancelled()) return ok({ success: false, cancelled: true, message: "cancelled" });
    zoneIds.forEach((zoneId) => {
      const card = mainCard(zoneId);
      if (!card) return;
      let damage = num(params && params.amount, 0);
      if (damage > 0 && typeof global.applyIncomingAttackModifiers === "function") {
        const modified = global.applyIncomingAttackModifiers(context.attacker, card, damage, {
          attack: context.attack,
          source: "attack",
          interaction: "damage",
          targetZoneId: zoneId
        });
        damage = modified && Number.isFinite(modified.damage) ? modified.damage : damage;
      }
      if (damage > 0) {
        call("adjustCardDamage", [card, damage, zoneId], undefined);
        sync(card, zoneId);
      }
    });
    render(zoneIds);
    return ok();
  };

  global.effectHandlers = effectHandlers;
  global.effectHandlerUtils = {
    ok, num, arr, call, state, cardsIn, mainCard, attachZone, attached, benchZones, mainZones,
    prizeZone, deckZone, handZone, discardZone, ownerOf, zoneDamage, setDamage, render, sync, catalog,
    attr, isEnergy, sameText, statusName, move, draw, shuffle, putIntoDeck, matchEnergy, matchFilter,
    matchFind, targets, choose, attachedEnergy, applyStatus: applyStatus, flips, condition, swap, effectHandlers
  };
})(typeof window !== "undefined" ? window : globalThis);
