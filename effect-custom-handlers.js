(function initEffectCustomHandlers(global) {
  "use strict";

  const utils = global.effectHandlerUtils || {};
  const customHandlers = {};

  function ok(extra) { return typeof utils.ok === "function" ? utils.ok(extra) : Object.assign({ success: true, damage_modifier: 0, message: "" }, extra || {}); }
  function num(value, fallback) { return typeof utils.num === "function" ? utils.num(value, fallback || 0) : (Number.isFinite(Number(value)) ? Number(value) : (fallback || 0)); }
  function arr(value) { return typeof utils.arr === "function" ? utils.arr(value) : (Array.isArray(value) ? value : []); }
  function call(name, args, fallback) { return typeof utils.call === "function" ? utils.call(name, args, fallback) : fallback; }
  function mainZones(owner) { return typeof utils.mainZones === "function" ? utils.mainZones(owner) : []; }
  function mainCard(zoneId) { return typeof utils.mainCard === "function" ? utils.mainCard(zoneId) : null; }
  function attached(zoneId) { return typeof utils.attached === "function" ? utils.attached(zoneId) : []; }
  function attachZone(zoneId) { return typeof utils.attachZone === "function" ? utils.attachZone(zoneId) : ""; }
  function move(cards, toZoneId, options) { return typeof utils.move === "function" ? utils.move(cards, toZoneId, options) : []; }
  function draw(owner, count) { return typeof utils.draw === "function" ? utils.draw(owner, count) : []; }
  function putIntoDeck(owner, cards, where) { return typeof utils.putIntoDeck === "function" ? utils.putIntoDeck(owner, cards, where) : []; }
  function attr(card) { return typeof utils.attr === "function" ? utils.attr(card) : ""; }
  function isEnergy(card) { return typeof utils.isEnergy === "function" ? utils.isEnergy(card) : false; }
  function state() { return typeof utils.state === "function" ? utils.state() : { attackLocks: [], protections: [], knockoutsLastOpponentTurn: { player1: false, opponent: false } }; }
  function handZone(owner) { return call("getOwnerHandZone", [owner], `${owner}-hand`); }
  function discardZone(owner) { return call("getOwnerDiscardZone", [owner], `${owner}-discard`); }
  function zoneDamage(zoneId) { return num(call("getZoneDamage", [zoneId], 0), 0); }
  function currentTurnNumber() { return num(global.boardState && global.boardState.state && global.boardState.state.turn && global.boardState.state.turn.turnNumber, 0); }
  function isMainZone(zoneId) { return /^(player1|opponent)-(active|bench-\d+)$/.test(String(zoneId || "")); }
  function stage(card) {
    const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
    return String(card && (card.evolutionStage || card.evolution_stage) || meta.evolutionStage || meta.evolution_stage || "").trim();
  }
  function hp(card) {
    const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
    return num(card && card.hp || meta.hp, 0);
  }
  function evolutionChain(card) {
    const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
    return arr(card && (card.evolutionChain || card.evolution_chain) || meta.evolutionChain || meta.evolution_chain)
      .map((name) => String(name || "").trim())
      .filter(Boolean);
  }
  function isBasicPokemon(card) {
    const value = stage(card).toLowerCase();
    return !value || value.includes("basic") || value.includes("基礎");
  }
  function isStage2Pokemon(card) {
    const value = stage(card).toLowerCase();
    return value.includes("stage2") || value.includes("2階");
  }
  function resolveRareCandyBasicName(card) {
    if (typeof global.resolveRareCandyBasicNameForEntry === "function") {
      const resolved = String(global.resolveRareCandyBasicNameForEntry(card) || "").trim();
      if (resolved) return resolved;
    }
    const chain = evolutionChain(card);
    const selfName = String(card && card.name || "").trim();
    if (!chain.length) return "";
    const lastIndex = typeof chain.findLastIndex === "function"
      ? chain.findLastIndex((name) => String(name || "").trim() === selfName)
      : chain.lastIndexOf(selfName);
    if (lastIndex >= 2) return String(chain[0] || "").trim();
    if (lastIndex === -1 && chain.length >= 3) return String(chain[0] || "").trim();
    return "";
  }
  function rareCandyTargets(owner, stage2Card) {
    const basicName = resolveRareCandyBasicName(stage2Card);
    if (!basicName) return [];
    return mainZones(owner)
      .map(mainCard)
      .filter((card) => card && isBasicPokemon(card) && String(card.name || "").trim() === basicName);
  }
  async function promptChoice(cards, config) {
    const list = arr(cards).filter(Boolean);
    if (!list.length) return [];
    if (typeof global.promptEffectCardChoice !== "function") {
      return list.slice(0, Math.max(1, num(config && config.maxCount, 1)));
    }
    return arr(await global.promptEffectCardChoice({
      title: String(config && config.title || "選擇卡片"),
      hint: String(config && config.hint || ""),
      cards: list,
      minCount: Math.max(0, num(config && config.minCount, 1)),
      maxCount: Math.max(1, num(config && config.maxCount, 1)),
      owner: String(config && config.owner || list[0].owner || "player1"),
      sourceZoneId: String(config && config.sourceZoneId || list[0].zoneId || "effect-choice-view"),
      sortMode: String(config && config.sortMode || ""),
      allowCancel: !config || config.allowCancel !== false,
      confirmText: String(config && config.confirmText || "確認")
    }));
  }
  function remainingHp(card) { return Math.max(0, hp(card) - zoneDamage(card && card.zoneId)); }
  function renderAndSync(card) {
    if (!card) return;
    call("broadcastCardStats", [card, card.zoneId], undefined);
    call("renderBoard", [{ zoneIds: [card.zoneId], overlay: false }], undefined);
  }
  function moveWithBroadcast(cardsToMove, toZoneId, extraZoneIds) {
    const moved = arr(cardsToMove).filter(Boolean);
    if (!moved.length || !toZoneId) return [];
    const before = call("snapshotCardZones", [], null);
    const sourceZones = [...new Set(moved.map((card) => card.zoneId).filter(Boolean))];
    moved.forEach((card) => {
      call("moveCardToZone", [card, toZoneId], undefined);
      card.isFaceUp = true;
    });
    const ids = moved.map((card) => card.id);
    const zoneIds = [...new Set(sourceZones.concat([toZoneId]).concat(arr(extraZoneIds)).filter(Boolean))];
    if (before && typeof global.renderBoardForMovedCards === "function") {
      global.renderBoardForMovedCards(before, ids, { extraZoneIds: zoneIds });
    } else {
      call("renderBoard", [{ zoneIds, overlay: false }], undefined);
    }
    call("broadcastMoveSync", [ids, before], undefined);
    call("broadcastZoneStats", [sourceZones.filter((zoneId) => isMainZone(zoneId))], undefined);
    return moved;
  }

  function deckZone(owner) { return call("getOwnerDeckZone", [owner], `${owner}-deck`); }
  function cardsIn(zoneId) { return arr(call("getCardsInZone", [zoneId], [])); }
  function resolveProvidedEnergyTypes(card, hostCard) {
    const provided = arr(call("resolveEnergyProvides", [card, hostCard], []))
      .map((type) => String(type || "").trim().toLowerCase());
    if (provided.length) return provided;
    const fallback = String(card && (card.elementType || card.attribute) || "").trim().toLowerCase();
    return fallback ? [fallback] : [];
  }
  function providesEnergyType(card, hostCard, energyType) {
    if (!isEnergy(card)) return false;
    const target = String(energyType || "").trim().toLowerCase();
    if (!target) return true;
    return resolveProvidedEnergyTypes(card, hostCard).some((type) => !type || type === target);
  }
  function exactName(card) { return String(card && card.name || "").trim(); }
  function totalBenchedPokemonCount() {
    return ["player1", "opponent"]
      .flatMap((owner) => mainZones(owner).slice(1))
      .map(mainCard)
      .filter(Boolean)
      .length;
  }
  function distinctTargets(cards) {
    const seen = new Set();
    return arr(cards).filter((card) => {
      const id = Number(card && card.id);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  async function chooseOpponentPokemonTargets(context, count, config) {
    const available = mainZones(context.opponentOwner)
      .map(mainCard)
      .filter(Boolean);
    const unique = distinctTargets(available);
    if (!unique.length) return [];
    const desired = Math.max(1, num(count, 1));
    const limit = Math.min(desired, unique.length);
    return promptChoice(unique, {
      title: String(config && config.title || "選擇對手的寶可夢"),
      hint: String(config && config.hint || ""),
      owner: context.opponentOwner,
      sourceZoneId: unique[0].zoneId,
      minCount: limit,
      maxCount: limit,
      confirmText: String(config && config.confirmText || "確認目標")
    });
  }
  function getTotalEnergyUnits(energyCards, hostCard) {
    let total = 0;
    for (let i = 0; i < energyCards.length; i++) {
      const unitCount = typeof global.getEnergyUnitCount === "function"
        ? global.getEnergyUnitCount(energyCards[i], hostCard) : 1;
      total += Math.max(1, unitCount);
    }
    return total;
  }
  async function chooseAttachedEnergyCards(zoneId, requiredUnits, owner, title, hostCard) {
    const energies = attached(zoneId).filter((card) => isEnergy(card) || (function() {
      const type = String(card && card.cardType || "").toLowerCase();
      return type.includes("energy") || type.includes("能量");
    })());
    const desired = Math.max(1, num(requiredUnits, 1));
    const totalUnits = getTotalEnergyUnits(energies, hostCard);
    if (totalUnits < desired) return [];
    if (energies.length === 1 && totalUnits >= desired) return energies;
    // 讓玩家自由選擇，但選到的能量單位總和必須 >= desired
    // 使用 minCount=1 讓玩家至少選1張，最多全選
    const selected = await promptChoice(energies, {
      title: String(title || "選擇要丟棄的能量"),
      hint: `請選擇要丟棄的能量（需提供至少 ${desired} 單位能量）`,
      owner,
      sourceZoneId: attachZone(zoneId),
      minCount: 1,
      maxCount: energies.length,
      confirmText: "確認丟棄"
    });
    if (!selected || !selected.length) return [];
    const selectedUnits = getTotalEnergyUnits(selected, hostCard);
    if (selectedUnits < desired) {
      if (typeof global.showToast === "function") global.showToast(`所選能量單位不足（需要 ${desired}，已選 ${selectedUnits}）`, "warn", 1800);
      return [];
    }
    return selected;
  }
  async function dealDamageToChosenOpponentPokemon(params, context) {
    const amount = Math.max(0, num(params && params.damage, 0));
    if (!amount) return ok({ success: false });
    const targets = await chooseOpponentPokemonTargets(context, params && params.target_count || 1, {
      title: String(params && params.title || "選擇傷害目標"),
      hint: String(params && params.hint || ""),
      confirmText: String(params && params.confirmText || "造成傷害")
    });
    if (!targets.length) return ok({ success: false, cancelled: true, message: "cancelled" });
    const affectedZones = [];
    targets.forEach((target) => {
      const zoneId = String(target.zoneId || "");
      if (!zoneId) return;
      let damage = amount;
      if (typeof global.applyIncomingAttackModifiers === "function") {
        const modified = global.applyIncomingAttackModifiers(context.attacker, target, damage, {
          attack: context.attack,
          source: "attack",
          interaction: "damage",
          targetZoneId: zoneId
        });
        damage = modified && Number.isFinite(modified.damage) ? modified.damage : damage;
      }
      if (damage <= 0) return;
      call("adjustCardDamage", [target, damage, zoneId], undefined);
      call("broadcastCardStats", [target, zoneId], undefined);
      affectedZones.push(zoneId);
    });
    if (affectedZones.length) {
      call("renderBoard", [{ zoneIds: affectedZones, overlay: false }], undefined);
    }
    return ok({ success: affectedZones.length > 0 });
  }

  function register(name, fn) { customHandlers[name] = fn; }
  function keyOf(spec) {
    if (!spec) return "";
    const effect = String(spec.params && spec.params.effect || "").trim();
    return effect || String(spec.handler || "").trim();
  }
  function showFallback(spec) {
    const text = String(spec && spec.params && (spec.params.description || spec.params.effect) || spec && spec.notes || "").trim();
    if (text) call("showToast", ["效果尚未實作: " + text, "warn", 2200], undefined);
    return ok({ success: false, message: text || "unimplemented custom handler" });
  }
  function firstOwnBench(owner) { return mainZones(owner).find((zoneId) => zoneId !== `${owner}-active` && !!mainCard(zoneId)); }
  function registerSelfProtection(effect, builder) {
    register(effect, async function(params, context) {
      if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
      const base = typeof builder === "function" ? builder(params, context) : {};
      global.registerEffectProtection(Object.assign({
        effect,
        targetCard: context.attacker,
        sourceCard: context.attacker,
        duration: "opponent_next_turn"
      }, base), context);
      return ok();
    });
  }

  register("return_self_and_all_attached_cards_to_deck_and_shuffle", async function(params, context) {
    const zoneId = context.attacker && context.attacker.zoneId;
    const cards = [context.attacker].concat(attached(zoneId)).filter(Boolean);
    // putIntoDeck 內部已包含 moveCardToZone + reorderDeck + broadcastMoveSync + render
    putIntoDeck(context.owner, cards, "shuffle");
    call("renderBoard", [{ zoneIds: [zoneId, attachZone(zoneId), deckZone(context.owner)], overlay: false }], undefined);
    return ok({ damage_modifier: num(params && params.damage, 0) - num(context.baseDamage, 0) });
  });

  register("heal_1_own_ancient_benched_pokemon", async function(params, context) {
    // 篩選古代寶可夢（排除自己）
    const isAncientCard = function(card) {
      const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
      const text = [card && card.name, card && card.ruleText, card && card.effectText, meta.ruleText, meta.rule_text, meta.effectText, meta.effect_text].map(function(v) { return String(v || "").toLowerCase(); }).join(" ");
      return text.includes("古代") || text.includes("ancient");
    };
    const candidates = mainZones(context.owner).map(mainCard).filter(function(card) {
      return card && card !== context.attacker && isAncientCard(card) && zoneDamage(card.zoneId) > 0;
    });
    if (!candidates.length) return ok({ success: false, message: "沒有受傷的古代寶可夢" });
    const selected = await promptChoice(candidates, { title: "選擇要治療的古代寶可夢", hint: "請選擇1隻己方受傷的古代寶可夢", owner: context.owner, maxCount: 1 });
    const target = selected[0];
    if (!target) return ok({ success: false });
    call("adjustCardDamage", [target, -num(params && params.amount, 0), target.zoneId], undefined);
    renderAndSync(target);
    return ok();
  });

  register("attach_up_to_2_basic_fighting_energy_from_discard_to_own_benched_any_way", async function(params, context) {
    var discard = call("getCardsInZone", [call("getOwnerDiscardZone", [context.owner], `${context.owner}-discard`)], []);
    var maxCount = Math.max(1, num(params && params.count, 2));
    var fightingEnergy = arr(discard).filter(function(card) { return isEnergy(card) && attr(card) === "Fighting"; });
    if (fightingEnergy.length === 0) return ok({ success: false, message: "棄牌區沒有格鬥能量" });
    // 讓玩家選擇要附加的能量（最多 maxCount 張，可少選）
    var selectedEnergy = await promptChoice(fightingEnergy, {
      title: "選擇要附加的格鬥能量",
      hint: "最多選擇 " + maxCount + " 張",
      owner: context.owner,
      maxCount: maxCount,
      minCount: 0
    });
    if (!selectedEnergy || selectedEnergy.length === 0) return ok({ success: false, message: "cancelled" });
    var benchTargets = mainZones(context.owner).filter(function(zoneId) { return zoneId !== (context.owner + "-active") && !!mainCard(zoneId); });
    if (benchTargets.length === 0) return ok({ success: false, message: "備戰區沒有寶可夢" });
    // 逐張讓玩家選擇要附加到哪隻備戰寶可夢
    for (var i = 0; i < selectedEnergy.length; i++) {
      var targetPicked = await promptChoice(benchTargets.map(mainCard).filter(Boolean), {
        title: "選擇要附加能量的備戰寶可夢 (" + (i + 1) + "/" + selectedEnergy.length + ")",
        hint: "選擇接收此格鬥能量的寶可夢",
        owner: context.owner,
        maxCount: 1
      });
      var target = targetPicked && targetPicked[0];
      if (target && target.zoneId) {
        move([selectedEnergy[i]], attachZone(target.zoneId), { faceUp: true });
      }
    }
    return ok({ damage_modifier: num(params && params.damage, 0) - num(context.baseDamage, 0) });
  });

  register("bonus_if_any_own_benched_has_damage_counters", async function(params, context) {
    const hasDamaged = mainZones(context.owner).slice(1).some(function(zoneId) {
      return mainCard(zoneId) && zoneDamage(zoneId) > 0;
    });
    return ok({ damage_modifier: hasDamaged ? num(params && params.bonus, 0) : 0 });
  });

  register("deal_170_then_optional_search_any_1_to_hand", async function(params, context) {
    if (typeof global.executeEffectSpec !== "function") return ok();
    const result = await global.executeEffectSpec({
      status: "ready",
      handler: "searchDeck",
      params: {
        player: "self",
        find: "any",
        count: 1,
        to: "hand",
        shuffle_after: true
      }
    }, context);
    return result && result.cancelled ? ok({ success: false, cancelled: true, message: "cancelled" }) : ok();
  });

  register("bonus_damage_per_both_players_bench_pokemon", async function(params, context) {
    const base = num(params && params.base, num(context && context.baseDamage, 0));
    const perPokemon = num(params && params.per_pokemon, 0);
    const totalDamage = base + totalBenchedPokemonCount() * perPokemon;
    return ok({ damage_modifier: totalDamage - num(context && context.baseDamage, 0) });
  });
  register("snipe_one_opponent_pokemon", async function(params, context) {
    return dealDamageToChosenOpponentPokemon({
      damage: num(params && (params.damage || params.place_damage_to_opponent_any_pokemon), 0),
      target_count: 1,
      title: "\u9078\u64c7\u5c0d\u624b\u5834\u4e0a\u76841\u96bb\u5bf6\u53ef\u5922",
      hint: "\u53ef\u9078\u64c7\u5c0d\u624b\u6230\u9b25\u5340\u6216\u5099\u6230\u5340\u7684\u5bf6\u53ef\u5922\u3002"
    }, context);
  });

  register("damage_choose_any_opponent_pokemon", customHandlers.snipe_one_opponent_pokemon);
  register("place_damage_to_opponent_any_pokemon", customHandlers.snipe_one_opponent_pokemon);

  register("discard_2_energy_from_self_then_damage_two_opponent_pokemon", async function(params, context) {
    const attacker = context && context.attacker;
    if (!attacker || !attacker.zoneId) return ok({ success: false });
    const discardCount = Math.max(1, num(params && params.discard_count, 2));
    // 先檢查能量單位是否足夠（特殊能量可提供多單位）
    const allEnergy = attached(attacker.zoneId).filter((card) => isEnergy(card) || (function() {
      const type = String(card && card.cardType || "").toLowerCase();
      return type.includes("energy") || type.includes("能量");
    })());
    const totalUnits = getTotalEnergyUnits(allEnergy, attacker);
    if (totalUnits < discardCount) {
      if (typeof global.showToast === "function") global.showToast("附加的能量不足，無法使用此招式", "warn", 1800);
      if (context && context.runtime) context.runtime.attackFailed = true;
      return ok({ success: false, cancelled: true, message: "not enough energy" });
    }
    const selectedEnergy = await chooseAttachedEnergyCards(attacker.zoneId, discardCount, context.owner, "選擇要丟棄的能量", attacker);
    if (!selectedEnergy || !selectedEnergy.length) {
      if (context && context.runtime) context.runtime.attackFailed = true;
      return ok({ success: false, cancelled: true, message: "cancelled" });
    }
    move(selectedEnergy, discardZone(context.owner), { faceUp: true });
    return dealDamageToChosenOpponentPokemon({
      damage: num(params && params.damage, 0),
      target_count: num(params && params.target_count, 2),
      title: "\u9078\u64c7\u8981\u53d7\u5230\u50b7\u5bb3\u7684\u5bf6\u53ef\u5922",
      hint: "\u8acb\u9078\u64c7\u5c0d\u624b\u5834\u4e0a\u7684\u5bf6\u53ef\u5922\uff1b\u53ef\u9078\u6230\u9b25\u5340\u6216\u5099\u6230\u5340\u3002"
    }, context);
  });

  register("if_own_total_energy_3_or_more_bonus_70_ignore_weakness", async function(params, context) {
    const total = mainZones(context.owner).reduce(function(sum, zoneId) { return sum + attached(zoneId).filter(function(c) { return isEnergy(c); }).length; }, 0);
    const threshold = num(params && params.threshold, 3);
    if (total >= threshold) {
      // 設定無視弱點旗標
      if (context && context.runtime) context.runtime.ignoreWeakness = true;
      return ok({ damage_modifier: num(params && params.bonus, 0) });
    }
    return ok({ damage_modifier: 0 });
  });

  register("bonus_damage_equal_to_self_damage_counters_times_10", async function(params, context) {
    const counters = num(call("getZoneDamage", [context.attacker && context.attacker.zoneId], 0), 0) / 10;
    return ok({ damage_modifier: num(params && params.base, 0) + counters * num(params && params.per_counter, 0) - num(context.baseDamage, 0) });
  });

  register("if_opponent_active_is_ex_or_v_bonus_80", async function(params, context) {
    const defender = context.defender;
    var defName = String(defender && defender.name || "").trim();
    var defRule = String(defender && defender.ruleText || "").toLowerCase();
    var defSub = String(defender && defender.subtype || "").toLowerCase();
    var isEx = /ex$/i.test(defName) || defRule.includes("ex") || defSub.includes("ex");
    var isV = /\sV$/i.test(defName) || /\sVSTAR$/i.test(defName) || /\sVMAX$/i.test(defName) || defRule.includes("pokémon v") || defSub.includes("v ");
    const bonus = (isEx || isV) ? num(params && params.bonus, 0) : 0;
    return ok({ damage_modifier: num(params && params.base, 0) + bonus - num(context.baseDamage, 0) });
  });

  register("damage_times_20_per_own_pokemon_in_play", async function(params, context) {
    const count = mainZones(context.owner).map(mainCard).filter(Boolean).length;
    return ok({ damage_modifier: count * num(params && params.per_count, 0) - num(context.baseDamage, 0) });
  });

  register("cannot_use_same_attack_next_turn", async function(params, context) {
    state().attackLocks.push({
      owner: context.owner,
      syncId: context.attacker && context.attacker.syncId,
      zoneId: context.attacker && context.attacker.zoneId,
      attackName: String(params && params.attack_name || context.attack && context.attack.name || "").trim(),
      active: false
    });
    return ok();
  });

  register("if_opponent_active_has_damage_counters_bonus_100", async function(params, context) {
    const damaged = num(call("getZoneDamage", [`${context.opponentOwner}-active`], 0), 0) > 0;
    return ok({ damage_modifier: num(params && params.base, 0) + (damaged ? num(params && params.bonus, 0) : 0) - num(context.baseDamage, 0) });
  });

  register("both_players_shuffle_hand_to_bottom_then_draw_equal_to_prizes_remaining", async function(params, context) {
    [context.owner, context.opponentOwner].forEach((owner) => {
      const hand = arr(call("getCardsInZone", [call("getOwnerHandZone", [owner], `${owner}-hand`)], []));
      // 「重洗放回牌庫下方」：手牌隨機排列後放到牌庫底部
      const shuffledHand = typeof global.fisherYatesShuffle === "function"
        ? global.fisherYatesShuffle(hand)
        : [...hand].sort(() => Math.random() - 0.5);
      putIntoDeck(owner, shuffledHand, "bottom");
      draw(owner, arr(call("getCardsInZone", [call("getOwnerPrizeZone", [owner], `${owner}-prize`)], [])).length);
    });
    return ok();
  });

  register("draw_until_5_or_8_if_own_pokemon_was_knocked_out_last_opponent_turn", async function(params, context) {
    const target = state().knockoutsLastOpponentTurn[context.owner] ? num(params && params.bonus, 8) : num(params && params.normal, 5);
    const current = arr(call("getCardsInZone", [call("getOwnerHandZone", [context.owner], `${context.owner}-hand`)], [])).length;
    if (current < target) draw(context.owner, target - current);
    return ok();
  });

  register("return_1_own_pokemon_to_hand_discard_all_other_attached_cards", async function(params, context) {
    const candidates = mainZones(context.owner).map(mainCard).filter(Boolean);
    if (!candidates.length) return ok({ success: false });
    const selected = await promptChoice(candidates, { title: "選擇要收回手牌的寶可夢", hint: "該寶可夢會回到手牌，身上的附加卡丟棄", owner: context.owner, maxCount: 1 });
    const card = selected[0];
    if (!card) return ok({ success: false });
    const zoneId = card.zoneId;
    const attachCards = attached(zoneId);
    move([card], handZone(context.owner), { faceUp: true });
    if (attachCards.length) move(attachCards, discardZone(context.owner), { faceUp: true });
    return ok();
  });

  register("custom_BeedrillEx_Attack1", async function(params, context) {
    const count = mainZones(context.owner).map(mainCard).filter((card) => card && String(card.name || "").includes("大針蜂")).length;
    return ok({ damage_modifier: count * 110 - num(context.baseDamage, 0), message: String(params && params.description || "") });
  });

  register("draw_cards_when_played_from_hand_to_evolve", async function(params, context) {
    const sourceCard = context.attacker;
    if (!sourceCard || num(sourceCard.playedFromHandToEvolveTurn, 0) !== currentTurnNumber()) {
      return ok({ success: false, message: "not evolved from hand this turn" });
    }
    draw(context.owner, num(params && params.count, 0));
    return ok();
  });

  register("place_damage_counters_on_opponent_active_equal_to_own_hand_size_times_2", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (!target) return ok({ success: false });
    if (typeof global.isAttackEffectPreventedOnTarget === "function"
      && global.isAttackEffectPreventedOnTarget(context.attacker, target, { attack: context.attack, interaction: "damage_counter" })) {
      return ok({ success: false, message: "prevented" });
    }
    const count = arr(call("getCardsInZone", [handZone(context.owner)], [])).length;
    const perCard = num(params && params.per_card, 2);
    const counters = count * perCard;
    if (counters <= 0) return ok();
    call("adjustCardDamage", [target, counters * 10, target.zoneId], undefined);
    renderAndSync(target);
    return ok();
  });

  register("knock_out_all_with_lowest_remaining_hp_except_self", async function(params, context) {
    const selfSyncId = num(context.attacker && context.attacker.syncId, 0);
    const candidates = ["player1", "opponent"]
      .flatMap((owner) => mainZones(owner).map(mainCard).filter(Boolean))
      .filter((card) => num(card && card.syncId, 0) !== selfSyncId)
      .map((card) => ({ card, hp: remainingHp(card) }))
      .filter((entry) => entry.hp > 0);
    if (!candidates.length) return ok({ success: false });
    const minHp = Math.min(...candidates.map((entry) => entry.hp));
    const targets = candidates
      .filter((entry) => entry.hp === minHp)
      .map((entry) => entry.card)
      .filter((target) => !(typeof global.isAttackEffectPreventedOnTarget === "function"
        && global.isAttackEffectPreventedOnTarget(context.attacker, target, { attack: context.attack, interaction: "effect" })));
    if (!targets.length) return ok({ success: false, message: "prevented" });
    targets.forEach((target) => {
      const cardsToDiscard = [target].concat(attached(target.zoneId));
      moveWithBroadcast(cardsToDiscard, discardZone(target.owner), [target.zoneId, attachZone(target.zoneId)]);
    });
    call("showToast", [`${targets.map((card) => card.name).join("、")} 昏厥，請手動處理獎勵卡`, "warn", 2600], undefined);
    call("appendGameLog", [`${targets.map((card) => card.name).join("、")} 因效果昏厥，請手動處理獎勵卡`], undefined);
    return ok();
  });

  async function rareCandyHandler(params, context) {
    const owner = context.owner;
    const handCards = arr(call("getCardsInZone", [handZone(owner)], []));
    const candidates = handCards.filter((card) => isStage2Pokemon(card) && rareCandyTargets(owner, card).length > 0);
    if (!candidates.length) {
      call("showToast", ["手牌沒有可用神奇糖果跳階進化的 2 階寶可夢", "warn", 2200], undefined);
      return ok({ success: false, message: "no_stage2_candidate" });
    }
    const selectedStage2 = (await promptChoice(candidates, {
      title: "神奇糖果：選擇 2 階寶可夢",
      hint: "請從手牌選擇要直接進化的 2 階寶可夢",
      owner,
      sourceZoneId: handZone(owner),
      minCount: 1,
      maxCount: 1,
      confirmText: "選擇寶可夢"
    }))[0];
    if (!selectedStage2) {
      return ok({ success: false, message: "cancelled_stage2" });
    }
    const targets = rareCandyTargets(owner, selectedStage2);
    if (!targets.length) {
      call("showToast", [`${selectedStage2.name} 沒有可直接進化的基礎寶可夢`, "warn", 2200], undefined);
      return ok({ success: false, message: "no_basic_target" });
    }
    const selectedTarget = (await promptChoice(targets, {
      title: "神奇糖果：選擇基礎寶可夢",
      hint: "請選擇要覆蓋進化的基礎寶可夢",
      owner,
      sourceZoneId: targets[0].zoneId,
      minCount: 1,
      maxCount: 1,
      confirmText: "直接進化"
    }))[0];
    if (!selectedTarget) {
      return ok({ success: false, message: "cancelled_target" });
    }
    const beforeMap = call("snapshotCardZones", [], null);
    call("moveToUniqueMainZone", [selectedTarget.zoneId, [selectedStage2]], undefined);
    const movedIds = beforeMap && typeof global.collectMovedCardIds === "function"
      ? global.collectMovedCardIds(beforeMap)
      : [selectedStage2.id, selectedTarget.id];
    const extraZones = [selectedTarget.zoneId, attachZone(selectedTarget.zoneId), handZone(owner)];
    if (beforeMap && typeof global.renderBoardForMovedCards === "function") {
      global.renderBoardForMovedCards(beforeMap, movedIds, { extraZoneIds: extraZones });
    } else {
      call("renderBoard", [{ zoneIds: extraZones, overlay: false }], undefined);
    }
    call("broadcastMoveSync", [movedIds, beforeMap], undefined);
    call("broadcastZoneStats", [[selectedTarget.zoneId, beforeMap && beforeMap.get(selectedStage2.id) || handZone(owner)].flat()], undefined);
    call("showToast", [`${selectedStage2.name} 透過神奇糖果直接進化完成`, "success", 1800], undefined);
    call("appendGameLog", [`${selectedStage2.name} 透過神奇糖果直接覆蓋在 ${selectedTarget.name} 上完成跳階進化`], undefined);
    return ok({ success: true });
  }

  register("rare_candy_evolve_basic_to_stage2_from_hand", rareCandyHandler);
  register("rare_candy_evolve_basic_to_stage2", rareCandyHandler);
  register("evolve_basic_directly_to_stage2_skipping_stage1", rareCandyHandler);
  register("evolve_basic_directly_into_stage2_skipping_stage1", rareCandyHandler);
  register("evolve_basic_directly_into_stage2_skipping_stage1_except_first_turn_or_just_played", rareCandyHandler);
  register("evolve_basic_directly_to_stage2_from_hand_skipping_stage1_if_legal", rareCandyHandler);

  // 擲硬幣，正面才給予保護
  register("coin_flip_heads_prevent_damage_and_effects_next_opponent_turn", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    var coinResult = Math.random() < 0.5 ? "正面" : "反面";
    if (typeof global.playCoinToss === "function") await global.playCoinToss(coinResult, { broadcast: true, startedAt: Date.now() + 180, flipCount: 10 });
    if (typeof global.delayMs === "function") await global.delayMs(120);
    if (coinResult === "反面") {
      call("showToast", ["反面！保護效果未生效", "warn", 1500], undefined);
      return ok({ message: "tails - no protection" });
    }
    call("showToast", ["正面！下回合防止傷害與效果", "success", 1500], undefined);
    global.registerEffectProtection({
      effect: "prevent_damage_and_effects_to_self_next_opponent_turn",
      targetCard: context.attacker,
      sourceCard: context.attacker,
      duration: "opponent_next_turn"
    }, context);
    return ok();
  });
  registerSelfProtection("prevent_damage_and_effects_to_self_next_opponent_turn");
  registerSelfProtection("prevent_attack_damage_and_effects_to_self");
  registerSelfProtection("prevent_damage_and_effects_from_opponent_ex_next_turn");
  registerSelfProtection("prevent_damage_from_opponent_basic_pokemon_attacks_next_turn");
  registerSelfProtection("prevent_damage_from_opponent_basic_except_colorless_next_turn");
  registerSelfProtection("prevent_damage_from_attack_60_or_less_next_turn", function(params) { return { params: params || {} }; });
  registerSelfProtection("prevent_damage_from_attacks_lte_next_turn", function(params) { return { params: params || {} }; });

  register("prevent_damage_to_non_rule_box_pokemon_from_opponent_ex_and_v", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "prevent_damage_to_non_rule_box_pokemon_from_opponent_ex_and_v",
      sourceCard: context.attacker || context.defender,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("prevent_damage_and_effects_to_all_own_bench", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "prevent_damage_and_effects_to_all_own_bench",
      sourceCard: context.attacker || context.defender,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("prevent_damage_and_effects_while_on_bench", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "prevent_damage_and_effects_while_on_bench",
      targetCard: context.attacker,
      sourceCard: context.attacker,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("while_on_bench_prevent_damage_and_effects_from_opponent_attacks", customHandlers.prevent_damage_and_effects_while_on_bench);

  register("while_on_bench_prevent_attack_damage", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "while_on_bench_prevent_attack_damage",
      targetCard: context.attacker,
      sourceCard: context.attacker,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("prevent_bench_damage_to_own_non_rule_pokemon", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "prevent_bench_damage_to_own_non_rule_pokemon",
      sourceCard: context.attacker || context.defender,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("prevent_damage_counters_on_benched_from_opponent_attacks_and_abilities", async function(params, context) {
    if (typeof global.registerEffectProtection !== "function") return ok({ success: false });
    global.registerEffectProtection({
      effect: "prevent_damage_counters_on_benched_from_opponent_attacks_and_abilities",
      sourceCard: context.attacker || context.defender,
      duration: params && params.duration || ""
    }, context);
    return ok();
  });

  register("when_active_damaged_by_opponent_attack_put_3_damage_counters_on_attacker", async function() {
    return ok({ message: "reactive effect handled by effect-engine after real damage" });
  });

  // ── 批次狀態效果 ──
  register("confuse_opponent_active", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (!target) return ok({ success: false });
    call("applyStatusAction", [target, "confused"], undefined);
    renderAndSync(target);
    return ok();
  });
  register("damage_and_confuse", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (target) { call("applyStatusAction", [target, "confused"], undefined); renderAndSync(target); }
    return ok();
  });
  register("damage_and_poison", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (target) { call("applyStatusAction", [target, "poisoned"], undefined); renderAndSync(target); }
    return ok();
  });
  register("damage_and_burn", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (target) { call("applyStatusAction", [target, "burned"], undefined); renderAndSync(target); }
    return ok();
  });
  register("damage_and_paralyze", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (target) { call("applyStatusAction", [target, "paralyzed"], undefined); renderAndSync(target); }
    return ok();
  });
  register("damage_and_sleep", async function(params, context) {
    const target = mainCard(`${context.opponentOwner}-active`);
    if (target) { call("applyStatusAction", [target, "asleep"], undefined); renderAndSync(target); }
    return ok();
  });

  // ── 丟棄全部自身能量 ──
  register("discard_all_self_energy", async function(params, context) {
    const attacker = context && context.attacker;
    if (!attacker || !attacker.zoneId) return ok({ success: false });
    const energies = attached(attacker.zoneId).filter((c) => isEnergy(c));
    if (energies.length > 0) move(energies, discardZone(context.owner), { faceUp: true });
    return ok();
  });

  // ── 對全部對手備戰造成傷害 ──
  register("damage_all_opponent_bench", async function(params, context) {
    const damage = num(params && params.damage, 20);
    const benchZones = mainZones(context.opponentOwner).filter((zoneId) => zoneId !== `${context.opponentOwner}-active`);
    const affected = [];
    benchZones.forEach((zoneId) => {
      const target = mainCard(zoneId);
      if (!target) return;
      call("adjustCardDamage", [target, damage, zoneId], undefined);
      call("broadcastCardStats", [target, zoneId], undefined);
      affected.push(zoneId);
    });
    if (affected.length) call("renderBoard", [{ zoneIds: affected, overlay: false }], undefined);
    return ok();
  });

  // ── 對1隻對手備戰造成傷害 ──
  register("damage_one_opponent_bench", async function(params, context) {
    const damage = num(params && params.damage, 20);
    const benchCards = mainZones(context.opponentOwner)
      .filter((zoneId) => zoneId !== `${context.opponentOwner}-active`)
      .map(mainCard).filter(Boolean);
    if (!benchCards.length) return ok({ success: false });
    const chosen = await promptChoice(benchCards, {
      title: "選擇對手備戰區的1隻寶可夢",
      hint: "對其造成 " + damage + " 點傷害",
      owner: context.opponentOwner,
      sourceZoneId: benchCards[0].zoneId,
      minCount: 1, maxCount: 1,
      confirmText: "造成傷害"
    });
    if (!chosen.length) return ok({ success: false, cancelled: true });
    const target = chosen[0];
    call("adjustCardDamage", [target, damage, target.zoneId], undefined);
    call("broadcastCardStats", [target, target.zoneId], undefined);
    call("renderBoard", [{ zoneIds: [target.zoneId], overlay: false }], undefined);
    return ok();
  });

  // ── 無視抗性 ──
  register("ignore_resistance", async function(params, context) {
    // 設定無視抗性旗標讓 applyWeaknessResistance 可讀取
    if (context && context.runtime) context.runtime.ignoreResistance = true;
    return ok();
  });

  // ── 下回合不能攻擊 (自身全招式鎖定) ──
  function registerSelfAttackLock(effectName) {
    register(effectName, async function(params, context) {
      const attacker = context && context.attacker;
      if (!attacker) return ok();
      // 鎖定所有招式：attackName 留空，canAttackWithEffects 檢查時 attackName === "" 匹配所有
      state().attackLocks.push({
        owner: context.owner,
        syncId: attacker.syncId,
        zoneId: attacker.zoneId,
        attackName: "",
        active: false
      });
      return ok();
    });
  }
  registerSelfAttackLock("cannot_attack_next_turn");
  registerSelfAttackLock("self_cannot_attack_next_turn");
  registerSelfAttackLock("cannot_attack_next_own_turn");

  // ── 禁止對手戰鬥寶可夢撤退 (下回合) ──
  function registerPreventRetreat(effectName) {
    register(effectName, async function(params, context) {
      if (typeof global.registerEffectProtection === "function") {
        global.registerEffectProtection({
          effect: "prevent_retreat",
          targetCard: mainCard(`${context.opponentOwner}-active`),
          sourceCard: context.attacker,
          duration: "opponent_next_turn"
        }, context);
      }
      return ok();
    });
  }
  registerPreventRetreat("prevent_retreat");
  registerPreventRetreat("prevent_retreat_next_turn");
  registerPreventRetreat("cannot_retreat_next_turn");
  registerPreventRetreat("prevent_retreat_next_opponent_turn");
  registerPreventRetreat("prevent_opponent_active_retreat_next_turn");

  // ── 依自身傷害指示物數量計算傷害 ──
  register("damage_per_self_damage_counter", async function(params, context) {
    const counters = zoneDamage(context.attacker && context.attacker.zoneId) / 10;
    const perCounter = num(params && params.per_counter || params && params.multiplier, 10);
    return ok({ damage_modifier: counters * perCounter - num(context.baseDamage, 0) });
  });

  register("future_pokemon_free_retreat_and_plus_20_to_opponent_active", async function(params) {
    return ok({ message: String(params && params.description || "future aura pending full retreat integration") });
  });

  register("ancient_pokemon_hp_plus_60_and_cure_prevent_special_conditions", async function() {
    return ok({ message: "continuous status immunity handled by effect-engine passive scan" });
  });

  // ── 小光：從牌庫各選1張基礎、1階進化、2階進化寶可夢加入手牌 ──
  register("search_deck_1_basic_1_stage1_1_stage2_to_hand", async function(params, context) {
    const owner = context.owner;
    const pool = cardsIn(deckZone(owner));
    function isPokemon(card) {
      const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
      const type = String(card.cardType || meta.cardType || meta.card_type || "").toLowerCase();
      return type.includes("pokemon") || type.includes("寶可夢");
    }
    function getStage(card) {
      const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
      return String(card.evolutionStage || card.evolution_stage || meta.evolutionStage || meta.evolution_stage || "").trim();
    }
    function isStageMatch(card, target) {
      const s = getStage(card).toLowerCase();
      if (target === "basic") return !s || s.includes("basic") || s.includes("基礎");
      if (target === "stage1") return s.includes("1") || s.includes("stage1");
      if (target === "stage2") return s.includes("2") || s.includes("stage2");
      return false;
    }
    const stages = [
      { key: "basic", label: "基礎寶可夢" },
      { key: "stage1", label: "1階進化寶可夢" },
      { key: "stage2", label: "2階進化寶可夢" }
    ];
    const allFound = [];
    const usedIds = new Set();
    for (let i = 0; i < stages.length; i++) {
      const candidates = pool.filter(function(card) {
        return isPokemon(card) && isStageMatch(card, stages[i].key) && !usedIds.has(card.id);
      });
      if (candidates.length === 0) continue;
      const picked = await promptChoice(candidates, {
        title: '選擇1張' + stages[i].label,
        hint: '從牌庫選擇' + stages[i].label + '加入手牌（可取消跳過）',
        owner, sourceZoneId: deckZone(owner), sortMode: "deck",
        minCount: 0, maxCount: 1, confirmText: "選擇", allowCancel: true
      });
      if (picked.length > 0) {
        allFound.push(picked[0]);
        usedIds.add(picked[0].id);
      }
    }
    if (allFound.length > 0) {
      move(allFound, handZone(owner), { faceUp: true });
    }
    putIntoDeck(owner, [], "shuffle");
    return ok({ success: allFound.length > 0 });
  });

  // ── 赤松：從牌庫選最多2張不同屬性基本能量，1張加入手牌，另1張附於自己寶可夢 ──
  register("search_2_different_basic_energy_1_hand_1_attach", async function(params, context) {
    const owner = context.owner;
    const pool = cardsIn(deckZone(owner));
    const basicEnergies = pool.filter(function(card) {
      if (!isEnergy(card)) return false;
      const name = String(card.name || "");
      return !name.includes("特殊") && !name.includes("Special");
    });
    if (basicEnergies.length === 0) {
      if (typeof global.showToast === "function") global.showToast("牌庫中沒有基本能量卡", "warn", 1800);
      return ok({ success: false });
    }
    // 選擇第1張能量
    const first = await promptChoice(basicEnergies, {
      title: "從牌庫選擇第1張基本能量",
      hint: "從牌庫選擇最多2張各不同屬性的基本能量卡",
      owner, sourceZoneId: deckZone(owner), sortMode: "deck",
      minCount: 1, maxCount: 1, confirmText: "選擇"
    });
    if (!first.length) return ok({ success: false, cancelled: true });
    const firstType = String(first[0].elementType || first[0].name || "");
    // 過濾出不同屬性的能量
    const remaining = basicEnergies.filter(function(card) {
      if (card.id === first[0].id) return false;
      const cardType = String(card.elementType || card.name || "");
      return cardType !== firstType;
    });
    let second = [];
    if (remaining.length > 0) {
      second = await promptChoice(remaining, {
        title: "選擇第2張不同屬性的基本能量（可跳過）",
        hint: "必須與第1張不同屬性，或按取消跳過",
        owner, sourceZoneId: deckZone(owner), sortMode: "deck",
        minCount: 0, maxCount: 1, confirmText: "選擇", allowCancel: true
      });
    }
    const allSelected = first.concat(second);
    if (allSelected.length === 1) {
      // 只選1張 → 加入手牌
      move(allSelected, handZone(owner), { faceUp: true });
    } else {
      // 2張：讓玩家選哪張加入手牌
      const toHand = await promptChoice(allSelected, {
        title: "選擇加入手牌的能量",
        hint: "選擇1張加入手牌，另1張將附於自己的寶可夢",
        owner, minCount: 1, maxCount: 1, confirmText: "確認"
      });
      if (!toHand.length) {
        move(allSelected, handZone(owner), { faceUp: true });
      } else {
        move(toHand, handZone(owner), { faceUp: true });
        const toAttach = allSelected.filter(function(c) { return c.id !== toHand[0].id; });
        if (toAttach.length > 0) {
          // 選擇要附加的寶可夢
          const occupied = mainZones(owner).filter(function(zoneId) { return !!mainCard(zoneId); });
          if (occupied.length > 0) {
            const targets = occupied.map(mainCard).filter(Boolean);
            const picked = await promptChoice(targets, {
              title: "選擇要附加能量的寶可夢",
              hint: "將選擇的能量附於此寶可夢",
              owner, minCount: 1, maxCount: 1, confirmText: "附加"
            });
            if (picked.length > 0) {
              move(toAttach, attachZone(picked[0].zoneId), { faceUp: true });
            } else {
              move(toAttach, handZone(owner), { faceUp: true });
            }
          } else {
            move(toAttach, handZone(owner), { faceUp: true });
          }
        }
      }
    }
    // 重洗牌庫
    putIntoDeck(owner, [], "shuffle");
    return ok({ success: true });
  });

  // ── 喵喵ex：殺手鐧捕捉（放置時從牌庫搜尋1張支援者） ──
  register("when_placed_from_hand_search_1_supporter", async function(params, context) {
    const owner = context.owner;
    const pool = cardsIn(deckZone(owner));
    const supporters = pool.filter(function(card) {
      const meta = call("findDeckBuilderCatalogCardForEntry", [card], null) || {};
      const subtype = String(card.trainerSubtype || card.trainer_subtype_raw || meta.trainerSubtype || meta.trainer_subtype_raw || meta.subtype || "").toLowerCase();
      const cardType = String(card.cardType || meta.cardType || meta.card_type || "").toLowerCase();
      return (subtype.includes("supporter") || subtype.includes("支援")) ||
             (cardType.includes("訓練家") && subtype.includes("支援者"));
    });
    if (supporters.length === 0) {
      if (typeof global.showToast === "function") global.showToast("牌庫中沒有支援者卡", "warn", 1800);
      putIntoDeck(owner, [], "shuffle");
      return ok({ success: false });
    }
    const found = await promptChoice(supporters, {
      title: "從牌庫選擇1張支援者卡",
      hint: "選擇的支援者卡將加入手牌",
      owner, sourceZoneId: deckZone(owner), sortMode: "deck",
      minCount: 1, maxCount: 1, confirmText: "加入手牌"
    });
    if (found.length > 0) {
      move(found, handZone(owner), { faceUp: true });
    }
    putIntoDeck(owner, [], "shuffle");
    return ok({ success: found.length > 0 });
  });

  // ── 喵喵ex：夾尾巴逃跑（將自己與附加卡全部放回手牌） ──
  register("return_self_and_all_attached_to_hand", async function(params, context) {
    const attacker = context && context.attacker;
    if (!attacker || !attacker.zoneId) return ok({ success: false });
    const zoneId = attacker.zoneId;
    const attachedCards = attached(zoneId);
    const allCards = [attacker].concat(attachedCards).filter(Boolean);
    move(allCards, handZone(context.owner), { faceUp: true });
    call("renderBoard", [{ zoneIds: [zoneId, attachZone(zoneId), handZone(context.owner)], overlay: false }], undefined);
    return ok({ success: true });
  });

  // ── 大力鱷：奔流之心（自己放5個傷害指示物，本回合攻擊+120） ──
  register("place_5_damage_on_self_boost_attack_120", async function(params, context) {
    const attacker = context && context.attacker;
    if (!attacker || !attacker.zoneId) return ok({ success: false });
    const bonus = num(params && params.bonus, 120);
    const selfDamage = num(params && params.self_damage, 50);
    // 放置傷害指示物
    call("adjustCardDamage", [attacker, selfDamage, attacker.zoneId], undefined);
    call("broadcastCardStats", [attacker, attacker.zoneId], undefined);
    call("renderBoard", [{ zoneIds: [attacker.zoneId], overlay: false }], undefined);
    // 註冊一次性傷害加成到 effect engine state
    const st = state();
    st.damageBoosts.push({
      owner: context.owner,
      syncId: attacker.syncId,
      bonus: bonus
    });
    if (typeof global.showToast === "function") global.showToast(`奔流之心：放置${selfDamage / 10}個傷害指示物，本回合攻擊+${bonus}點`, "info", 2000);
    return ok({ success: true });
  });

  // ── 大力鱷：駭浪（下回合不能使用駭浪） ──
  register("lock_this_attack_next_turn", async function(params, context) {
    const attacker = context && context.attacker;
    const attackName = context && context.attack && context.attack.name || "";
    if (attacker && attackName) {
      state().attackLocks.push({
        owner: context.owner,
        syncId: attacker.syncId,
        attackName: attackName,
        active: true,
        expiresOnTurnOf: context.owner,
        registeredTurn: currentTurnNumber()
      });
    }
    return ok({ damage_modifier: 0 });
  });

  // ── 超級甲賀忍蛙ex：忍者飛旋（可選將1個水能量放回手牌，+80傷害） ──
  register("optionally_return_1_water_energy_to_hand_for_bonus_80", async function(params, context) {
    const attacker = context && context.attacker;
    if (!attacker || !attacker.zoneId) return ok({ damage_modifier: 0 });
    const waterEnergies = attached(attacker.zoneId).filter(function(card) {
      if (!isEnergy(card)) return false;
      const elType = String(card.elementType || "").toLowerCase();
      const name = String(card.name || "").toLowerCase();
      return elType === "water" || elType.includes("水") || name.includes("水");
    });
    const providedWaterEnergies = attached(attacker.zoneId).filter(function(card) {
      return providesEnergyType(card, attacker, "water");
    });
    const selectableWaterEnergies = providedWaterEnergies.length ? providedWaterEnergies : waterEnergies;
    if (selectableWaterEnergies.length === 0) return ok({ damage_modifier: 0 });
    // 問玩家是否要回收能量
    const selected = await promptChoice(selectableWaterEnergies, {
      title: "是否將1個水能量放回手牌？（+80傷害）",
      hint: "選擇1個水能量放回手牌以增加80點傷害，或按取消不使用",
      owner: context.owner,
      sourceZoneId: attachZone(attacker.zoneId),
      minCount: 0, maxCount: 1,
      confirmText: "放回手牌", allowCancel: true
    });
    if (selected.length > 0) {
      move(selected, handZone(context.owner), { faceUp: true });
      call("renderBoard", [{ zoneIds: [attacker.zoneId, attachZone(attacker.zoneId), handZone(context.owner)], overlay: false }], undefined);
      return ok({ damage_modifier: 80 });
    }
    return ok({ damage_modifier: 0 });
  });

  // ── 超級甲賀忍蛙ex：必殺手裡劍（丟棄1張手牌中基本水能量，在對手1隻寶可夢放6個傷害指示物） ──
  register("discard_1_basic_water_energy_from_hand_place_6_damage_counters_on_opponent", async function(params, context) {
    const owner = context.owner;
    const opponentOwner = context.opponentOwner || (owner === "player1" ? "opponent" : "player1");
    // 先從手牌找基本水能量
    const handCards = cardsIn(handZone(owner));
    const waterEnergies = handCards.filter(function(card) {
      if (!isEnergy(card)) return false;
      const name = String(card.name || "");
      if (name.includes("特殊") || name.includes("Special")) return false;
      const elType = String(card.elementType || "").toLowerCase();
      return elType === "water" || elType.includes("水") || name.includes("水");
    });
    if (waterEnergies.length === 0) {
      if (typeof global.showToast === "function") global.showToast("手牌中沒有基本水能量卡", "warn", 1800);
      return ok({ success: false });
    }
    // 選擇要丟棄的能量
    const toDiscard = await promptChoice(waterEnergies, {
      title: "選擇要丟棄的基本水能量",
      hint: "從手牌丟棄1張基本水能量作為代價",
      owner, minCount: 1, maxCount: 1, confirmText: "丟棄"
    });
    if (!toDiscard.length) return ok({ success: false, cancelled: true });
    move(toDiscard, discardZone(owner), { faceUp: true });
    // 選擇對手的寶可夢
    const opponentPokemon = mainZones(opponentOwner).map(mainCard).filter(Boolean);
    if (opponentPokemon.length === 0) return ok({ success: false });
    const target = await promptChoice(opponentPokemon, {
      title: "選擇對手的寶可夢放置傷害指示物",
      hint: "在該寶可夢上放置6個傷害指示物（60點傷害）",
      owner, minCount: 1, maxCount: 1, confirmText: "放置傷害指示物"
    });
    if (!target.length) return ok({ success: false, cancelled: true });
    const targetCard = target[0];
    call("adjustCardDamage", [targetCard, 60, targetCard.zoneId], undefined);
    call("broadcastCardStats", [targetCard, targetCard.zoneId], undefined);
    call("renderBoard", [{ zoneIds: [targetCard.zoneId, discardZone(owner), handZone(owner)], overlay: false }], undefined);
    return ok({ success: true });
  });

  global.customHandlers = customHandlers;
  global.resolveCustomHandler = function resolveCustomHandler(spec) { return customHandlers[keyOf(spec)] || customHandlers[String(spec && spec.handler || "").trim()] || null; };
  global.runCustomHandlerFallback = async function runCustomHandlerFallback(spec) { return showFallback(spec); };
})(typeof window !== "undefined" ? window : globalThis);
