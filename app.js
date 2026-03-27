const BOARD_ZONE_IDS = [
  "opponent-hand",
  "opponent-prize",
  "opponent-active",
  "opponent-active-attach",
  "opponent-bench-1",
  "opponent-bench-1-attach",
  "opponent-bench-2",
  "opponent-bench-2-attach",
  "opponent-bench-3",
  "opponent-bench-3-attach",
  "opponent-bench-4",
  "opponent-bench-4-attach",
  "opponent-bench-5",
  "opponent-bench-5-attach",
  "opponent-bench-6",
  "opponent-bench-6-attach",
  "opponent-bench-7",
  "opponent-bench-7-attach",
  "opponent-bench-8",
  "opponent-bench-8-attach",
  "opponent-reveal",
  "opponent-temp-hand",
  "opponent-deck",
  "opponent-deck-bottom",
  "opponent-discard",
  "player1-prize",
  "player1-active",
  "player1-active-attach",
  "player1-bench-1",
  "player1-bench-1-attach",
  "player1-bench-2",
  "player1-bench-2-attach",
  "player1-bench-3",
  "player1-bench-3-attach",
  "player1-bench-4",
  "player1-bench-4-attach",
  "player1-bench-5",
  "player1-bench-5-attach",
  "player1-bench-6",
  "player1-bench-6-attach",
  "player1-bench-7",
  "player1-bench-7-attach",
  "player1-bench-8",
  "player1-bench-8-attach",
  "player1-deck",
  "player1-deck-bottom",
  "player1-discard",
  "player1-hand",
  "player1-reveal",
  "player1-temp-hand",
  "stadium"
];

const PRIZE_ZONES = new Set(["player1-prize", "opponent-prize"]);
const DISCARD_ZONES = new Set(["player1-discard", "opponent-discard"]);
const HAND_LIKE_ZONE_PATTERN = /(hand|temp-hand|reveal|library-view)/i;
const ACTIVE_MAIN_ZONES = new Set(["player1-active", "opponent-active"]);
const IMAGE_CACHE_LIMIT = 240;
const PLACEHOLDER_CACHE_LIMIT = 120;

const POISON_BURN_STATUS_META = {
  poison: { label: "毒" },
  burn: { label: "燒" }
};

const BEHAVIOR_STATUS_META = {
  confused: { label: "亂", rotation: 180 },
  paralyzed: { label: "麻", rotation: 90 },
  asleep: { label: "睡", rotation: -90 }
};

const TYPE_EFFECTIVENESS_MAP = {
  grass: { weakTo: ["fire"], resistTo: ["water"] },
  fire: { weakTo: ["water"], resistTo: ["grass"] },
  water: { weakTo: ["grass"], resistTo: ["fire"] },
  electric: { weakTo: ["fighting"], resistTo: ["metal"] },
  fighting: { weakTo: ["psychic"], resistTo: ["dark"] },
  psychic: { weakTo: ["dark"], resistTo: ["fighting"] },
  dark: { weakTo: ["fighting"], resistTo: ["psychic"] },
  metal: { weakTo: ["fire"], resistTo: ["grass"] },
  dragon: { weakTo: ["dragon"], resistTo: [] }
};

const UNIQUE_MAIN_TO_ATTACH = {
  "player1-active": "player1-active-attach",
  "player1-bench-1": "player1-bench-1-attach",
  "player1-bench-2": "player1-bench-2-attach",
  "player1-bench-3": "player1-bench-3-attach",
  "player1-bench-4": "player1-bench-4-attach",
  "player1-bench-5": "player1-bench-5-attach",
  "player1-bench-6": "player1-bench-6-attach",
  "player1-bench-7": "player1-bench-7-attach",
  "player1-bench-8": "player1-bench-8-attach",
  "opponent-active": "opponent-active-attach",
  "opponent-bench-1": "opponent-bench-1-attach",
  "opponent-bench-2": "opponent-bench-2-attach",
  "opponent-bench-3": "opponent-bench-3-attach",
  "opponent-bench-4": "opponent-bench-4-attach",
  "opponent-bench-5": "opponent-bench-5-attach",
  "opponent-bench-6": "opponent-bench-6-attach",
  "opponent-bench-7": "opponent-bench-7-attach",
  "opponent-bench-8": "opponent-bench-8-attach"
};
const MAIN_BATTLE_BENCH_ZONES = Object.keys(UNIQUE_MAIN_TO_ATTACH);
const DECK_LINE_REGEX = /^\s*(\d+)\s+(.+?)\s+([A-Za-z0-9]+)\s+([A-Za-z0-9]+)\s*$/;
const PTCG_TW_ID_REGEX = /\b([A-Za-z]{2,}\d+[A-Za-z]?)\s*[_-]?\s*([0-9]{1,3}[A-Za-z]?)\b/g;
const PTCG_TW_DECK_CODE_REGEX = /\b([A-Za-z]{2}\d{4,6})\b/;
const TW_CARD_BASE = "https://asia.pokemon-card.com/tw/_img/card/";
const TW_CARD_IMG_BASE = "https://asia.pokemon-card.com/tw/card-img/";
const US_CARD_BASE = "https://images.pokemontcg.io";
const PTCG_TW_PROXY_API = "https://r.jina.ai/http://ptcgtw.shop/index_function/api/23_01_load_deck_ptcgtw_api.php";
const APP_BASE_DIR = typeof __dirname === "string" ? __dirname : ".";
const DECK_BUILDER_ROOT = typeof require !== "undefined"
  ? require("path").join(APP_BASE_DIR, "deck-builder-data")
  : `${APP_BASE_DIR}/deck-builder-data`;
const DECK_BUILDER_EXTERNAL_ROOT_NAME = "deck-builder-data";
const PEER_ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" }
  ],
  sdpSemantics: "unified-plan"
};
const ACTION_TYPES = {
  SYNC_DECK: "SYNC_DECK",
  MOVE_CARD: "MOVE_CARD",
  UPDATE_STATS: "UPDATE_STATS",
  SHUFFLE: "SHUFFLE",
  INIT_STATE: "INIT_STATE",
  READY_STATE: "READY_STATE",
  START_BATTLE: "START_BATTLE",
  REMATCH_STATE: "REMATCH_STATE",
  START_REMATCH: "START_REMATCH",
  TOGGLE_GREAT_VOID: "TOGGLE_GREAT_VOID",
  TOGGLE_HAND_VISIBILITY: "TOGGLE_HAND_VISIBILITY",
  CHAT_MESSAGE: "CHAT_MESSAGE",
  COIN_TOSS: "COIN_TOSS"
};
const CUSTOM_BG_STORAGE_KEY = "ptcg.customBackgroundImage";
const CUSTOM_BG_STRENGTH_KEY = "ptcg.customBackgroundStrength";
const DECK_BUILDER_CUSTOM_IMAGE_ROOT_KEY = "ptcg.deckBuilderCustomImageRoot";
const IS_DECK_BUILDER_WINDOW = typeof window !== "undefined"
  && new URLSearchParams(window.location.search).get("deckBuilderWindow") === "1";

const cards = Array.from({ length: 60 }, (_, idx) => ({
  id: idx + 1,
  owner: idx < 30 ? "player1" : "opponent",
  syncId: (idx % 30) + 1,
  zoneId: idx < 30 ? "player1-deck" : "opponent-deck",
  isFaceUp: false,
  name: `Card ${idx + 1}`,
  cardType: "Pokemon",
  elementType: "",
  series: "",
  number: "",
  imageRefs: null,
  poison: false,
  burn: false,
  behaviorStatus: "",
  rotationDeg: 0
}));

const state = {
  currentViewer: "player1",
  singlePlayer: true,
  selectedCardIds: new Set(),
  draggingCardIds: [],
  pendingAnimations: [],
  overlay: {
    isOpen: false,
    type: null,
    owner: null,
    zoneId: null,
    scrollTop: 0,
    scrollLeft: 0
  },
  deckMenu: {
    isOpen: false,
    zoneId: null
  },
  statusMenu: {
    isOpen: false,
    cardId: null,
    zoneId: null
  },
  dragPreviewEl: null,
  dragCursorIndicatorEl: null,
  hoveredCardId: null,
  zoomPinned: false,
  imageCache: new Map(),
  placeholderCache: new Map(),
  discardCounter: 0,
  latestCardByZone: {},
  damageShakeIds: new Set(),
  peer: {
    id: "",
    remoteId: "",
    isHost: false,
    peer: null,
    conn: null,
    connected: false,
    multiplayerEnabled: false,
    applyingRemote: false
  },
  ready: {
    local: false,
    remote: false
  },
  rematch: {
    local: false,
    remote: false
  },
  gamePhase: "準備中",
  importedDeckEntries: {
    player1: null,
    opponent: null
  },
  importedDeckSourceText: {
    player1: "",
    opponent: ""
  },
  deckImageRefsByOwner: {
    player1: new Map(),
    opponent: new Map()
  },
  typeHintByZone: {
    "player1-active": null,
    "opponent-active": null
  },
  zoneDamage: {},
  handReveal: {
    player1: false,
    opponent: false
  },
  chat: {
    isOpen: false,
    hasUnread: false,
    messages: []
  },
  coin: {
    busy: false,
    result: ""
  },
  importLock: {
    player1: false,
    opponent: false
  },
  importProgress: {
    player1: { done: 0, total: 0, active: false, phase: "", parseMs: 0, downloadMs: 0, cacheMs: 0, displayPercent: null },
    opponent: { done: 0, total: 0, active: false, phase: "", parseMs: 0, downloadMs: 0, cacheMs: 0, displayPercent: null }
  },
  prizeCountSnapshot: {
    player1: null,
    opponent: null
  },
  greatVoid: {
    player1: false,
    opponent: false
  },
  deckBuilder: {
    isOpen: false,
    isLoading: false,
    importModalOpen: false,
    importBusy: false,
    importInput: "",
    importStatus: "尚未開始匯入",
    importPercent: 0,
    search: "",
    seriesFilter: "",
    typeFilter: "",
    attributeFilter: "",
    subtypeFilter: "",
    evolutionStageFilter: [],
    retreatCostFilter: [],
    abilitiesFilter: [],
    advancedFiltersOpen: false,
    selectedCardKey: "",
    selectedDeckEntryKey: "",
    deckEntries: []
  }
};

const runtime = {
  pendingDeckSave: null,
  pendingDeckRenameId: "",
  deckLibrary: [],
  deckSaveInProgress: false,
  deckActionInProgress: false,
  singleRematchUnlocked: false,
  preloadJobSeqByOwner: {
    player1: 0,
    opponent: 0
  },
  imagePreloadPaused: false,
  toastTimerSeq: 0,
  autoSetupRunning: false,
  pendingResetResolve: null,
  gameLogs: [],
  overlayRenderToken: 0,
  overlayRenderPending: false,
  renderInProgress: false,
  renderQueued: false,
  renderQueuedOptions: null,
  modeGateCloseTimer: null,
  peerRetryTimer: null,
  peerConnectPending: false,
  coinTossAnimation: null,
  coinSettleTicker: null,
  coinFlipTicker: null,
  remoteImportTokenByOwner: {
    player1: 0,
    opponent: 0
  },
  remoteImportSignatureByOwner: {
    player1: "",
    opponent: ""
  },
  cacheTaskByOwner: {
    player1: "",
    opponent: ""
  },
  deckParseCache: new Map(),
  preloadedImageHandles: new Map(),
  diagnosticDragSeq: 0,
  deckBuilderCatalog: [],
  deckBuilderCatalogReady: false,
  deckBuilderLoadPromise: null,
  deckBuilderResultKeys: [],
  deckBuilderGroupedResults: [],
  deckBuilderCardMap: new Map(),
  deckBuilderCatalogBySeriesNumber: new Map(),
  deckBuilderCatalogBySeriesBaseNumber: new Map(),
  deckBuilderCatalogBySeriesNumberName: new Map(),
  deckBuilderCatalogBySeriesNumberTypeAttribute: new Map(),
  deckBuilderCatalogByCardId: new Map(),
  deckBuilderCatalogGroupsByGroupKey: new Map(),
  deckBuilderLegalGroupKeys: new Set(),
  deckBuilderSeriesOptions: [],
  deckBuilderSeriesRankByCode: new Map(),
  deckBuilderSubtypeOptions: [],
  deckBuilderAttributeOptions: [],
  deckBuilderTypeOptions: [],
  deckBuilderEvolutionOptions: [],
  deckBuilderRetreatCostOptions: [],
  deckBuilderCardListScrollTop: 0,
  deckBuilderDeckListScrollTop: 0,
  deckBuilderSelectedDeckDisplayKey: "",
  deckBuilderVirtualStartIndex: -1,
  deckBuilderKeyboardScope: "catalog",
  isElectron: typeof window !== "undefined" && !!window.process && window.process.type === "renderer",
  ipcRenderer: null,
  nodeFs: null,
  nodePath: null,
  pathToFileURL: null
};

if (runtime.isElectron && typeof window.require === "function") {
  try {
    runtime.ipcRenderer = window.require("electron").ipcRenderer;
  } catch {
    runtime.ipcRenderer = null;
  }
  try {
    runtime.nodeFs = window.require("fs");
    runtime.nodePath = window.require("path");
    runtime.pathToFileURL = window.require("url").pathToFileURL;
  } catch {
    runtime.nodeFs = null;
    runtime.nodePath = null;
    runtime.pathToFileURL = null;
  }
}

// PWA / 瀏覽器模式標記
if (!runtime.isElectron) {
  document.body.classList.add("pwa-mode");

  // 手機版自動縮放：以 1600x960 為基準，根據螢幕大小計算 zoom
  function applyMobileZoom() {
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vw < 1200 || vh < 600) {
      const scaleW = vw / 1600;
      const scaleH = vh / 960;
      const scale = Math.min(scaleW, scaleH, 1);
      document.body.style.zoom = scale;
    } else {
      document.body.style.zoom = "";
    }
  }
  window.addEventListener("resize", applyMobileZoom);
  window.addEventListener("orientationchange", () => {
    setTimeout(applyMobileZoom, 300);
  });
  applyMobileZoom();
}

if (runtime.ipcRenderer) {
  runtime.ipcRenderer.on("cache-image-urls-progress", (_event, payload) => {
    const taskId = String(payload && payload.taskId ? payload.taskId : "");
    const owner = taskId && runtime.cacheTaskByOwner.player1 === taskId
      ? "player1"
      : (taskId && runtime.cacheTaskByOwner.opponent === taskId ? "opponent" : "");
    if (!owner) {
      return;
    }
    const done = Math.max(0, Number(payload && payload.done) || 0);
    const total = Math.max(0, Number(payload && payload.total) || 0);
    const phase = owner === "player1" ? "下載卡圖中" : "下載對手卡圖中";
    setImportProgress(owner, done, total, total > 0 && done < total, phase);
  });
  runtime.ipcRenderer.on("deck-library-updated", () => {
    runtime.deckLibrary = getDeckLibraryFromStorage();
    renderDeckLibraryList();
    renderDeckBuilderSavedOptions();
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "ptcg.deckLibrary") {
      return;
    }
    runtime.deckLibrary = getDeckLibraryFromStorage();
    renderDeckLibraryList();
    renderDeckBuilderSavedOptions();
  });
}

function mirrorOwner(owner) {
  if (owner === "player1") {
    return "opponent";
  }
  if (owner === "opponent") {
    return "player1";
  }
  return owner;
}

function mirrorZoneId(zoneId) {
  if (!zoneId || zoneId === "stadium") {
    return zoneId;
  }
  if (zoneId.startsWith("player1-")) {
    return zoneId.replace("player1-", "opponent-");
  }
  if (zoneId.startsWith("opponent-")) {
    return zoneId.replace("opponent-", "player1-");
  }
  return zoneId;
}

function getZoneOwner(zoneId) {
  if (zoneId === "stadium") {
    return "neutral";
  }
  if (zoneId.startsWith("player1-")) {
    return "player1";
  }
  if (zoneId.startsWith("opponent-")) {
    return "opponent";
  }
  if (zoneId === "library-view" || zoneId === "discard-view") {
    return state.overlay.owner || "neutral";
  }
  return "neutral";
}

function getZoneElement(zoneId) {
  if (zoneId === "library-view" || zoneId === "discard-view") {
    return document.getElementById("overlay-zone");
  }
  return document.getElementById(zoneId);
}

function getCardById(cardId) {
  return cards.find((c) => c.id === cardId) || null;
}

function getCardBySyncKey(owner, syncId) {
  return cards.find((c) => c.owner === owner && Number(c.syncId) === Number(syncId)) || null;
}

function getCardsInZone(zoneId) {
  return cards.filter((c) => c.zoneId === zoneId);
}

function getActiveCard(owner) {
  const zoneId = owner === "opponent" ? "opponent-active" : "player1-active";
  return getCardsInZone(zoneId)[0] || null;
}

function isHandLikeZone(zoneId) {
  return HAND_LIKE_ZONE_PATTERN.test(zoneId);
}

function isRevealZone(zoneId) {
  return /-reveal$/.test(String(zoneId || ""));
}

function isActiveMainZone(zoneId) {
  return zoneId === "player1-active" || zoneId === "opponent-active";
}

function isBenchMainZone(zoneId) {
  return /^(player1|opponent)-bench-[1-8]$/.test(zoneId);
}

function isBattleOrBenchMainZone(zoneId) {
  return isActiveMainZone(zoneId) || isBenchMainZone(zoneId);
}

function isGreatVoidBenchZone(zoneId) {
  return /^(player1|opponent)-bench-[6-8](?:-attach)?$/.test(String(zoneId || ""));
}

function isGreatVoidActiveForOwner(owner) {
  return !!state.greatVoid[owner];
}

function isZoneCurrentlyAvailable(zoneId) {
  if (!isGreatVoidBenchZone(zoneId)) {
    return true;
  }
  const owner = getZoneOwner(zoneId);
  return owner === "neutral" ? true : isGreatVoidActiveForOwner(owner);
}

function isDeckBottomZone(zoneId) {
  return /^(player1|opponent)-deck-bottom$/.test(String(zoneId || ""));
}

function getCardStatusLabels(card) {
  const labels = [];
  if (card.poison) {
    labels.push(POISON_BURN_STATUS_META.poison.label);
  }
  if (card.burn) {
    labels.push(POISON_BURN_STATUS_META.burn.label);
  }
  if (card.behaviorStatus && BEHAVIOR_STATUS_META[card.behaviorStatus]) {
    labels.push(BEHAVIOR_STATUS_META[card.behaviorStatus].label);
  }
  return labels;
}

function classifyCardType(cardName) {
  if (/energy/i.test(cardName)) {
    return "Energy";
  }
  if (/(supporter|item|tool|stadium|trainer|博士|球|票|道館)/i.test(cardName)) {
    return "Trainer";
  }
  return "Pokemon";
}

function inferElementTypeByText(text) {
  const src = String(text || "").toLowerCase();
  if (!src) {
    return "";
  }
  if (/(grass|草)/i.test(src)) {
    return "grass";
  }
  if (/(fire|火)/i.test(src)) {
    return "fire";
  }
  if (/(water|水)/i.test(src)) {
    return "water";
  }
  if (/(electric|lightning|雷|電)/i.test(src)) {
    return "electric";
  }
  if (/(fighting|鬥|格鬥)/i.test(src)) {
    return "fighting";
  }
  if (/(psychic|超|念)/i.test(src)) {
    return "psychic";
  }
  if (/(dark|惡)/i.test(src)) {
    return "dark";
  }
  if (/(metal|steel|鋼)/i.test(src)) {
    return "metal";
  }
  if (/(dragon|龍)/i.test(src)) {
    return "dragon";
  }
  return "";
}

function getCardElementType(card) {
  if (!card) {
    return "";
  }
  if (card.elementType) {
    return card.elementType;
  }
  const inferred = inferElementTypeByText(card.name);
  card.elementType = inferred;
  return inferred;
}

function normalizeSeries(series) {
  return String(series || "").trim().replace(/\s+/g, "").replace(/-/g, "");
}

function normalizeCardNumber(number) {
  const raw = String(number || "").trim().toUpperCase();
  const matched = raw.match(/^(\d+)([A-Z]?)$/);
  if (!matched) {
    return raw;
  }
  return `${matched[1].padStart(3, "0")}${matched[2]}`;
}

function normalizeDeckBuilderMatchingNumber(number) {
  const raw = String(number || "").trim().toUpperCase();
  if (!raw) {
    return "";
  }
  const base = raw.split("/")[0].trim();
  return normalizeCardNumber(base || raw);
}

function getCardImageUrl(series, number) {
  const s = normalizeSeries(series);
  const n = normalizeCardNumber(number);
  if (!s || !n) {
    return "";
  }
  return `${TW_CARD_BASE}${s}_${n}.png`;
}

function getSecondaryImageUrl(series, number) {
  const s = normalizeSeries(series).toLowerCase();
  const n = String(number || "").trim().replace(/^0+/, "") || "0";
  if (!s || !n) {
    return "";
  }
  return `${US_CARD_BASE}/${s}/${n}.png`;
}

/**
 * 用 card_id 生成正確的線上圖片 URL。
 * asia.pokemon-card.com 的格式是 tw{id_8位數}.png
 */
function getCardImageUrlById(cardId) {
  const id = Number(cardId);
  if (!id || !Number.isFinite(id) || id <= 0) return "";
  return `${TW_CARD_IMG_BASE}tw${String(id).padStart(8, "0")}.png`;
}

function createPlaceholderDataUrl(card) {
  const key = `${card.cardType || ""}|${card.name || ""}|${card.series || ""}|${card.number || ""}`;
  if (state.placeholderCache.has(key)) {
    return state.placeholderCache.get(key);
  }

  const typeColor = card.cardType === "Energy"
    ? "#1f6f3e"
    : card.cardType === "Trainer"
      ? "#1f4b7a"
      : "#7a5a1f";
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 588;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }
  ctx.fillStyle = typeColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px 'Segoe UI'";
  ctx.textAlign = "center";
  ctx.fillText(card.name || `Card ${card.id}`, canvas.width / 2, 260);
  ctx.font = "24px 'Segoe UI'";
  ctx.fillText(`${card.series || "N/A"} ${card.number || ""}`.trim(), canvas.width / 2, 310);
  ctx.fillText(card.cardType || "Pokemon", canvas.width / 2, 350);
  const dataUrl = canvas.toDataURL("image/png");
  setPlaceholderCacheValue(key, dataUrl);
  return dataUrl;
}

function getPlaceholderCacheKey(cardLike) {
  return `${cardLike.cardType || ""}|${cardLike.name || ""}|${cardLike.series || ""}|${cardLike.number || ""}`;
}

function cloneImageRefs(imageRefs) {
  if (!imageRefs) {
    return null;
  }
  return {
    primary: imageRefs.primary || "",
    secondary: imageRefs.secondary || "",
    placeholder: imageRefs.placeholder || "",
    activeUrl: imageRefs.activeUrl || "",
    resolved: imageRefs.resolved || ""
  };
}

function resolveCardIdForEntry(cardLike) {
  if (cardLike && cardLike.cardId) return Number(cardLike.cardId) || 0;
  // 嘗試從 catalog 查詢 cardId
  const s = normalizeSeries(cardLike && cardLike.series || "");
  const n = normalizeCardNumber(cardLike && cardLike.number || "");
  if (s && n && runtime.deckBuilderCatalogBySeriesNumber) {
    const key = `${s}|${n}`.toLowerCase();
    const matches = runtime.deckBuilderCatalogBySeriesNumber.get(key);
    if (matches && matches.length > 0 && matches[0].cardId) {
      return Number(matches[0].cardId) || 0;
    }
  }
  return 0;
}

function buildDefaultImageRefs(cardLike) {
  const cardId = resolveCardIdForEntry(cardLike);
  const onlineById = cardId ? getCardImageUrlById(cardId) : "";
  return {
    primary: onlineById || getCardImageUrl(cardLike && cardLike.series, cardLike && cardLike.number),
    secondary: getSecondaryImageUrl(cardLike && cardLike.series, cardLike && cardLike.number),
    placeholder: ""
  };
}

function getEntryImageRefs(entry) {
  return cloneImageRefs(entry && entry.imageRefs) || buildDefaultImageRefs(entry || {});
}

function clearDeckImageRefs(owner = "") {
  const owners = owner ? [owner] : ["player1", "opponent"];
  owners.forEach((name) => {
    if (!state.deckImageRefsByOwner[name]) {
      state.deckImageRefsByOwner[name] = new Map();
    }
    state.deckImageRefsByOwner[name].clear();
  });
}

function setDeckImageRefs(owner, syncId, refs, fallback = null) {
  if ((owner !== "player1" && owner !== "opponent") || !Number.isFinite(Number(syncId))) {
    return;
  }
  if (!state.deckImageRefsByOwner[owner]) {
    state.deckImageRefsByOwner[owner] = new Map();
  }
  const nextRefs = cloneImageRefs(refs) || buildDefaultImageRefs(fallback || {});
  state.deckImageRefsByOwner[owner].set(Number(syncId), nextRefs);
}

function syncDeckImageRefsFromCard(card) {
  if (!card || (card.owner !== "player1" && card.owner !== "opponent")) {
    return;
  }
  const syncId = Number(card.syncId) || 0;
  if (!syncId || !card.imageRefs) {
    return;
  }
  setDeckImageRefs(card.owner, syncId, card.imageRefs, card);
}

function primeDeckImageRefsFromEntries(owner, entries) {
  clearDeckImageRefs(owner);
  let syncId = 1;
  normalizeDeckEntries(entries).forEach((entry) => {
    const refs = getEntryImageRefs(entry);
    const copies = Math.max(1, Number(entry.count) || 1);
    for (let i = 0; i < copies; i += 1) {
      setDeckImageRefs(owner, syncId, refs, entry);
      syncId += 1;
    }
  });
}

function getDeckImageRefs(owner, syncId, fallback = null) {
  const map = state.deckImageRefsByOwner[owner];
  if (map instanceof Map && map.has(Number(syncId))) {
    return cloneImageRefs(map.get(Number(syncId)));
  }
  return buildDefaultImageRefs(fallback || {});
}

function stripImageRefsFromEntries(entries) {
  return normalizeDeckEntries(entries).map(({ imageRefs, ...entry }) => ({ ...entry }));
}

function getImportedDeckCacheSnapshot() {
  const imageUrls = new Set([getCardBackImageUrl()]);
  const placeholderKeys = new Set();

  ["player1", "opponent"].forEach((owner) => {
    const entries = state.importedDeckEntries[owner];
    if (!Array.isArray(entries)) {
      return;
    }
    entries.forEach((entry) => {
      const cid = resolveCardIdForEntry(entry);
      const onlineById = cid ? getCardImageUrlById(cid) : "";
      const primary = onlineById || getCardImageUrl(entry.series, entry.number);
      const secondary = getSecondaryImageUrl(entry.series, entry.number);
      if (primary) {
        imageUrls.add(primary);
      }
      if (secondary) {
        imageUrls.add(secondary);
      }
      placeholderKeys.add(getPlaceholderCacheKey(entry));
    });
  });

  return { imageUrls, placeholderKeys };
}

function pruneImageCachesToImportedDecks() {
  const snapshot = getImportedDeckCacheSnapshot();

  [...state.imageCache.keys()].forEach((key) => {
    if (!snapshot.imageUrls.has(key)) {
      state.imageCache.delete(key);
    }
  });

  [...state.placeholderCache.keys()].forEach((key) => {
    if (!snapshot.placeholderKeys.has(key)) {
      state.placeholderCache.delete(key);
    }
  });

  [...runtime.preloadedImageHandles.keys()].forEach((key) => {
    if (!snapshot.imageUrls.has(key)) {
      runtime.preloadedImageHandles.delete(key);
    }
  });
}

function getCardBackImageUrl() {
  return "./assets/pokemon-card-back.png";
}

function getImageSourcesForCard(card) {
  if (!card.imageRefs) {
    const refs = buildDefaultImageRefs(card);
    refs.activeUrl = "";
    card.imageRefs = refs;
  }
  return card.imageRefs;
}

function resolvePreferredImageUrl(card) {
  const refs = getImageSourcesForCard(card);
  if (refs.activeUrl) {
    return refs.activeUrl;
  }
  if (refs.primary && state.imageCache.get(refs.primary) === true) {
    refs.activeUrl = refs.primary;
    return refs.activeUrl;
  }
  if (refs.secondary && state.imageCache.get(refs.secondary) === true) {
    refs.activeUrl = refs.secondary;
    return refs.activeUrl;
  }
  if (refs.primary && state.imageCache.get(refs.primary) === false && refs.secondary && state.imageCache.get(refs.secondary) === false) {
    if (!refs.placeholder) {
      refs.placeholder = createPlaceholderDataUrl(card);
    }
    refs.activeUrl = refs.placeholder;
    return refs.activeUrl;
  }
  return refs.primary || refs.secondary || refs.placeholder || "";
}

function retainDecodedImageHandle(url, img) {
  if (!url || !img) {
    return;
  }
  runtime.preloadedImageHandles.set(url, img);
}

function parseDeckList(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = [];
  const errors = [];

  lines.forEach((line, idx) => {
    const matched = line.match(DECK_LINE_REGEX);
    if (!matched) {
      errors.push(`第 ${idx + 1} 行格式錯誤: ${line}`);
      return;
    }
    const count = Number(matched[1]);
    const name = matched[2].trim();
    const series = normalizeSeries(matched[3]);
    const number = normalizeCardNumber(matched[4]);
    parsed.push({ count, name, series, number, cardType: classifyCardType(name) });
  });

  return { parsed, errors };
}

function extractDeckEntriesFromHtml(htmlText) {
  const entries = [];
  const byKey = new Map();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const text = `${doc.body ? doc.body.textContent || "" : ""}\n${htmlText}`;

  const lineRegex = /(\d+)\s+([^\n\r]{1,80}?)\s+([A-Za-z]{2,}\d+[A-Za-z]?)\s+([0-9]{1,3}[A-Za-z]?)/g;
  let lineMatch = null;
  while ((lineMatch = lineRegex.exec(text)) !== null) {
    const count = Number(lineMatch[1]);
    const name = String(lineMatch[2]).trim();
    const series = normalizeSeries(lineMatch[3]);
    const number = normalizeCardNumber(lineMatch[4]);
    const key = `${series}_${number}_${name}`;
    if (!byKey.has(key)) {
      byKey.set(key, { count: 0, name, series, number, cardType: classifyCardType(name) });
    }
    byKey.get(key).count += Number.isFinite(count) ? count : 1;
  }

  if (byKey.size > 0) {
    return [...byKey.values()];
  }

  let match = null;
  const seen = new Set();
  while ((match = PTCG_TW_ID_REGEX.exec(text)) !== null) {
    const series = normalizeSeries(match[1]);
    const number = normalizeCardNumber(match[2]);
    const key = `${series}_${number}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({
      count: 1,
      name: key,
      series,
      number,
      cardType: classifyCardType(key)
    });
    if (entries.length >= 60) {
      break;
    }
  }

  return entries;
}

function extractJsonObjectFromText(rawText) {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("代理回應中找不到 JSON 內容。");
  }
  return rawText.slice(start, end + 1);
}

function readDeckCount(rawCard) {
  const candidateKeys = ["count", "qty", "quantity", "張數", "撘菜"];
  for (const key of candidateKeys) {
    if (rawCard[key] !== undefined) {
      const value = Number(rawCard[key]);
      if (Number.isFinite(value) && value > 0) {
        return value;
      }
    }
  }
  return 1;
}

function mapRawCardType(rawType, fallbackName) {
  const t = String(rawType || "").toLowerCase();
  if (t.includes("能量") || t.includes("energy")) {
    return "Energy";
  }
  if (t.includes("物品") || t.includes("支援") || t.includes("競技場") || t.includes("trainer") || t.includes("item") || t.includes("support")) {
    return "Trainer";
  }
  return classifyCardType(fallbackName || "");
}

function parseSetNumber(rawSetNo) {
  const text = String(rawSetNo || "").trim();
  if (!text) {
    return "";
  }
  const firstPart = text.split("/")[0] || text;
  const m = firstPart.match(/(\d+[A-Za-z]?)/);
  return m ? normalizeCardNumber(m[1]) : normalizeCardNumber(firstPart);
}

function extractPtcgtwDeckCode(input) {
  const text = String(input || "").trim();
  if (!text) {
    return "";
  }
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const s = url.searchParams.get("s");
      if (s && PTCG_TW_DECK_CODE_REGEX.test(s.trim())) {
        return s.trim().toUpperCase();
      }
    } catch {
      return "";
    }
  }
  const m = text.match(PTCG_TW_DECK_CODE_REGEX);
  return m ? m[1].toUpperCase() : "";
}

async function fetchPtcgtwDeckEntriesByCode(deckCode) {
  const url = `${PTCG_TW_PROXY_API}?code=${encodeURIComponent(deckCode)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`代理 API 讀取失敗: ${response.status}`);
  }
  const text = await response.text();
  const jsonText = extractJsonObjectFromText(text);
  const data = JSON.parse(jsonText);
  if (!data || !data.success || !Array.isArray(data.deck)) {
    throw new Error((data && data.message) || "無法取得牌組資料。");
  }

  const entries = data.deck.map((rawCard) => {
    const name = (rawCard.name_tw || rawCard.name_en || rawCard.name_jp || rawCard.name || "Unknown").trim();
    const series = normalizeSeries(rawCard.set_name || "");
    const number = parseSetNumber(rawCard.set_no || "");
    const count = readDeckCount(rawCard);
    const imageNormal = String(rawCard.image_normal || "").trim();
    const imageUrl = String(rawCard.image_url || rawCard.imgur_url || "").trim();
    const primary = imageNormal || getCardImageUrl(series, number);
    const secondary = imageUrl || getSecondaryImageUrl(series, number);
    return {
      count,
      name,
      series,
      number,
      cardType: mapRawCardType(rawCard.card_type, name),
      elementType: inferElementTypeByText(rawCard.card_type || name),
      imageRefs: { primary, secondary, placeholder: "" }
    };
  });

  return entries;
}

async function parseDeckInputToEntries(rawText, owner = "") {
  const input = (rawText || "").trim();
  if (!input) {
    throw new Error("請先輸入卡表或連結。");
  }

  const deckCode = extractPtcgtwDeckCode(input);
  if (deckCode) {
    if (owner === "player1" || owner === "opponent") {
      setImportPhase(owner, owner === "player1" ? "讀取我方卡表連結中" : "讀取對手卡表連結中");
    }
    return fetchPtcgtwDeckEntriesByCode(deckCode);
  }

  if (/^https?:\/\/(www\.)?ptcgtw\.shop/i.test(input)) {
    if (owner === "player1" || owner === "opponent") {
      setImportPhase(owner, owner === "player1" ? "讀取我方卡表連結中" : "讀取對手卡表連結中");
    }
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`無法讀取連結: ${response.status}`);
    }
    const html = await response.text();
    const entries = extractDeckEntriesFromHtml(html);
    if (entries.length === 0) {
      throw new Error("未在連結中解析到卡片 ID。");
    }
    return entries;
  }

  const { parsed, errors } = parseDeckList(input);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  return parsed;
}

async function parseDeckInputToEntriesCached(rawText, owner = "") {
  const cacheKey = String(rawText || "").trim();
  if (!cacheKey) {
    return parseDeckInputToEntries(rawText, owner);
  }
  if (runtime.deckParseCache.has(cacheKey)) {
    return normalizeDeckEntries(runtime.deckParseCache.get(cacheKey)).map((entry) => ({ ...entry }));
  }
  const parsed = await parseDeckInputToEntries(cacheKey, owner);
  const normalized = normalizeDeckEntries(parsed).map((entry) => ({ ...entry }));
  runtime.deckParseCache.set(cacheKey, normalized);
  return normalized.map((entry) => ({ ...entry }));
}

function setImportProgress(owner, done, total, active = false, phase = null) {
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  const nextDone = Math.max(0, Number(done) || 0);
  const nextTotal = Math.max(0, Number(total) || 0);
  const percent = nextTotal === 0 ? 0 : Math.round((nextDone / nextTotal) * 100);
  const previous = state.importProgress[owner] || { phase: "" };
  const shouldResetMetrics = nextDone === 0 && nextTotal === 0 && !active && (phase === "" || phase == null);
  state.importProgress[owner] = {
    done: nextDone,
    total: nextTotal,
    active: !!active,
    phase: phase == null ? (previous.phase || "") : String(phase || ""),
    parseMs: shouldResetMetrics ? 0 : (Number(previous.parseMs) || 0),
    downloadMs: shouldResetMetrics ? 0 : (Number(previous.downloadMs) || 0),
    cacheMs: shouldResetMetrics ? 0 : (Number(previous.cacheMs) || 0),
    displayPercent: shouldResetMetrics ? null : (Number.isFinite(previous.displayPercent) ? previous.displayPercent : null)
  };
  const current = state.importProgress[owner];
  const displayPercent = Number.isFinite(current.displayPercent) ? current.displayPercent : percent;
  const ownerBar = document.getElementById(`image-progress-bar-${owner}`);
  const ownerText = document.getElementById(`image-progress-text-${owner}`);
  if (ownerBar) {
    ownerBar.style.width = `${displayPercent}%`;
  }
  if (ownerText) {
    ownerText.textContent = `${displayPercent}%`;
  }
  updateImportStatusTexts();
}

function setImportDisplayPercent(owner, percent = null) {
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  const current = state.importProgress[owner] || { done: 0, total: 0, active: false, phase: "", parseMs: 0, downloadMs: 0, cacheMs: 0 };
  state.importProgress[owner] = {
    ...current,
    displayPercent: Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : null
  };
  setImportProgress(owner, current.done || 0, current.total || 0, !!current.active, current.phase || "");
}

function resetImportMetrics(owner) {
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  const current = state.importProgress[owner] || { done: 0, total: 0, active: false, phase: "" };
  state.importProgress[owner] = {
    ...current,
    parseMs: 0,
    downloadMs: 0,
    cacheMs: 0,
    displayPercent: null
  };
  updateImportStatusTexts();
}

function setImportMetric(owner, key, valueMs) {
  if ((owner !== "player1" && owner !== "opponent") || !["parseMs", "downloadMs", "cacheMs"].includes(key)) {
    return;
  }
  const current = state.importProgress[owner] || { done: 0, total: 0, active: false, phase: "" };
  state.importProgress[owner] = {
    ...current,
    [key]: Math.max(0, Number(valueMs) || 0)
  };
  updateImportStatusTexts();
}

function formatImportMetrics(owner) {
  const progress = state.importProgress[owner];
  if (!progress) {
    return "";
  }
  const parts = [];
  if (progress.parseMs > 0) {
    parts.push(`解析 ${Math.max(0.01, progress.parseMs / 1000).toFixed(2)}s`);
  }
  if (progress.downloadMs > 0) {
    parts.push(`下載 ${Math.max(0.01, progress.downloadMs / 1000).toFixed(2)}s`);
  }
  if (progress.cacheMs > 0) {
    parts.push(`快取 ${Math.max(0.01, progress.cacheMs / 1000).toFixed(2)}s`);
  }
  return parts.join(" / ");
}

function setImportPhase(owner, phase) {
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  const current = state.importProgress[owner] || { done: 0, total: 0, active: false, phase: "" };
  setImportProgress(owner, current.done || 0, current.total || 0, !!current.active, phase);
}

function updateImageProgress(done, total, owner = "player1") {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const bar = document.getElementById("image-progress-bar");
  const text = document.getElementById("image-progress-text");
  setImportProgress(owner, done, total, total > 0 && percent < 100);
  if (bar) {
    bar.style.width = `${percent}%`;
  }
  if (text) {
    text.textContent = `${percent}%`;
  }
}

function getImportPhaseLabel(owner) {
  const progress = state.importProgress[owner];
  const phase = String(progress?.phase || "").trim();
  if (phase) {
    return phase;
  }
  if (owner === "player1") {
    if (progress?.active) {
      return "匯入我方卡表中";
    }
    if (state.importLock.player1) {
      return "我方卡表已就緒";
    }
    return "";
  }
  if (state.singlePlayer) {
    if (progress?.active) {
      return "匯入對手卡表中";
    }
    if (state.importLock.opponent) {
      return "對手卡表已就緒";
    }
    return "";
  }
  if (state.importProgress.opponent?.active) {
    return "對手卡表下載中";
  }
  if (state.importLock.opponent) {
    return "對手卡表已就緒";
  }
  if (state.importedDeckSourceText.opponent || (Array.isArray(state.importedDeckEntries.opponent) && state.importedDeckEntries.opponent.length > 0)) {
    return "對手卡表同步中";
  }
  return "等待對手匯入";
}

function isOwnerImportFullyReady(owner) {
  if (owner !== "player1" && owner !== "opponent") {
    return false;
  }
  const progress = state.importProgress[owner] || {};
  const displayPercent = Number.isFinite(progress.displayPercent)
    ? progress.displayPercent
    : ((Number(progress.total) || 0) > 0 ? Math.round(((Number(progress.done) || 0) / Math.max(1, Number(progress.total) || 0)) * 100) : 0);
  const phase = String(progress.phase || "").trim();
  const readyPhase = owner === "player1" ? "我方卡表已就緒" : "對手卡表已就緒";
  return !!state.importLock[owner] && !progress.active && displayPercent >= 100 && phase === readyPhase;
}

function buildCardsFromEntries(entries, owner, startId) {
  const nextCards = [];
  let id = startId;
  let syncId = 1;
  entries.forEach((entry) => {
    for (let i = 0; i < entry.count; i += 1) {
      nextCards.push({
        id,
        owner,
        syncId,
        zoneId: getOwnerDeckZone(owner),
        isFaceUp: false,
        name: entry.name,
        cardType: entry.cardType,
        elementType: entry.elementType || inferElementTypeByText(entry.name),
        series: entry.series,
        number: entry.number,
        imageRefs: getDeckImageRefs(owner, syncId, entry),
        poison: false,
        burn: false,
        behaviorStatus: "",
        rotationDeg: 0
      });
      id += 1;
      syncId += 1;
    }
  });
  return nextCards.slice(0, 60);
}

function normalizeDeckEntries(entries) {
  return (entries || []).map((entry) => {
    const base = {
      count: Number(entry.count) || 0,
      name: String(entry.name || "").trim(),
      series: normalizeSeries(entry.series || ""),
      number: normalizeCardNumber(entry.number || ""),
      cardType: entry.cardType || classifyCardType(entry.name || ""),
      elementType: entry.elementType || inferElementTypeByText(entry.name || ""),
      imageRefs: entry.imageRefs ? {
        primary: entry.imageRefs.primary || "",
        secondary: entry.imageRefs.secondary || "",
        placeholder: entry.imageRefs.placeholder || ""
      } : undefined
    };
    if (entry.cardId) base.cardId = Number(entry.cardId) || 0;
    return base;
  }).filter((entry) => entry.count > 0);
}

function sanitizeDeckEntriesForSync(entries) {
  return normalizeDeckEntries(entries).map((entry) => {
    const synced = {
      count: Number(entry.count) || 0,
      name: String(entry.name || "").trim(),
      series: normalizeSeries(entry.series || ""),
      number: normalizeCardNumber(entry.number || ""),
      cardType: entry.cardType || classifyCardType(entry.name || ""),
      elementType: entry.elementType || inferElementTypeByText(entry.name || "")
    };
    if (entry.cardId) synced.cardId = Number(entry.cardId) || 0;
    return synced;
  });
}

function sanitizeCardForSync(card) {
  return {
    ...card,
    imageRefs: null
  };
}

function buildCardIdentityPayload(card) {
  return {
    name: String(card && card.name || "").trim(),
    series: normalizeSeries(card && card.series || ""),
    number: normalizeCardNumber(card && card.number || ""),
    cardType: card && card.cardType ? card.cardType : classifyCardType(card && card.name || ""),
    elementType: card && card.elementType ? card.elementType : inferElementTypeByText(card && card.name || "")
  };
}

function createRemoteCardFromSyncPayload(owner, payload = {}) {
  const maxId = cards.reduce((max, card) => Math.max(max, Number(card.id) || 0), 0);
  const identity = buildCardIdentityPayload(payload);
  return {
    id: maxId + 1,
    owner,
    syncId: Number(payload.syncId) || 0,
    zoneId: mirrorZoneId(payload.to || "") || getOwnerDeckZone(owner),
    isFaceUp: !!payload.isFaceUp,
    ...identity,
    imageRefs: getDeckImageRefs(owner, Number(payload.syncId) || 0, identity),
    poison: !!payload.poison,
    burn: !!payload.burn,
    behaviorStatus: String(payload.behaviorStatus || ""),
    rotationDeg: Number(payload.rotationDeg) || 0
  };
}

function getOrCreateCardBySyncPayload(owner, payload = {}) {
  const syncId = Number(payload.syncId) || 0;
  if (!syncId) {
    return null;
  }
  let card = getCardBySyncKey(owner, syncId);
  if (card) {
    if (!card.name && payload.name) {
      Object.assign(card, buildCardIdentityPayload(payload));
    }
    if (!card.imageRefs) {
      card.imageRefs = getDeckImageRefs(owner, syncId, payload);
    }
    return card;
  }
  card = createRemoteCardFromSyncPayload(owner, payload);
  cards.push(card);
  return card;
}

function getDeckLibraryFromStorage() {
  try {
    const raw = localStorage.getItem("ptcg.deckLibrary");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setDeckLibraryToStorage(list) {
  try {
    localStorage.setItem("ptcg.deckLibrary", JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function notifyDeckLibraryUpdated() {
  if (!runtime.ipcRenderer) {
    return;
  }
  runtime.ipcRenderer.send("deck-library-updated");
}

function applyBackgroundImage(value = "") {
  const root = document.documentElement;
  if (!root) {
    return;
  }
  const wallpaper = value && String(value).trim()
    ? `url("${String(value).replace(/"/g, '\\"')}")`
    : 'url("./wallpapers/mega_greninja.jpg")';
  root.style.setProperty("--app-wallpaper", wallpaper);
}

function normalizeBackgroundStrength(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round(n)));
}

function applyBackgroundStrength(value = 100) {
  const root = document.documentElement;
  if (!root) {
    return;
  }
  const strength = normalizeBackgroundStrength(value);
  const ratio = strength / 100;
  const overlayAlpha = (0.18 - ratio * 0.14).toFixed(3);
  const boardAlpha = (0.72 - ratio * 0.24).toFixed(3);
  root.style.setProperty("--app-bg-overlay-alpha", overlayAlpha);
  root.style.setProperty("--app-board-alpha", boardAlpha);
  return strength;
}

function loadBackgroundImageSetting() {
  try {
    const raw = localStorage.getItem(CUSTOM_BG_STORAGE_KEY) || "";
    applyBackgroundImage(raw);
  } catch {
    applyBackgroundImage("");
  }
  try {
    const rawStrength = localStorage.getItem(CUSTOM_BG_STRENGTH_KEY);
    applyBackgroundStrength(rawStrength == null ? 100 : rawStrength);
  } catch {
    applyBackgroundStrength(100);
  }
}

function formatSavedAt(isoText) {
  try {
    return new Date(isoText).toLocaleString();
  } catch {
    return isoText || "";
  }
}

function showToast(message, type = "success", durationMs = 2200) {
  const host = document.getElementById("toast-container");
  if (!host || !message) {
    return;
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = String(message);
  host.appendChild(toast);
  const timerId = ++runtime.toastTimerSeq;
  window.setTimeout(() => {
    if (!toast.isConnected) {
      return;
    }
    toast.classList.add("leaving");
    window.setTimeout(() => {
      if (toast.isConnected && timerId <= runtime.toastTimerSeq + 1) {
        toast.remove();
      }
    }, 220);
  }, Math.max(900, durationMs));
}

function isDeckSaveModalOpen() {
  const modal = document.getElementById("deck-save-modal");
  return !!modal && !modal.classList.contains("hidden");
}

function isSettingsModalOpen() {
  const modal = document.getElementById("settings-modal");
  return !!modal && !modal.classList.contains("hidden");
}

function isResetConfirmModalOpen() {
  const modal = document.getElementById("reset-confirm-modal");
  return !!modal && !modal.classList.contains("hidden");
}

function setImagePreloadPaused(paused) {
  runtime.imagePreloadPaused = !!paused;
}

function delayMs(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function logRendererDiagnostic(type, payload = {}) {
  if (!runtime.ipcRenderer || typeof runtime.ipcRenderer.invoke !== "function") {
    return;
  }
  const memory = getMemoryStats();
  const diagnosticPayload = {
    type,
    payload,
    viewer: state.currentViewer || "player1",
    draggingCardIds: [...state.draggingCardIds],
    caches: {
      imageCacheSize: state.imageCache.size,
      placeholderCacheSize: state.placeholderCache.size,
      retainedImageHandleSize: runtime.preloadedImageHandles.size,
      deckParseCacheSize: runtime.deckParseCache.size
    },
    runtime: {
      pendingAnimations: state.pendingAnimations.length,
      autoSetupRunning: !!runtime.autoSetupRunning,
      deckActionInProgress: !!runtime.deckActionInProgress
    },
    memory,
    overlay: {
      isOpen: !!state.overlay.isOpen,
      type: state.overlay.type || "",
      owner: state.overlay.owner || ""
    }
  };
  if (typeof runtime.ipcRenderer.send === "function") {
    try {
      runtime.ipcRenderer.send("update-diagnostic-state", diagnosticPayload);
    } catch {
      // Ignore diagnostic state update failures.
    }
  }
  void runtime.ipcRenderer.invoke("append-diagnostic-log", diagnosticPayload).catch(() => {});
}

function appendGameLog(message) {
  const text = String(message || "").trim();
  if (!text) {
    return;
  }
  runtime.gameLogs.unshift(`[${new Date().toLocaleTimeString()}] ${text}`);
  runtime.gameLogs = runtime.gameLogs.slice(0, 36);
}

function getOwnerResourceCounts(owner) {
  return {
    deck: getCardsInZone(getOwnerDeckZone(owner)).length,
    discard: getCardsInZone(getOwnerDiscardZone(owner)).length,
    prize: getCardsInZone(getOwnerPrizeZone(owner)).length
  };
}

function renderResourceMonitor() {
  const owners = ["player1", "opponent"];
  owners.forEach((owner) => {
    const counts = getOwnerResourceCounts(owner);
    const deckEl = document.getElementById(`resource-${owner}-deck`);
    const discardEl = document.getElementById(`resource-${owner}-discard`);
    const prizeEl = document.getElementById(`resource-${owner}-prize`);
    if (deckEl) {
      deckEl.textContent = String(counts.deck);
    }
    if (discardEl) {
      discardEl.textContent = String(counts.discard);
    }
    if (prizeEl) {
      prizeEl.textContent = String(counts.prize);
    }
  });
}

function showWinnerBanner(text = "WINNER!") {
  const el = document.getElementById("winner-banner");
  if (!el) {
    return;
  }
  el.textContent = text;
  el.classList.remove("hidden");
  el.classList.remove("showing");
  void el.offsetWidth;
  el.classList.add("showing");
  el.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    el.classList.remove("showing");
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
  }, 1650);
}

function checkWinnerByPrize() {
  if (state.gamePhase !== "遊戲中") {
    return;
  }
  ["player1", "opponent"].forEach((owner) => {
    const prizeNow = getCardsInZone(getOwnerPrizeZone(owner)).length;
    const prev = state.prizeCountSnapshot[owner];
    if (prev !== null && prev > 0 && prizeNow === 0) {
      const winnerText = owner === "player1" ? "WINNER! 我方" : "WINNER! 對手";
      showWinnerBanner(winnerText);
      showToast(winnerText, "success", 2000);
      appendGameLog(`${winnerText}（獎勵卡歸零）`);
    }
    state.prizeCountSnapshot[owner] = prizeNow;
  });
}

function getTypeHint(defenderType, attackerType) {
  if (!defenderType || !attackerType) {
    return null;
  }
  const rule = TYPE_EFFECTIVENESS_MAP[defenderType];
  if (!rule) {
    return null;
  }
  if (Array.isArray(rule.weakTo) && rule.weakTo.includes(attackerType)) {
    return { text: "弱點 x2", className: "weakness" };
  }
  if (Array.isArray(rule.resistTo) && rule.resistTo.includes(attackerType)) {
    return { text: "抵抗力 -30", className: "resistance" };
  }
  return null;
}

function updateActiveTypeHintForDefender(defenderZoneId) {
  if (!ACTIVE_MAIN_ZONES.has(defenderZoneId)) {
    return;
  }
  const defender = getCardsInZone(defenderZoneId)[0] || null;
  const attackerZone = defenderZoneId === "player1-active" ? "opponent-active" : "player1-active";
  const attacker = getCardsInZone(attackerZone)[0] || null;
  const hint = getTypeHint(getCardElementType(defender), getCardElementType(attacker));
  state.typeHintByZone[defenderZoneId] = hint;
}

function updateActiveTypeHints() {
  updateActiveTypeHintForDefender("player1-active");
  updateActiveTypeHintForDefender("opponent-active");
}

function anyCardOnBoard() {
  return cards.some((card) => card.zoneId !== getOwnerDeckZone(card.owner));
}

function openResetConfirmModal() {
  const modal = document.getElementById("reset-confirm-modal");
  if (!modal) {
    return Promise.resolve(true);
  }
  if (typeof runtime.pendingResetResolve === "function") {
    runtime.pendingResetResolve(false);
    runtime.pendingResetResolve = null;
  }
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  return new Promise((resolve) => {
    runtime.pendingResetResolve = resolve;
  });
}

function resolveResetConfirm(ok) {
  const modal = document.getElementById("reset-confirm-modal");
  if (modal) {
    hideWithAnimation(modal);
    modal.setAttribute("aria-hidden", "true");
  }
  const resolver = runtime.pendingResetResolve;
  runtime.pendingResetResolve = null;
  if (typeof resolver === "function") {
    resolver(!!ok);
  }
}

async function animateMoveSingleCard(card, toZoneId, opts = {}) {
  if (!card || !toZoneId) {
    return false;
  }
  const fromZoneId = card.zoneId;
  const beforeMap = new Map([[card.id, fromZoneId]]);
  queueMoveAnimation(card, fromZoneId, toZoneId);
  moveCardToZone(card, toZoneId);
  if (opts.faceUp === true) {
    card.isFaceUp = true;
  }
  if (opts.faceDown === true) {
    card.isFaceUp = false;
  }
  renderBoardForMovedCards(beforeMap, [card.id]);
  await delayMs(Number.isFinite(opts.delayMs) ? opts.delayMs : 150);
  return true;
}

function prepareOpeningDeckOrder(owner, syncOrder = null) {
  const deckZoneId = getOwnerDeckZone(owner);
  const deckCards = getCardsInZone(deckZoneId);
  if (deckCards.length === 0) {
    return null;
  }

  if (Array.isArray(syncOrder) && syncOrder.length > 0) {
    reorderDeckBySyncIds(owner, syncOrder);
    return syncOrder.map((id) => Number(id));
  }

  const shuffled = fisherYatesShuffle(deckCards).map((card) => Number(card.syncId));
  reorderDeckBySyncIds(owner, shuffled);
  return shuffled;
}

async function drawOpeningHandForOwner(owner = "player1", options = {}) {
  const { setupPrize = false } = options;
  const deckZoneId = getOwnerDeckZone(owner);
  const deckCards = getCardsInZone(deckZoneId);
  if (deckCards.length === 0) {
    showToast("牌組為空，無法開始新對局。", "warn", 2200);
    return false;
  }

  renderBoard();
  triggerShuffleAnimation(deckZoneId);
  appendGameLog(`${owner === "player1" ? "我方" : "對手"}牌組已洗牌`);
  await delayMs(150);

  for (let i = 0; i < 7; i += 1) {
    const top = drawCardFromDeck(owner, false);
    if (!top) {
      break;
    }
    await animateMoveSingleCard(top, getOwnerHandZone(owner), { faceUp: true, delayMs: 150 });
  }
  appendGameLog(`${owner === "player1" ? "我方" : "對手"}抽取 7 張手牌`);

  if (setupPrize) {
    const prizeZoneId = getOwnerPrizeZone(owner);
    for (let i = 0; i < 6; i += 1) {
      const top = drawCardFromDeck(owner, false);
      if (!top) {
        break;
      }
      await animateMoveSingleCard(top, prizeZoneId, { faceDown: true, delayMs: 150 });
    }
    appendGameLog(`${owner === "player1" ? "我方" : "對手"}放置 6 張獎勵卡`);
  }
  return true;
}

async function runAutoSetupForOwner(owner = "player1", options = {}) {
  const syncOrder = prepareOpeningDeckOrder(owner, options.shuffleOrder || null);
  if (!syncOrder) {
    showToast("牌組為空，無法開始新對局。", "warn", 2200);
    return false;
  }
  return drawOpeningHandForOwner(owner, { setupPrize: false });
}

function getDeckCoverImageFromEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const pokemonEntry = list.find((e) => String(e.cardType || "").toLowerCase() === "pokemon")
    || list[0]
    || null;
  if (!pokemonEntry) {
    return "";
  }
  const refs = getEntryImageRefs(pokemonEntry);
  return refs.primary || refs.secondary || "";
}

function applyCachedImageMapToEntries(entries, map = {}) {
  return entries.map((entry) => {
    const next = { ...entry };
    const refs = getEntryImageRefs(entry);
    const primary = refs.primary || "";
    const secondary = refs.secondary || "";
    next.imageRefs = {
      ...refs,
      primary: map[primary] || primary,
      secondary: map[secondary] || secondary
    };
    return next;
  });
}

async function cacheDeckImagesForOffline(deckId, entries, owner) {
  if (!runtime.ipcRenderer) {
    return entries;
  }
  const urls = [];
  entries.forEach((entry) => {
    const refs = getEntryImageRefs(entry);
    if (refs.primary) {
      urls.push(refs.primary);
    }
    if (refs.secondary) {
      urls.push(refs.secondary);
    }
  });
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (uniqueUrls.length === 0) {
    return entries;
  }
  const taskId = `${owner}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  runtime.cacheTaskByOwner[owner] = taskId;
  try {
    const result = await runtime.ipcRenderer.invoke("cache-image-urls", { deckId, urls: uniqueUrls, taskId });
    if (runtime.cacheTaskByOwner[owner] !== taskId) {
      return entries;
    }
    const map = result && result.map ? result.map : {};
    return applyCachedImageMapToEntries(entries, map);
  } catch {
    return entries;
  } finally {
    if (runtime.cacheTaskByOwner[owner] === taskId) {
      runtime.cacheTaskByOwner[owner] = "";
    }
  }
}

function buildExpandedDeckEntries(entries) {
  const expanded = [];
  normalizeDeckEntries(entries).forEach((entry) => {
    for (let i = 0; i < (Number(entry.count) || 0); i += 1) {
      expanded.push({
        ...entry,
        imageRefs: getEntryImageRefs(entry)
      });
    }
  });
  return expanded.slice(0, 60);
}

function syncCachedEntryRefsToCards(owner, entries) {
  const expanded = buildExpandedDeckEntries(entries);
  expanded.forEach((entry, index) => {
    const card = getCardBySyncKey(owner, index + 1);
    if (!card) {
      return;
    }
    card.imageRefs = entry.imageRefs ? { ...entry.imageRefs } : null;
  });
}

async function cacheImportedDeckImagesInBackground(owner, entries) {
  if (!runtime.ipcRenderer || !Array.isArray(entries) || entries.length === 0) {
    return;
  }
  const cacheStartedAt = performance.now();
  const deckId = `live-${owner}-${state.peer.remoteId || "local"}`;
  const cachedEntries = await cacheDeckImagesForOffline(deckId, entries, owner);
  primeDeckImageRefsFromEntries(owner, cachedEntries);
  setImportMetric(owner, "cacheMs", performance.now() - cacheStartedAt);
  setImportDisplayPercent(owner, null);
  if (state.importLock[owner]) {
    setImportProgress(owner, entries.length, entries.length, false, owner === "player1" ? "我方卡表已就緒" : "對手卡表已就緒");
    updateAutoSetupButtonUi();
    updateDeckImportAvailability();
    updateOpponentImportSyncView();
    checkAndStartBattle();
  }
}

function scheduleImportedDeckCache(owner, entries, preloadSeq) {
  const tryRun = async (attempt = 0) => {
    if (preloadSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return;
    }
      const activeImports = ["player1", "opponent"].some((key) => key !== owner && !!state.importProgress[key].active);
      if (activeImports && attempt < 24) {
        window.setTimeout(() => {
          void tryRun(attempt + 1);
      }, 180);
        return;
      }
      setImportProgress(owner, entries.length, entries.length, true, owner === "player1" ? "寫入本地快取中" : "對手卡圖寫入本地快取中");
      setImportDisplayPercent(owner, 99);
      await cacheImportedDeckImagesInBackground(owner, entries).catch(() => {});
    };
  window.setTimeout(() => {
    void tryRun(0);
  }, 250);
}

async function warmCardImages(cardList, owner, jobSeq = runtime.preloadJobSeqByOwner[owner]) {
  const list = cardList.filter(Boolean);
  const targetsByKey = new Map();
  list.forEach((card) => {
    const refs = getImageSourcesForCard(card);
    const key = [refs.primary || "", refs.secondary || "", getPlaceholderCacheKey(card)].join("|");
    if (!targetsByKey.has(key)) {
      targetsByKey.set(key, { sample: card, cards: [] });
    }
    targetsByKey.get(key).cards.push(card);
  });
  const targets = [...targetsByKey.values()];
  const concurrency = Math.min(10, Math.max(4, Math.ceil(targets.length / 10) || 4));
  let cursor = 0;

  const processTarget = async (target) => {
    if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return false;
    }
    while (runtime.imagePreloadPaused) {
      if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
        return false;
      }
      await delayMs(50);
    }
    const resolved = await preloadImageWithFallback(target.sample);
    if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return false;
    }
    target.cards.forEach((card) => {
      if (!card.imageRefs) {
        card.imageRefs = { primary: "", secondary: "", placeholder: "" };
      }
      if (resolved === card.imageRefs.primary) {
        card.imageRefs.resolved = "primary";
        card.imageRefs.activeUrl = card.imageRefs.primary;
      } else if (resolved === card.imageRefs.secondary) {
        card.imageRefs.resolved = "secondary";
        card.imageRefs.activeUrl = card.imageRefs.secondary;
      } else {
        card.imageRefs.placeholder = resolved;
        card.imageRefs.resolved = "placeholder";
        card.imageRefs.activeUrl = card.imageRefs.placeholder;
      }
      syncDeckImageRefsFromCard(card);
    });
    return true;
  };

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < targets.length) {
      const currentIndex = cursor;
      cursor += 1;
      const ok = await processTarget(targets[currentIndex]);
      if (!ok) {
        return false;
      }
    }
    return true;
  });

  const results = await Promise.all(workers);
  return !results.some((ok) => !ok);
}

async function savePendingDeckToLocal() {
  if (runtime.deckSaveInProgress) {
    return;
  }
  if (!runtime.pendingDeckSave) {
    showToast("目前沒有可儲存的解析結果，請先成功匯入卡表。", "warn", 2400);
    return;
  }
  const confirmBtn = document.getElementById("deck-save-confirm-btn");
  const input = document.getElementById("deck-save-name-input");
  const deckName = input ? input.value : "";
  if (!deckName || !deckName.trim()) {
    showToast("請輸入牌組名稱", "warn", 2000);
    if (input) {
      input.focus();
    }
    return;
  }
  runtime.deckSaveInProgress = true;
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.classList.add("is-saving");
    confirmBtn.textContent = "儲存中...";
  }
  try {
    const base = runtime.pendingDeckSave;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entriesForSave = normalizeDeckEntries(base.entries);
    const item = {
      id,
      name: deckName.trim(),
      savedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      owner: base.owner,
      rawText: base.rawText,
      coverImageUrl: getDeckCoverImageFromEntries(entriesForSave) || base.coverImageUrl || "",
      entries: entriesForSave
    };
    runtime.deckLibrary = [item, ...runtime.deckLibrary];
    renderDeckLibraryList();
    requestAnimationFrame(() => {
      renderDeckLibraryList();
      const list = document.getElementById("deck-library-list");
      if (list) {
        list.scrollTop = 0;
      }
    });
    const written = setDeckLibraryToStorage(runtime.deckLibrary);
    if (!written) {
      showToast("已加入清單，但本地寫入失敗", "warn", 2800);
    } else {
      notifyDeckLibraryUpdated();
      showToast(`已儲存牌組：${item.name}`, "success", 1800);
    }
    runtime.pendingDeckSave = null;
    const btn = document.getElementById("save-deck-named-btn");
    if (btn) {
      btn.classList.add("hidden");
      btn.disabled = true;
    }
    const modal = document.getElementById("deck-save-modal");
    if (modal) {
      hideWithAnimation(modal);
      modal.setAttribute("aria-hidden", "true");
    }
    setImagePreloadPaused(false);
    if (input) {
      input.value = "";
    }
    // Do not block UI on image caching; run in background.
    void cacheSavedDeckImagesInBackground(id);
  } catch (error) {
    const msg = error instanceof Error ? `儲存失敗：${error.message}` : "儲存失敗";
    showToast(msg, "error", 2800);
  } finally {
    runtime.deckSaveInProgress = false;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("is-saving");
      confirmBtn.textContent = "儲存";
    }
  }
}

function openDeckSaveModal() {
  if (!runtime.pendingDeckSave) {
    showToast("目前沒有可儲存的解析結果，請先成功匯入卡表。", "warn", 2400);
    return;
  }
  const modal = document.getElementById("deck-save-modal");
  const input = document.getElementById("deck-save-name-input");
  if (!modal || !input) {
    return;
  }
  const confirmBtn = document.getElementById("deck-save-confirm-btn");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  setImagePreloadPaused(true);
  input.value = "";
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove("is-saving");
    confirmBtn.textContent = "儲存";
  }
  const tryFocus = (remain = 8) => {
    if (remain <= 0 || !isDeckSaveModalOpen()) {
      return;
    }
    if (document.activeElement !== input) {
      input.focus({ preventScroll: true });
      window.setTimeout(() => tryFocus(remain - 1), 60);
    }
  };
  requestAnimationFrame(() => {
    tryFocus();
  });
}

async function cacheSavedDeckImagesInBackground(deckId) {
  if (!deckId) {
    return;
  }
  const index = runtime.deckLibrary.findIndex((d) => d.id === deckId);
  if (index < 0) {
    return;
  }
  const target = runtime.deckLibrary[index];
  if (!target || !Array.isArray(target.entries) || target.entries.length === 0) {
    return;
  }
  try {
    const cachedEntries = await cacheDeckImagesForOffline(deckId, target.entries);
    const idx = runtime.deckLibrary.findIndex((d) => d.id === deckId);
    if (idx < 0) {
      return;
    }
    runtime.deckLibrary[idx] = {
      ...runtime.deckLibrary[idx],
      entries: cachedEntries,
      coverImageUrl: getDeckCoverImageFromEntries(cachedEntries) || runtime.deckLibrary[idx].coverImageUrl || ""
    };
    if (setDeckLibraryToStorage(runtime.deckLibrary)) {
      notifyDeckLibraryUpdated();
    }
    renderDeckLibraryList();
    showToast("圖片背景快取完成", "success", 1400);
  } catch {
    showToast("圖片背景快取失敗", "warn", 2200);
  }
}

async function loadDeckLibraryItem(id, targetOwner = "") {
  const item = runtime.deckLibrary.find((d) => d.id === id);
  if (!item || !Array.isArray(item.entries)) {
    return;
  }
  const owner = targetOwner || (!state.singlePlayer ? "player1" : (item.owner || "player1"));
  item.lastUsedAt = new Date().toISOString();
  if (setDeckLibraryToStorage(runtime.deckLibrary)) {
    notifyDeckLibraryUpdated();
  }
  await applyDeckEntriesForOwner(item.entries, owner, {
    broadcastImport: state.peer.multiplayerEnabled && owner === "player1",
    sourceText: item.rawText || ""
  });
  clearReadyStateAndUi();
  clearRematchStateAndUi();
  setGamePhase("準備中");
}

function renameDeckLibraryItem(id, nextName) {
  const value = String(nextName || "").trim();
  if (!value) {
    showToast("請輸入牌組名稱", "warn", 1800);
    return;
  }
  const item = runtime.deckLibrary.find((d) => d.id === id);
  if (!item) {
    return;
  }
  item.name = value;
  if (setDeckLibraryToStorage(runtime.deckLibrary)) {
    notifyDeckLibraryUpdated();
  }
  renderDeckLibraryList();
  showToast("牌組名稱已更新", "success", 1600);
}

function isDeckRenameModalOpen() {
  const modal = document.getElementById("deck-rename-modal");
  return !!modal && !modal.classList.contains("hidden");
}

function closeDeckRenameModal() {
  const modal = document.getElementById("deck-rename-modal");
  const input = document.getElementById("deck-rename-name-input");
  runtime.pendingDeckRenameId = "";
  if (modal) {
    hideWithAnimation(modal);
    modal.setAttribute("aria-hidden", "true");
  }
  if (input) {
    input.value = "";
  }
}

function openDeckRenameModal(deckId) {
  const item = runtime.deckLibrary.find((d) => d.id === deckId);
  const modal = document.getElementById("deck-rename-modal");
  const input = document.getElementById("deck-rename-name-input");
  if (!item || !modal || !input) {
    return;
  }
  runtime.pendingDeckRenameId = deckId;
  input.value = item.name || "";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    input.focus({ preventScroll: true });
    input.select();
  });
}

function confirmDeckRename() {
  if (!runtime.pendingDeckRenameId) {
    return;
  }
  const input = document.getElementById("deck-rename-name-input");
  const nextName = input ? input.value : "";
  renameDeckLibraryItem(runtime.pendingDeckRenameId, nextName);
  if (String(nextName || "").trim()) {
    closeDeckRenameModal();
  }
}

function deleteDeckLibraryItem(id) {
  runtime.deckLibrary = runtime.deckLibrary.filter((d) => d.id !== id);
  if (setDeckLibraryToStorage(runtime.deckLibrary)) {
    notifyDeckLibraryUpdated();
  }
  renderDeckLibraryList();
}

function renderDeckLibraryList() {
  const list = document.getElementById("deck-library-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  if (!runtime.deckLibrary.length) {
    const empty = document.createElement("div");
    empty.className = "deck-library-item";
    empty.textContent = "尚無牌組";
    list.appendChild(empty);
    return;
  }
  const sorted = [...runtime.deckLibrary].sort((a, b) => {
    const ka = new Date(a.lastUsedAt || a.savedAt || 0).getTime();
    const kb = new Date(b.lastUsedAt || b.savedAt || 0).getTime();
    return kb - ka;
  });

  sorted.forEach((deck) => {
    const row = document.createElement("div");
    row.className = "deck-library-item";

    const icon = document.createElement("img");
    icon.className = "deck-library-icon";
    icon.alt = deck.name || "Deck";
    icon.src = deck.coverImageUrl || getCardBackImageUrl();

    const left = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.textContent = deck.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = formatSavedAt(deck.savedAt);
    left.appendChild(nameEl);
    left.appendChild(meta);

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.textContent = "載入我方";
    loadBtn.addEventListener("click", () => {
      void loadDeckLibraryItem(deck.id, "player1");
    });

    const loadOppBtn = document.createElement("button");
    loadOppBtn.type = "button";
    loadOppBtn.textContent = "載入對手";
    loadOppBtn.addEventListener("click", () => {
      void loadDeckLibraryItem(deck.id, "opponent");
    });

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.textContent = "更名";
    renameBtn.addEventListener("click", () => {
      openDeckRenameModal(deck.id);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "刪除";
    delBtn.addEventListener("click", () => {
      if (confirm(`確定刪除牌組「${deck.name}」？`)) {
        deleteDeckLibraryItem(deck.id);
      }
    });

    row.appendChild(icon);
    row.appendChild(left);
    row.appendChild(loadBtn);
    if (state.singlePlayer) {
      row.appendChild(loadOppBtn);
    }
    row.appendChild(renameBtn);
    row.appendChild(delBtn);
    list.appendChild(row);
  });

  renderRecentDeckShortcuts(sorted);
  renderDeckBuilderSavedOptions();
}

function renderRecentDeckShortcuts(sortedDecks = null) {
  const root = document.getElementById("recent-deck-shortcuts");
  if (!root) {
    return;
  }
  root.classList.add("hidden");
  root.innerHTML = "";
}

function schedulePeerRetry() {
  if (state.singlePlayer || runtime.peerRetryTimer || runtime.peerConnectPending || state.peer.id || state.peer.peer) {
    return;
  }
  runtime.peerRetryTimer = setTimeout(() => {
    runtime.peerRetryTimer = null;
    if (!state.peer.id && !state.peer.peer) {
      void setupPeerNetworking();
    }
  }, 5000);
}

function clearPeerRetryTimer() {
  if (runtime.peerRetryTimer) {
    clearTimeout(runtime.peerRetryTimer);
    runtime.peerRetryTimer = null;
  }
}

function buildDefaultTestDeck() {
  const entries = [];
  for (let i = 1; i <= 60; i += 1) {
    entries.push({
      count: 1,
      name: `Card ${i}`,
      series: "TST",
      number: String(i).padStart(3, "0"),
      cardType: "Pokemon",
      elementType: "",
      imageRefs: {
        primary: "",
        secondary: "",
        placeholder: ""
      }
    });
  }
  return {
    id: "default-test-60",
    name: "測試用 60 張編號牌組",
    savedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    owner: "player1",
    rawText: entries.map((e) => `${e.count} ${e.name} ${e.series} ${e.number}`).join("\n"),
    coverImageUrl: "",
    entries
  };
}

function initDeckLibrary() {
  runtime.deckLibrary = getDeckLibraryFromStorage();
  if (!Array.isArray(runtime.deckLibrary) || runtime.deckLibrary.length === 0) {
    runtime.deckLibrary = [buildDefaultTestDeck()];
    if (setDeckLibraryToStorage(runtime.deckLibrary)) {
      notifyDeckLibraryUpdated();
    }
  }
  renderDeckLibraryList();
}

function formatDeckBuilderSubtype(value = "") {
  const key = String(value || "").trim();
  const labels = {
    pokemon: "寶可夢",
    item: "物品",
    supporter: "支援者",
    stadium: "競技場",
    pokemon_tool: "寶可夢道具",
    unclassified: "其他"
  };
  return labels[key] || key || "未分類";
}

function formatDeckBuilderMainType(value = "") {
  const key = String(value || "").trim().toLowerCase();
  const labels = {
    pokemon: "寶可夢",
    trainer: "訓練家",
    supporter: "支援者",
    item: "物品",
    stadium: "競技場",
    pokemon_tool: "寶可夢道具",
    special_energy: "特殊能量",
    basic_energy: "基本能量"
  };
  return labels[key] || String(value || "").trim();
}

function formatDeckBuilderAttribute(value = "") {
  const key = String(value || "").trim().toLowerCase();
  const labels = {
    grass: "草",
    fire: "火",
    water: "水",
    lightning: "雷",
    electric: "雷",
    psychic: "超",
    fighting: "鬥",
    darkness: "惡",
    dark: "惡",
    metal: "鋼",
    dragon: "龍",
    colorless: "無"
  };
  return labels[key] || String(value || "").trim() || "無屬性";
}

function normalizeDeckBuilderComparableText(value = "") {
  return String(value || "").replace(/\s+/g, "").trim().toLowerCase();
}

function normalizeDeckBuilderRegulationMark(value = "") {
  return String(value || "").trim().toUpperCase();
}

function isDeckBuilderLegalRegulationMark(value = "") {
  return ["H", "I", "J"].includes(normalizeDeckBuilderRegulationMark(value));
}

function getDeckBuilderGroupKey(card = {}) {
  const signature = getDeckBuilderContentSignature(card);
  return `${String(card.cardType || "").trim()}::${normalizeDeckBuilderComparableText(card.name || "")}::${signature}`.toLowerCase();
}

function getDeckBuilderAbilitySignature(ability = {}) {
  return [
    normalizeDeckBuilderComparableText(ability.name || ""),
    normalizeDeckBuilderComparableText(ability.effect_text || ability.effect || ability.text || "")
  ].join("|");
}

function getDeckBuilderAttackSignature(attack = {}) {
  const cost = Array.isArray(attack.cost) ? attack.cost.map((item) => normalizeDeckBuilderComparableText(item || "")).join(",") : "";
  return [
    normalizeDeckBuilderComparableText(attack.name || ""),
    cost,
    normalizeDeckBuilderComparableText(attack.damage || ""),
    normalizeDeckBuilderComparableText(attack.effect_text || attack.effect || attack.text || "")
  ].join("|");
}

function getDeckBuilderContentSignature(card = {}) {
  const abilities = Array.isArray(card.abilities) ? card.abilities.map((ability) => getDeckBuilderAbilitySignature(ability)).join("||") : "";
  const attacks = Array.isArray(card.attacks) ? card.attacks.map((attack) => getDeckBuilderAttackSignature(attack)).join("||") : "";
  const specialRules = Array.isArray(card.specialRules) ? card.specialRules.map((rule) => normalizeDeckBuilderComparableText(rule)).join("||") : "";
  return [
    normalizeDeckBuilderComparableText(card.attribute || ""),
    normalizeDeckBuilderComparableText(card.hp || ""),
    normalizeDeckBuilderComparableText(card.ruleText || ""),
    normalizeDeckBuilderComparableText(card.effectText || ""),
    abilities,
    attacks,
    specialRules
  ].join("::");
}

function buildDeckBuilderSeriesNumberKey(series = "", number = "") {
  return `${normalizeSeries(series)}|${normalizeCardNumber(number)}`.toLowerCase();
}

function buildDeckBuilderSeriesNumberNameKey(series = "", number = "", name = "") {
  return `${buildDeckBuilderSeriesNumberKey(series, number)}|${normalizeDeckBuilderComparableText(name)}`;
}

function buildDeckBuilderSeriesBaseNumberKey(series = "", number = "") {
  return `${normalizeSeries(series)}|${normalizeDeckBuilderMatchingNumber(number)}`.toLowerCase();
}

function buildDeckBuilderSeriesNumberTypeAttributeKey(series = "", number = "", cardType = "", attribute = "") {
  return [
    buildDeckBuilderSeriesNumberKey(series, number),
    String(cardType || "").trim().toLowerCase(),
    String(attribute || "").trim().toLowerCase()
  ].join("|");
}

function getDeckBuilderSeriesDisplayName(raw = {}) {
  return String(
    raw.series_name ||
    raw.series_name_zh ||
    raw.seriesName ||
    raw.product_name ||
    raw.productName ||
    ""
  ).trim();
}

function buildDeckBuilderSeriesOptionLabel(option = {}) {
  const code = String(option.code || "").trim();
  const name = String(option.name || "").trim();
  return name ? `${code}｜${name}` : code;
}

function getDeckBuilderSeriesRank(series = "") {
  const code = normalizeSeries(series || "");
  if (runtime.deckBuilderSeriesRankByCode.has(code)) {
    return runtime.deckBuilderSeriesRankByCode.get(code);
  }
  return Number.MAX_SAFE_INTEGER;
}

function fitDeckBuilderTextToSingleLine(element, maxFontSize, minFontSize = 10) {
  if (!element) {
    return;
  }
  element.style.fontSize = `${maxFontSize}px`;
  let fontSize = maxFontSize;
  while (fontSize > minFontSize && element.scrollWidth > element.clientWidth + 1) {
    fontSize -= 1;
    element.style.fontSize = `${fontSize}px`;
  }
}

function findDeckBuilderCatalogCardForEntry(entry = {}) {
  const targetCardId = String(entry.cardId || "").trim();
  const targetSeries = normalizeSeries(entry.series || "");
  const targetNumber = normalizeCardNumber(entry.number || "");
  const targetBaseNumber = normalizeDeckBuilderMatchingNumber(entry.number || "");
  const targetName = String(entry.name || "").trim();
  const normalizedTargetName = normalizeDeckBuilderComparableText(targetName);
  const targetType = String(entry.cardType || "").trim();
  const targetAttribute = String(entry.elementType || "").trim();
  const targetContentSignature = String(entry.contentSignature || "").trim();
  if (targetCardId && runtime.deckBuilderCatalogByCardId.has(targetCardId)) {
    return runtime.deckBuilderCatalogByCardId.get(targetCardId) || null;
  }
  const exactNameKey = buildDeckBuilderSeriesNumberNameKey(targetSeries, targetNumber, targetName);
  const typeAttributeKey = buildDeckBuilderSeriesNumberTypeAttributeKey(targetSeries, targetNumber, targetType, targetAttribute);
  if (targetName && runtime.deckBuilderCatalogBySeriesNumberName.has(exactNameKey)) {
    const namedMatches = runtime.deckBuilderCatalogBySeriesNumberName.get(exactNameKey) || [];
    if (targetContentSignature) {
      const exactContent = namedMatches.find((card) => getDeckBuilderContentSignature(card) === targetContentSignature);
      if (exactContent) {
        return exactContent;
      }
    }
    const exactNamed = namedMatches.find((card) => {
      if (targetType && String(card.cardType || "").trim() !== targetType) {
        return false;
      }
      if (targetAttribute && String(card.attribute || "").trim() !== targetAttribute) {
        return false;
      }
      return true;
    });
    if (exactNamed) {
      return exactNamed;
    }
    if (namedMatches[0]) {
      return namedMatches[0];
    }
  }
  if (runtime.deckBuilderCatalogBySeriesNumberTypeAttribute.has(typeAttributeKey)) {
    const typedMatches = runtime.deckBuilderCatalogBySeriesNumberTypeAttribute.get(typeAttributeKey) || [];
    if (targetContentSignature) {
      const exactContent = typedMatches.find((card) => getDeckBuilderContentSignature(card) === targetContentSignature);
      if (exactContent) {
        return exactContent;
      }
    }
    const exactTyped = typedMatches.find((card) => {
      if (normalizedTargetName && normalizeDeckBuilderComparableText(card.name || "") !== normalizedTargetName) {
        return false;
      }
      return true;
    });
    if (exactTyped) {
      return exactTyped;
    }
    if (typedMatches[0]) {
      return typedMatches[0];
    }
  }
  const seriesNumberKey = buildDeckBuilderSeriesNumberKey(targetSeries, targetNumber);
  const matches = runtime.deckBuilderCatalogBySeriesNumber.get(seriesNumberKey) || [];
  if (!matches.length) {
    const fallbackMatches = runtime.deckBuilderCatalogBySeriesBaseNumber.get(buildDeckBuilderSeriesBaseNumberKey(targetSeries, targetBaseNumber)) || [];
    if (!fallbackMatches.length) {
      return null;
    }
    const exactFallback = fallbackMatches.find((card) => {
      if (targetContentSignature && getDeckBuilderContentSignature(card) !== targetContentSignature) {
        return false;
      }
      if (normalizedTargetName && normalizeDeckBuilderComparableText(card.name || "") !== normalizedTargetName) {
        return false;
      }
      if (targetType && String(card.cardType || "").trim() !== targetType) {
        return false;
      }
      if (targetAttribute && String(card.attribute || "").trim() !== targetAttribute) {
        return false;
      }
      return true;
    });
    return exactFallback || fallbackMatches[0] || null;
  }
  if (targetContentSignature) {
    const exactContent = matches.find((card) => getDeckBuilderContentSignature(card) === targetContentSignature);
    if (exactContent) {
      return exactContent;
    }
  }
  const exactMatch = matches.find((card) => {
    if (normalizedTargetName && normalizeDeckBuilderComparableText(card.name || "") !== normalizedTargetName) {
      return false;
    }
    if (targetType && String(card.cardType || "").trim() !== targetType) {
      return false;
    }
    if (targetAttribute && String(card.attribute || "").trim() !== targetAttribute) {
      return false;
    }
    return true;
  });
  if (exactMatch) {
    return exactMatch;
  }
  const relaxedTypeMatch = matches.find((card) => {
    if (targetType && String(card.cardType || "").trim() !== targetType) {
      return false;
    }
    return true;
  });
  return relaxedTypeMatch || matches[0] || null;
}

function getDeckBuilderVariantLabel(card = {}) {
  const parts = [`${card.series || ""} ${card.number || ""}`.trim()];
  if (card.productName) {
    parts.push(card.productName);
  }
  if (card.subtype && card.subtype !== "pokemon") {
    parts.push(formatDeckBuilderSubtype(card.subtype));
  }
  return parts.filter(Boolean).join("｜") || card.name || "未命名版本";
}

function stripDeckBuilderAbilityPrefix(value = "") {
  return String(value || "")
    .replace(/^[\s\u200b-\u200d\ufeff\u2060]*\[特性\][\s\u200b-\u200d\ufeff\u2060]*/u, "")
    .trim();
}

function isDeckBuilderAbilityAttackName(value = "") {
  return /^[\s\u200b-\u200d\ufeff\u2060]*\[特性\]/u.test(String(value || ""));
}

function stripDeckBuilderSpecialRulePrefix(value = "") {
  return String(value || "")
    .replace(/^[\s\u200b-\u200d\ufeff\u2060]*\[太晶\][\s\u200b-\u200d\ufeff\u2060]*/u, "")
    .trim();
}

function isDeckBuilderSpecialRuleAttackName(value = "") {
  return /^[\s\u200b-\u200d\ufeff\u2060]*\[太晶\]/u.test(String(value || ""));
}

function normalizeDeckBuilderAbilitiesAndAttacks(raw = {}) {
  const abilities = Array.isArray(raw.abilities) ? raw.abilities.map((ability) => ({
    ...ability,
    name: String(ability.name || "").trim(),
    effect_text: String(ability.effect_text || ability.effect || ability.text || "").trim()
  })).filter((ability) => ability.name || ability.effect_text) : [];
  const specialRules = [];
  const attacks = [];
  if (Array.isArray(raw.attacks)) {
    raw.attacks.forEach((attack) => {
      const rawName = String(attack.name || "").trim();
      const effectText = String(attack.effect_text || attack.effect || attack.text || "").trim();
      if (isDeckBuilderAbilityAttackName(rawName)) {
        abilities.push({
          index: Number(attack.index) || abilities.length + 1,
          name: stripDeckBuilderAbilityPrefix(rawName) || "特性",
          effect_text: effectText
        });
        return;
      }
      if (isDeckBuilderSpecialRuleAttackName(rawName)) {
        const normalizedRule = stripDeckBuilderSpecialRulePrefix(rawName);
        specialRules.push(normalizedRule ? `[太晶] ${effectText || normalizedRule}` : `[太晶] ${effectText}`.trim());
        return;
      }
      attacks.push({
        ...attack,
        name: rawName,
        effect_text: effectText
      });
    });
  }
  return { abilities, attacks, specialRules: specialRules.filter(Boolean) };
}

function deckBuilderTypeAllowsSubtypeFilter(typeValue = "") {
  const value = String(typeValue || "").trim();
  return !value || value === "訓練家";
}

function deckBuilderTypeAllowsAttributeFilter(typeValue = "") {
  const value = String(typeValue || "").trim();
  return !value || value === "寶可夢" || value === "基本能量";
}

function normalizeDeckBuilderFilterArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function toggleDeckBuilderFilterValue(filterKey, value, checked) {
  const current = new Set(normalizeDeckBuilderFilterArray(state.deckBuilder[filterKey]));
  const normalized = String(value || "").trim();
  if (!normalized) {
    return;
  }
  if (checked) {
    current.add(normalized);
  } else {
    current.delete(normalized);
  }
  state.deckBuilder[filterKey] = [...current];
}

function buildDeckBuilderCheckboxItem(name, value, label, checked) {
  const row = document.createElement("label");
  row.className = "deck-builder-checkbox-item";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = name;
  input.value = value;
  input.checked = checked;
  const text = document.createElement("span");
  text.textContent = label;
  row.appendChild(input);
  row.appendChild(text);
  return row;
}

function getDeckBuilderAttributeOptionsForType(typeValue = "") {
  const value = String(typeValue || "").trim();
  const options = [...runtime.deckBuilderAttributeOptions];
  if (value === "基本能量") {
    return options.filter((option) => String(option || "").trim().toLowerCase() !== "colorless");
  }
  return options;
}

function getDeckBuilderRootReady() {
  return !!runtime.nodeFs && !!runtime.nodePath && typeof runtime.pathToFileURL === "function";
}

function getDeckBuilderSearchRoots() {
  if (!getDeckBuilderRootReady()) {
    return [];
  }
  const roots = [];
  try {
    const customRoot = localStorage.getItem(DECK_BUILDER_CUSTOM_IMAGE_ROOT_KEY) || "";
    if (customRoot.trim()) {
      roots.push(customRoot.trim());
    }
  } catch {
    // Ignore localStorage read failures.
  }
  const appendRuntimeRootCandidates = (baseDir = "") => {
    const normalizedBase = String(baseDir || "").trim();
    if (!normalizedBase) {
      return;
    }
    roots.push(runtime.nodePath.resolve(normalizedBase, DECK_BUILDER_EXTERNAL_ROOT_NAME));
    roots.push(runtime.nodePath.resolve(normalizedBase, "..", DECK_BUILDER_EXTERNAL_ROOT_NAME));
    roots.push(runtime.nodePath.resolve(normalizedBase, "..", "..", DECK_BUILDER_EXTERNAL_ROOT_NAME));
  };
  try {
    if (typeof process !== "undefined" && process.cwd) {
      const cwd = process.cwd();
      roots.push(cwd);
      appendRuntimeRootCandidates(cwd);
    }
  } catch {
    // Ignore cwd resolution failures.
  }
  try {
    if (typeof process !== "undefined" && process.execPath) {
      const execDir = runtime.nodePath.dirname(process.execPath);
      roots.push(execDir);
      appendRuntimeRootCandidates(execDir);
    }
  } catch {
    // Ignore execPath resolution failures.
  }
  try {
    if (typeof process !== "undefined" && process.resourcesPath) {
      appendRuntimeRootCandidates(process.resourcesPath);
    }
  } catch {
    // Ignore resourcesPath resolution failures.
  }
  roots.push(DECK_BUILDER_ROOT);
  return [...new Set(roots.map((root) => String(root || "").trim()).filter(Boolean))];
}

function resolveDeckBuilderDataFilePath(relativePath = "") {
  if (!getDeckBuilderRootReady()) {
    return "";
  }
  const raw = String(relativePath || "").trim();
  if (!raw) {
    return "";
  }
  const normalized = raw.replace(/[\\/]+/g, runtime.nodePath.sep);
  for (const root of getDeckBuilderSearchRoots()) {
    const candidate = runtime.nodePath.resolve(root, normalized);
    try {
      if (runtime.nodeFs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore path probing failures.
    }
  }
  return "";
}

function buildDeckBuilderCardKeyFromParts(parts = {}) {
  return [
    String(parts.name || "").trim().toLowerCase(),
    normalizeSeries(parts.series || ""),
    normalizeCardNumber(parts.number || ""),
    String(parts.cardType || "").trim().toLowerCase(),
    String(parts.subtype || "").trim().toLowerCase(),
    String(parts.attribute || "").trim().toLowerCase()
  ].join("|");
}

function resolveDeckBuilderImagePath(relativePath = "") {
  if (!getDeckBuilderRootReady()) {
    return "";
  }
  const raw = String(relativePath || "").trim();
  if (!raw) {
    return "";
  }
  const normalized = raw.replace(/[\\/]+/g, runtime.nodePath.sep);
  const candidates = [];
  for (const root of getDeckBuilderSearchRoots()) {
    candidates.push(runtime.nodePath.resolve(root, normalized));
    candidates.push(runtime.nodePath.resolve(root, "cards", normalized));
  }
  for (const candidate of candidates) {
    try {
      if (runtime.nodeFs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore path probing failures.
    }
  }
  return "";
}

function toDeckBuilderFileUrl(filePath = "") {
  if (!filePath || !getDeckBuilderRootReady()) {
    return "";
  }
  try {
    return runtime.pathToFileURL(filePath).href;
  } catch {
    return "";
  }
}

function normalizeDeckBuilderCard(raw = {}) {
  const name = String(raw.name || raw.card_name || "").trim();
  const series = normalizeSeries(raw.series_code || raw.series || "");
  const seriesDisplayName = getDeckBuilderSeriesDisplayName(raw);
  const releaseDate = String(raw.release_date || raw.releaseDate || "").trim();
  const number = normalizeDeckBuilderMatchingNumber(raw.collector_number || raw.number || "");
  const cardType = String(raw.card_type || raw.cardType || "").trim();
  const subtype = String(raw.trainer_subtype_code || raw.trainerSubtype || "").trim();
  const attribute = String(raw.attribute || raw.elementType || "").trim();
  const localImagePath = resolveDeckBuilderImagePath(raw.image_path || raw.imagePath || "");
  const localImageUrl = toDeckBuilderFileUrl(localImagePath);
  const onlineUrlById = getCardImageUrlById(raw.card_id || raw.id);
  const fallbackPrimary = onlineUrlById || getCardImageUrl(series, number);
  const fallbackSecondary = getSecondaryImageUrl(series, number);
  const imageRefs = {
    primary: localImageUrl || fallbackPrimary || fallbackSecondary || "",
    secondary: fallbackPrimary && fallbackPrimary !== localImageUrl ? fallbackPrimary : (fallbackSecondary || ""),
    placeholder: ""
  };
  const normalizedParts = normalizeDeckBuilderAbilitiesAndAttacks(raw);
  const normalizedCard = {
    key: buildDeckBuilderCardKeyFromParts({ name, series, number, cardType, subtype, attribute }),
    cardId: String(raw.card_id || raw.id || `${series}-${number}-${name}`),
    name,
    series,
    seriesDisplayName,
    releaseDate,
    number,
    cardType,
    subtype,
    attribute,
    hp: Number(raw.hp) || 0,
    evolutionStage: String(raw.evolution_stage || "").trim(),
    productName: String(raw.product_name || "").trim(),
    regulationMark: normalizeDeckBuilderRegulationMark(raw.regulation_mark || ""),
    weakness: String(raw.weakness || "").trim(),
    resistance: String(raw.resistance || "").trim(),
    retreatCost: Number(raw.retreat_cost) || 0,
    ruleText: String(raw.rule_text || "").trim(),
    effectText: String(raw.effect_text || "").trim(),
    attacks: normalizedParts.attacks,
    abilities: normalizedParts.abilities,
    specialRules: normalizedParts.specialRules,
    imageUrl: imageRefs.primary || getCardBackImageUrl(),
    imageRefs,
    versionLabel: "",
    searchText: name.toLowerCase()
  };
  normalizedCard.groupKey = getDeckBuilderGroupKey(normalizedCard);
  return normalizedCard;
}

function createDeckBuilderCatalogIndexes(cards = []) {
  const bySeriesNumber = new Map();
  const bySeriesBaseNumber = new Map();
  const bySeriesNumberName = new Map();
  const bySeriesNumberTypeAttribute = new Map();
  const byCardId = new Map();
  const groupsByGroupKey = new Map();
  const legalGroupKeys = new Set();
  const seriesOptions = new Map();
  cards.forEach((card) => {
    const seriesNumberKey = buildDeckBuilderSeriesNumberKey(card.series, card.number);
    const seriesBaseNumberKey = buildDeckBuilderSeriesBaseNumberKey(card.series, card.number);
    const exactKey = buildDeckBuilderSeriesNumberNameKey(card.series, card.number, card.name);
    const typedKey = buildDeckBuilderSeriesNumberTypeAttributeKey(card.series, card.number, card.cardType, card.attribute);
    if (!bySeriesNumber.has(seriesNumberKey)) {
      bySeriesNumber.set(seriesNumberKey, []);
    }
    bySeriesNumber.get(seriesNumberKey).push(card);
    if (!bySeriesBaseNumber.has(seriesBaseNumberKey)) {
      bySeriesBaseNumber.set(seriesBaseNumberKey, []);
    }
    bySeriesBaseNumber.get(seriesBaseNumberKey).push(card);
    if (!bySeriesNumberName.has(exactKey)) {
      bySeriesNumberName.set(exactKey, []);
    }
    bySeriesNumberName.get(exactKey).push(card);
    if (!bySeriesNumberTypeAttribute.has(typedKey)) {
      bySeriesNumberTypeAttribute.set(typedKey, []);
    }
    bySeriesNumberTypeAttribute.get(typedKey).push(card);
    if (card.cardId) {
      byCardId.set(card.cardId, card);
    }
    if (!groupsByGroupKey.has(card.groupKey)) {
      groupsByGroupKey.set(card.groupKey, []);
    }
    groupsByGroupKey.get(card.groupKey).push(card);
    if (isDeckBuilderLegalRegulationMark(card.regulationMark)) {
      legalGroupKeys.add(card.groupKey);
    }
    if (card.series) {
      if (!seriesOptions.has(card.series)) {
        seriesOptions.set(card.series, {
          code: card.series,
          name: card.seriesDisplayName || "",
          releaseDate: card.releaseDate || ""
        });
      } else {
        if (!seriesOptions.get(card.series).name && card.seriesDisplayName) {
          seriesOptions.get(card.series).name = card.seriesDisplayName;
        }
        if (!seriesOptions.get(card.series).releaseDate && card.releaseDate) {
          seriesOptions.get(card.series).releaseDate = card.releaseDate;
        }
      }
    }
  });
  const sortedSeriesOptions = [...seriesOptions.values()].sort((a, b) => {
    const timeA = Date.parse(String(a.releaseDate || "")) || 0;
    const timeB = Date.parse(String(b.releaseDate || "")) || 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    const codeDiff = String(a.code || "").localeCompare(String(b.code || ""), "zh-Hant");
    if (codeDiff !== 0) {
      return codeDiff;
    }
    return String(a.name || "").localeCompare(String(b.name || ""), "zh-Hant");
  });
  const seriesRankByCode = new Map(sortedSeriesOptions.map((option, index) => [option.code, index]));
  groupsByGroupKey.forEach((cardsInGroup) => {
    cardsInGroup.sort((a, b) => {
      const rankDiff = (seriesRankByCode.get(a.series) ?? Number.MAX_SAFE_INTEGER) - (seriesRankByCode.get(b.series) ?? Number.MAX_SAFE_INTEGER);
      if (rankDiff !== 0) {
        return rankDiff;
      }
      return normalizeCardNumber(a.number).localeCompare(normalizeCardNumber(b.number), "zh-Hant", { numeric: true });
    });
  });
  return {
    bySeriesNumber,
    bySeriesBaseNumber,
    bySeriesNumberName,
    bySeriesNumberTypeAttribute,
    byCardId,
    groupsByGroupKey,
    legalGroupKeys,
    seriesOptions: sortedSeriesOptions,
    seriesRankByCode
  };
}

async function ensureDeckBuilderCatalogLoaded() {
  if (runtime.deckBuilderCatalogReady) {
    return runtime.deckBuilderCatalog;
  }
  if (runtime.deckBuilderLoadPromise) {
    return runtime.deckBuilderLoadPromise;
  }
  runtime.deckBuilderLoadPromise = (async () => {
    const statusEl = document.getElementById("deck-builder-load-status");
    if (statusEl) {
      statusEl.textContent = "讀取 cards.json 中";
    }
    let rawText;
    if (getDeckBuilderRootReady()) {
      // Electron 環境：用 Node.js fs 讀取
      const cardsJsonPath = resolveDeckBuilderDataFilePath("cards.json");
      if (!cardsJsonPath) {
        throw new Error("找不到 deck-builder-data\\cards.json");
      }
      rawText = await runtime.nodeFs.promises.readFile(cardsJsonPath, "utf8");
    } else {
      // 瀏覽器/PWA 環境：用 fetch 讀取
      const resp = await fetch("./deck-builder-data/cards.json");
      if (!resp.ok) throw new Error(`cards.json 載入失敗 (${resp.status})`);
      rawText = await resp.text();
    }
    const payload = JSON.parse(rawText);
    const sourceList = Array.isArray(payload) ? payload : (Array.isArray(payload.cards) ? payload.cards : []);
    const normalized = sourceList
      .map((card) => normalizeDeckBuilderCard(card))
      .filter((card) => card.name && card.series && card.number);
    normalized.forEach((card) => {
      card.versionLabel = getDeckBuilderVariantLabel(card);
    });
    normalized.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name, "zh-Hant");
      if (nameCmp !== 0) {
        return nameCmp;
      }
      const seriesCmp = a.series.localeCompare(b.series, "zh-Hant");
      if (seriesCmp !== 0) {
        return seriesCmp;
      }
      return a.number.localeCompare(b.number, "zh-Hant", { numeric: true });
    });
    runtime.deckBuilderCatalog = normalized;
    runtime.deckBuilderCardMap = new Map(normalized.map((card) => [card.key, card]));
    const indexes = createDeckBuilderCatalogIndexes(normalized);
    runtime.deckBuilderCatalogBySeriesNumber = indexes.bySeriesNumber;
    runtime.deckBuilderCatalogBySeriesBaseNumber = indexes.bySeriesBaseNumber;
    runtime.deckBuilderCatalogBySeriesNumberName = indexes.bySeriesNumberName;
    runtime.deckBuilderCatalogBySeriesNumberTypeAttribute = indexes.bySeriesNumberTypeAttribute;
    runtime.deckBuilderCatalogByCardId = indexes.byCardId;
    runtime.deckBuilderCatalogGroupsByGroupKey = indexes.groupsByGroupKey;
    runtime.deckBuilderLegalGroupKeys = indexes.legalGroupKeys;
    runtime.deckBuilderSeriesOptions = indexes.seriesOptions;
    runtime.deckBuilderSeriesRankByCode = indexes.seriesRankByCode;
    runtime.deckBuilderTypeOptions = [...new Set(normalized.map((card) => card.cardType).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
    runtime.deckBuilderAttributeOptions = [...new Set(normalized.map((card) => card.attribute).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
    runtime.deckBuilderSubtypeOptions = ["pokemon", ...[...new Set(normalized.map((card) => card.subtype).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"))];
    runtime.deckBuilderEvolutionOptions = [...new Set(normalized.map((card) => String(card.evolutionStage || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
    runtime.deckBuilderRetreatCostOptions = [...new Set(normalized.map((card) => String(card.retreatCost ?? "")).filter((value) => value !== ""))].sort((a, b) => Number(a) - Number(b));
    runtime.deckBuilderCatalogReady = true;
    if (statusEl) {
      statusEl.textContent = "卡片資料已就緒";
    }
    return normalized;
  })().finally(() => {
    runtime.deckBuilderLoadPromise = null;
  });
  return runtime.deckBuilderLoadPromise;
}

function buildDeckBuilderFallbackCard(entry = {}) {
  const name = String(entry.name || "").trim();
  const series = normalizeSeries(entry.series || "");
  const number = normalizeCardNumber(entry.number || "");
  const cardType = String(entry.cardType || "").trim();
  const attribute = String(entry.elementType || "").trim();
  const key = buildDeckBuilderCardKeyFromParts({ name, series, number, cardType, subtype: "", attribute });
  return {
    key,
    groupKey: getDeckBuilderGroupKey({
      name,
      cardType,
      attribute,
      hp: 0,
      ruleText: "",
      effectText: "",
      abilities: [],
      attacks: []
    }),
    cardId: key,
    name,
    series,
    seriesDisplayName: "",
    number,
    cardType,
    subtype: "",
    attribute,
    hp: 0,
    evolutionStage: "",
    productName: "",
    regulationMark: "",
    weakness: "",
    resistance: "",
    retreatCost: 0,
    ruleText: "",
    effectText: "",
    attacks: [],
    abilities: [],
    specialRules: [],
    imageUrl: (entry.imageRefs && (entry.imageRefs.primary || entry.imageRefs.secondary)) || getCardBackImageUrl(),
    imageRefs: cloneImageRefs(entry.imageRefs) || buildDefaultImageRefs(entry),
    versionLabel: getDeckBuilderVariantLabel({ series, number, cardType, attribute, subtype: "", productName: "" }),
    searchText: `${name} ${series} ${number}`.toLowerCase()
  };
}

function resolveDeckBuilderSelectedEntry() {
  if (state.deckBuilder.selectedDeckEntryKey) {
    const selectedEntry = state.deckBuilder.deckEntries.find((entry) => entry.key === state.deckBuilder.selectedDeckEntryKey) || null;
    if (selectedEntry) {
      return selectedEntry;
    }
    state.deckBuilder.selectedDeckEntryKey = "";
  }
  return state.deckBuilder.deckEntries.find((entry) => entry.key === state.deckBuilder.selectedCardKey || entry.card.key === state.deckBuilder.selectedCardKey) || null;
}

function syncDeckBuilderEntryCard(entry) {
  if (!entry) {
    return null;
  }
  const matched = findDeckBuilderCatalogCardForEntry({
    cardId: entry.card && entry.card.cardId,
    name: entry.card && entry.card.name,
    series: entry.card && entry.card.series,
    number: entry.card && entry.card.number,
    cardType: entry.card && entry.card.cardType,
    elementType: entry.card && entry.card.attribute,
    contentSignature: entry.card ? getDeckBuilderContentSignature(entry.card) : "",
    subtype: entry.card && entry.card.subtype
  });
  if (matched && entry.card !== matched) {
    entry.card = matched;
    entry.key = matched.key;
  }
  return entry.card || null;
}

function selectDeckBuilderCatalogCard(cardKey = "") {
  state.deckBuilder.selectedDeckEntryKey = "";
  state.deckBuilder.selectedCardKey = String(cardKey || "");
  runtime.deckBuilderSelectedDeckDisplayKey = "";
}

function selectDeckBuilderDeckEntry(entry, displayKey = "") {
  if (!entry) {
    state.deckBuilder.selectedDeckEntryKey = "";
    runtime.deckBuilderSelectedDeckDisplayKey = "";
    return;
  }
  const matchedCard = syncDeckBuilderEntryCard(entry);
  state.deckBuilder.selectedDeckEntryKey = entry.key;
  state.deckBuilder.selectedCardKey = matchedCard && matchedCard.key ? matchedCard.key : entry.card.key;
  runtime.deckBuilderSelectedDeckDisplayKey = displayKey || entry.key;
}

function resolveDeckBuilderSelectedCard() {
  const deckEntry = resolveDeckBuilderSelectedEntry();
  if (deckEntry) {
    const matchedCard = syncDeckBuilderEntryCard(deckEntry);
    if (matchedCard && matchedCard.key !== state.deckBuilder.selectedCardKey) {
      state.deckBuilder.selectedCardKey = matchedCard.key;
    }
    return matchedCard || deckEntry.card || null;
  }
  const catalogCard = runtime.deckBuilderCardMap.get(state.deckBuilder.selectedCardKey);
  if (catalogCard) {
    return catalogCard;
  }
  const grouped = runtime.deckBuilderGroupedResults || [];
  if (grouped.length && grouped[0] && grouped[0].selectedCard) {
    state.deckBuilder.selectedCardKey = grouped[0].selectedCard.key;
    return grouped[0].selectedCard;
  }
  if (runtime.deckBuilderCatalog.length) {
    state.deckBuilder.selectedCardKey = runtime.deckBuilderCatalog[0].key;
    return runtime.deckBuilderCatalog[0];
  }
  return null;
}

function updateDeckBuilderCardSelectionUi() {
  const host = document.getElementById("deck-builder-card-list");
  if (!host) {
    return;
  }
  const selectedKey = state.deckBuilder.selectedCardKey;
  host.querySelectorAll(".deck-builder-card-row").forEach((row) => {
    if (!(row instanceof HTMLElement)) {
      return;
    }
    row.classList.toggle("selected", row.dataset.cardKey === selectedKey);
  });
}

function updateDeckBuilderDeckSelectionUi() {
  const host = document.getElementById("deck-builder-deck-list");
  if (!host) {
    return;
  }
  const selectedDisplayKey = runtime.deckBuilderSelectedDeckDisplayKey;
  host.querySelectorAll(".deck-builder-deck-card").forEach((row) => {
    if (!(row instanceof HTMLElement)) {
      return;
    }
    row.classList.toggle("selected", row.dataset.displayKey === selectedDisplayKey);
  });
}

function resolveDeckBuilderGroupForCard(card) {
  if (!card) {
    return null;
  }
  const directGroupKey = String(card.groupKey || "").trim();
  if (directGroupKey && runtime.deckBuilderCatalogGroupsByGroupKey.has(directGroupKey)) {
    return runtime.deckBuilderCatalogGroupsByGroupKey.get(directGroupKey) || null;
  }
  const cardId = String(card.cardId || "").trim();
  if (cardId && runtime.deckBuilderCatalogByCardId.has(cardId)) {
    const matched = runtime.deckBuilderCatalogByCardId.get(cardId);
    const matchedGroupKey = String(matched && matched.groupKey || "").trim();
    if (matchedGroupKey && runtime.deckBuilderCatalogGroupsByGroupKey.has(matchedGroupKey)) {
      return runtime.deckBuilderCatalogGroupsByGroupKey.get(matchedGroupKey) || null;
    }
  }
  const fallbackGroupKey = getDeckBuilderGroupKey(card);
  if (fallbackGroupKey && runtime.deckBuilderCatalogGroupsByGroupKey.has(fallbackGroupKey)) {
    return runtime.deckBuilderCatalogGroupsByGroupKey.get(fallbackGroupKey) || null;
  }
  return null;
}

function resolveDeckBuilderVersionCards(card) {
  const group = resolveDeckBuilderGroupForCard(card);
  if (group && Array.isArray(group.versions) && group.versions.length > 1) {
    return group.versions;
  }
  if (!card) {
    return [];
  }
  const targetName = normalizeDeckBuilderComparableText(card.name || "");
  const targetType = String(card.cardType || "").trim();
  const targetSignature = getDeckBuilderContentSignature(card);
  const versions = runtime.deckBuilderCatalog
    .filter((candidate) => {
      if (String(candidate.cardType || "").trim() !== targetType) {
        return false;
      }
      if (normalizeDeckBuilderComparableText(candidate.name || "") !== targetName) {
        return false;
      }
      return getDeckBuilderContentSignature(candidate) === targetSignature;
    })
    .sort((a, b) => {
      const rankDiff = getDeckBuilderSeriesRank(a.series) - getDeckBuilderSeriesRank(b.series);
      if (rankDiff !== 0) {
        return rankDiff;
      }
      return normalizeCardNumber(a.number).localeCompare(normalizeCardNumber(b.number), "zh-Hant", { numeric: true });
    });
  return versions.length > 1 ? versions : [];
}

function getDeckBuilderCurrentTotal() {
  return state.deckBuilder.deckEntries.reduce((sum, entry) => sum + (Number(entry.count) || 0), 0);
}

function isDeckBuilderBasicEnergy(card) {
  const cardType = String(card && card.cardType || "").trim();
  const name = String(card && card.name || "").trim();
  return cardType === "基本能量" || cardType.includes("基本") || /^基本.+能量$/.test(name);
}

function isDeckBuilderCardRegulationLegal(card) {
  if (!card) {
    return false;
  }
  if (isDeckBuilderLegalRegulationMark(card.regulationMark)) {
    return true;
  }
  return runtime.deckBuilderLegalGroupKeys.has(getDeckBuilderGroupKey(card));
}

function getDeckBuilderCopiesByName(name = "", excludeKey = "") {
  const target = normalizeDeckBuilderComparableText(name);
  return state.deckBuilder.deckEntries.reduce((sum, entry) => {
    if (excludeKey && entry.key === excludeKey) {
      return sum;
    }
    return normalizeDeckBuilderComparableText(entry.card.name || "") === target ? sum + (Number(entry.count) || 0) : sum;
  }, 0);
}

function canAddDeckBuilderCard(card, amount = 1) {
  const nextAmount = Math.max(1, Number(amount) || 1);
  if (!card) {
    return { ok: false, reason: "找不到卡片資料" };
  }
  if (!isDeckBuilderBasicEnergy(card)) {
    const copiesByName = getDeckBuilderCopiesByName(card.name);
    if (copiesByName + nextAmount > 4) {
      return { ok: false, reason: `「${card.name}」最多只能放 4 張` };
    }
  }
  return { ok: true, reason: "" };
}

function getDeckBuilderCardTypeOrder(cardOrType = "", subtypeValue = "") {
  const cardType = typeof cardOrType === "object" && cardOrType
    ? String(cardOrType.cardType || "").trim()
    : String(cardOrType || "").trim();
  const rawSubtype = typeof cardOrType === "object" && cardOrType
    ? String(cardOrType.subtype || "").trim()
    : String(subtypeValue || "").trim();
  const subtype = formatDeckBuilderSubtype(rawSubtype || "");
  const normalizedType = formatDeckBuilderMainType(cardType || "") || cardType;
  const value = normalizedType === "訓練家" && subtype ? subtype : normalizedType;
  switch (value) {
    case "寶可夢":
      return 0;
    case "支援者":
      return 1;
    case "物品":
      return 2;
    case "寶可夢道具":
      return 3;
    case "競技場":
      return 4;
    case "特殊能量":
      return 5;
    case "基本能量":
      return 6;
    default:
      return 99;
  }
}

function getDeckBuilderDeckDisplayCards() {
  return [...state.deckBuilder.deckEntries]
    .map((entry) => {
      syncDeckBuilderEntryCard(entry);
      return entry;
    })
    .sort((a, b) => {
      const typeDiff = getDeckBuilderCardTypeOrder(a.card) - getDeckBuilderCardTypeOrder(b.card);
      if (typeDiff !== 0) {
        return typeDiff;
      }
      const numberDiff = normalizeCardNumber(a.card.number).localeCompare(normalizeCardNumber(b.card.number), "zh-Hant", { numeric: true });
      if (numberDiff !== 0) {
        return numberDiff;
      }
      const seriesDiff = getDeckBuilderSeriesRank(a.card.series) - getDeckBuilderSeriesRank(b.card.series);
      if (seriesDiff !== 0) {
        return seriesDiff;
      }
      return String(a.card.name || "").localeCompare(String(b.card.name || ""), "zh-Hant");
    })
    .flatMap((entry) => {
      const total = Math.max(0, Number(entry.count) || 0);
      return Array.from({ length: total }, (_, index) => ({
        entry,
        instanceIndex: index,
        displayKey: `${entry.key}::${index}`
      }));
    });
}

function addDeckBuilderCard(card, amount = 1) {
  const nextAmount = Math.max(1, Number(amount) || 1);
  const verdict = canAddDeckBuilderCard(card, nextAmount);
  if (!verdict.ok) {
    showToast(verdict.reason, "warn", 1800);
    return false;
  }
  const existing = state.deckBuilder.deckEntries.find((entry) => entry.key === card.key);
  if (existing) {
    existing.count += nextAmount;
  } else {
    state.deckBuilder.deckEntries.push({
      key: card.key,
      card,
      count: nextAmount
    });
  }
  refreshDeckBuilderDeckArea();
  return true;
}

function changeDeckBuilderEntryCount(key, delta) {
  const entry = state.deckBuilder.deckEntries.find((item) => item.key === key);
  if (!entry) {
    return;
  }
  const next = (Number(entry.count) || 0) + Number(delta || 0);
  if (next <= 0) {
    if (runtime.deckBuilderSelectedDeckDisplayKey.startsWith(`${entry.key}::`)) {
      runtime.deckBuilderSelectedDeckDisplayKey = "";
    }
    state.deckBuilder.deckEntries = state.deckBuilder.deckEntries.filter((item) => item.key !== key);
    refreshDeckBuilderDeckArea();
    return;
  }
  if (!isDeckBuilderBasicEnergy(entry.card)) {
    const copiesByName = getDeckBuilderCopiesByName(entry.card.name, entry.key);
    if (copiesByName + next > 4) {
      showToast(`「${entry.card.name}」最多只能放 4 張`, "warn", 1800);
      return;
    }
  }
  entry.count = next;
  if (runtime.deckBuilderSelectedDeckDisplayKey.startsWith(`${entry.key}::`)) {
    const selectedIndex = Number((runtime.deckBuilderSelectedDeckDisplayKey.split("::")[1] || "0"));
    const clampedIndex = Math.max(0, Math.min(next - 1, selectedIndex));
    runtime.deckBuilderSelectedDeckDisplayKey = `${entry.key}::${clampedIndex}`;
  }
  refreshDeckBuilderDeckArea();
}

function renderDeckBuilderImportModal() {
  const modal = document.getElementById("deck-builder-import-modal");
  const input = document.getElementById("deck-builder-import-input");
  const status = document.getElementById("deck-builder-import-status");
  const bar = document.getElementById("deck-builder-import-progress-bar");
  const text = document.getElementById("deck-builder-import-progress-text");
  const startBtn = document.getElementById("deck-builder-import-start-btn");
  if (!modal || !input || !status || !bar || !text || !startBtn) {
    return;
  }
  if (state.deckBuilder.importModalOpen) {
    modal.classList.remove("hidden");
  } else if (!modal.classList.contains("hidden")) {
    hideWithAnimation(modal);
  }
  modal.setAttribute("aria-hidden", state.deckBuilder.importModalOpen ? "false" : "true");
  input.value = state.deckBuilder.importInput || "";
  status.textContent = state.deckBuilder.importStatus || "尚未開始匯入";
  const percent = Math.max(0, Math.min(100, Number(state.deckBuilder.importPercent) || 0));
  bar.style.width = `${percent}%`;
  text.textContent = `${percent}%`;
  startBtn.disabled = !!state.deckBuilder.importBusy;
}

function setDeckBuilderImportProgress(status, percent = 0, busy = false) {
  state.deckBuilder.importStatus = String(status || "");
  state.deckBuilder.importPercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  state.deckBuilder.importBusy = !!busy;
  renderDeckBuilderImportModal();
}

function openDeckBuilderImportModal() {
  state.deckBuilder.importModalOpen = true;
  state.deckBuilder.importBusy = false;
  state.deckBuilder.importStatus = "尚未開始匯入";
  state.deckBuilder.importPercent = 0;
  renderDeckBuilderImportModal();
  const input = document.getElementById("deck-builder-import-input");
  if (input) {
    window.setTimeout(() => input.focus(), 0);
  }
}

function closeDeckBuilderImportModal() {
  state.deckBuilder.importModalOpen = false;
  state.deckBuilder.importBusy = false;
  state.deckBuilder.importStatus = "尚未開始匯入";
  state.deckBuilder.importPercent = 0;
  renderDeckBuilderImportModal();
}

async function importDeckBuilderFromInput() {
  const deckNameInput = document.getElementById("deck-builder-name-input");
  const input = document.getElementById("deck-builder-import-input");
  const rawText = String(input && input.value || "").trim();
  state.deckBuilder.importInput = rawText;
  if (!rawText) {
    setDeckBuilderImportProgress("請輸入卡表連結或內容", 0, false);
    showToast("請輸入卡表連結或內容。", "warn", 1800);
    return;
  }
  try {
    setDeckBuilderImportProgress("讀取卡表輸入中", 10, true);
    await delayMs(16);
    setDeckBuilderImportProgress("解析卡表中", 38, true);
    const entries = await parseDeckInputToEntriesCached(rawText, "");
    if (!entries.length) {
      setDeckBuilderImportProgress("找不到可匯入的卡表內容", 0, false);
      showToast("找不到可匯入的卡表內容。", "warn", 2200);
      return;
    }
    const inferredName = buildDeckBuilderImportedDeckName(rawText, entries);
    setDeckBuilderImportProgress("整理卡片資料中", 72, true);
    await delayMs(16);
    hydrateDeckBuilderFromEntries(entries, inferredName, "");
    if (deckNameInput && !deckNameInput.value.trim() && inferredName) {
      deckNameInput.value = inferredName;
    }
    setDeckBuilderImportProgress("卡表已匯入", 100, false);
    showToast("已匯入卡表到牌組編輯器", "success", 1800);
    window.setTimeout(() => {
      if (!state.deckBuilder.importBusy) {
        closeDeckBuilderImportModal();
      }
    }, 260);
  } catch (error) {
    setDeckBuilderImportProgress(error instanceof Error ? error.message : "匯入卡表失敗", 0, false);
    showToast(error instanceof Error ? error.message : "匯入卡表失敗", "error", 2400);
  }
}

function buildDeckBuilderImportedDeckName(rawText, entries = []) {
  const source = String(rawText || "").trim();
  const urlMatch = source.match(/deck\/([A-Za-z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return `匯入卡表 ${urlMatch[1]}`;
  }
  const firstEntry = Array.isArray(entries) && entries.length ? entries[0] : null;
  if (firstEntry && firstEntry.name) {
    return `${firstEntry.name} 牌組`;
  }
  return "匯入卡表";
}

function getDeckBuilderWarningShortText(validation) {
  if (!validation || !Array.isArray(validation.warnings) || !validation.warnings.length) {
    return "";
  }
  const [first] = validation.warnings;
  if (first.includes("需剛好 60 張")) {
    return validation.total > 60 ? "牌組超過 60 張" : "牌組未滿 60 張";
  }
  if (first.includes("超過 4 張限制")) {
    return "同名卡超過 4 張";
  }
  if (first.includes("無法儲存")) {
    return "含非法卡片";
  }
  return "牌組規則未通過";
}

function refreshDeckBuilderDeckArea() {
  renderDeckBuilderDeckList();
  renderDeckBuilderCardDetail();
  updateDeckBuilderWindowTitle();
}

function buildDeckBuilderEntries() {
  return state.deckBuilder.deckEntries.map((entry) => ({
    count: Number(entry.count) || 0,
    cardId: entry.card.cardId,
    name: entry.card.name,
    series: entry.card.series,
    number: entry.card.number,
    cardType: entry.card.cardType,
    elementType: entry.card.attribute,
    subtype: entry.card.subtype,
    hp: entry.card.hp,
    ruleText: entry.card.ruleText,
    effectText: entry.card.effectText,
    abilities: Array.isArray(entry.card.abilities) ? entry.card.abilities : [],
    attacks: Array.isArray(entry.card.attacks) ? entry.card.attacks : [],
    specialRules: Array.isArray(entry.card.specialRules) ? entry.card.specialRules : [],
    contentSignature: getDeckBuilderContentSignature(entry.card),
    imageRefs: cloneImageRefs(entry.card.imageRefs) || {
      primary: entry.card.imageUrl || "",
      secondary: "",
      placeholder: ""
    }
  }));
}

function buildDeckBuilderRawText(entries) {
  return normalizeDeckEntries(entries)
    .map((entry) => `${entry.count} ${entry.name} ${entry.series} ${entry.number}`)
    .join("\n");
}

function getDeckBuilderSearchRank(card, query = "") {
  const normalized = normalizeDeckBuilderComparableText(query);
  if (!normalized) {
    return 0;
  }
  const name = normalizeDeckBuilderComparableText(card.name || "");
  if (name === normalized) {
    return 0;
  }
  if (name.startsWith(normalized)) {
    return 1;
  }
  if (name.includes(normalized)) {
    return 2;
  }
  return 3;
}

function getDeckBuilderValidation() {
  const total = getDeckBuilderCurrentTotal();
  const warnings = [];
  const byName = new Map();
  let pokemon = 0;
  let trainer = 0;
  let energy = 0;
  state.deckBuilder.deckEntries.forEach((entry) => {
    const count = Number(entry.count) || 0;
    const card = entry.card;
    const name = normalizeDeckBuilderComparableText(card.name || "");
    byName.set(name, (byName.get(name) || 0) + count);
    if (card.cardType === "寶可夢") {
      pokemon += count;
    } else if (card.cardType === "訓練家") {
      trainer += count;
    } else if (card.cardType === "基本能量" || card.cardType === "特殊能量") {
      energy += count;
    }
  });
  if (total !== 60) {
    warnings.push(`目前牌組為 ${total} 張，需剛好 60 張。`);
  }
  for (const entry of state.deckBuilder.deckEntries) {
    const card = entry.card;
    if (isDeckBuilderBasicEnergy(card)) {
      continue;
    }
    if ((byName.get(normalizeDeckBuilderComparableText(card.name || "")) || 0) > 4) {
      warnings.push(`「${card.name}」超過 4 張限制。`);
      break;
    }
  }
  for (const entry of state.deckBuilder.deckEntries) {
    if (!isDeckBuilderCardRegulationLegal(entry.card)) {
      const mark = normalizeDeckBuilderRegulationMark(entry.card && entry.card.regulationMark || "") || "無";
      warnings.push(`「${entry.card.name}」目前版本標記為 ${mark}，且沒有對應 H/I/J 重製版本，無法儲存。`);
      break;
    }
  }
  return {
    total,
    warnings,
    pokemon,
    trainer,
    energy,
    valid: warnings.length === 0
  };
}

function getFilteredDeckBuilderCards() {
  const query = String(state.deckBuilder.search || "").trim().toLowerCase();
  const seriesFilter = String(state.deckBuilder.seriesFilter || "");
  const typeFilter = String(state.deckBuilder.typeFilter || "");
  const attributeFilter = deckBuilderTypeAllowsAttributeFilter(typeFilter) ? String(state.deckBuilder.attributeFilter || "") : "";
  const subtypeFilter = deckBuilderTypeAllowsSubtypeFilter(typeFilter) ? String(state.deckBuilder.subtypeFilter || "") : "";
  const evolutionStageFilters = normalizeDeckBuilderFilterArray(state.deckBuilder.evolutionStageFilter);
  const retreatCostFilters = normalizeDeckBuilderFilterArray(state.deckBuilder.retreatCostFilter);
  const abilitiesFilters = normalizeDeckBuilderFilterArray(state.deckBuilder.abilitiesFilter);
  return runtime.deckBuilderCatalog.filter((card) => {
    if (seriesFilter && card.series !== seriesFilter) {
      return false;
    }
    if (typeFilter && card.cardType !== typeFilter) {
      return false;
    }
    if (attributeFilter && card.attribute !== attributeFilter) {
      return false;
    }
    if (subtypeFilter) {
      if (subtypeFilter === "pokemon") {
        if (card.cardType !== "寶可夢") {
          return false;
        }
      } else if (card.subtype !== subtypeFilter) {
        return false;
      }
    }
    if (evolutionStageFilters.length && !evolutionStageFilters.includes(String(card.evolutionStage || ""))) {
      return false;
    }
    if (retreatCostFilters.length && !retreatCostFilters.includes(String(card.retreatCost ?? ""))) {
      return false;
    }
    if (abilitiesFilters.length === 1) {
      if (abilitiesFilters[0] === "yes" && !(Array.isArray(card.abilities) && card.abilities.length > 0)) {
        return false;
      }
      if (abilitiesFilters[0] === "no" && Array.isArray(card.abilities) && card.abilities.length > 0) {
        return false;
      }
    }
    if (!query) {
      return true;
    }
    return normalizeDeckBuilderComparableText(card.name || "").includes(normalizeDeckBuilderComparableText(query));
  }).sort((a, b) => {
    const rankDiff = getDeckBuilderSearchRank(a, query) - getDeckBuilderSearchRank(b, query);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    const seriesRankDiff = getDeckBuilderSeriesRank(a.series) - getDeckBuilderSeriesRank(b.series);
    if (seriesRankDiff !== 0) {
      return seriesRankDiff;
    }
    const numberDiff = normalizeCardNumber(a.number).localeCompare(normalizeCardNumber(b.number), "zh-Hant", { numeric: true });
    if (numberDiff !== 0) {
      return numberDiff;
    }
    const nameDiff = a.name.localeCompare(b.name, "zh-Hant");
    if (nameDiff !== 0) {
      return nameDiff;
    }
    return a.cardType.localeCompare(b.cardType, "zh-Hant");
  });
}

function syncDeckBuilderFilterAvailability() {
  const seriesSelect = document.getElementById("deck-builder-series-filter");
  const typeSelect = document.getElementById("deck-builder-type-filter");
  const attributeSelect = document.getElementById("deck-builder-attribute-filter");
  const subtypeSelect = document.getElementById("deck-builder-subtype-filter");
  const typeValue = String(state.deckBuilder.typeFilter || "");
  const allowSubtype = deckBuilderTypeAllowsSubtypeFilter(typeValue);
  const allowAttribute = deckBuilderTypeAllowsAttributeFilter(typeValue);
  const allowedAttributeOptions = getDeckBuilderAttributeOptionsForType(typeValue);

  if (!allowSubtype) {
    state.deckBuilder.subtypeFilter = "";
  }
  if (!allowAttribute || (state.deckBuilder.attributeFilter && !allowedAttributeOptions.includes(state.deckBuilder.attributeFilter))) {
    state.deckBuilder.attributeFilter = "";
  }

  if (subtypeSelect) {
    subtypeSelect.disabled = !allowSubtype;
    subtypeSelect.classList.toggle("filter-disabled", !allowSubtype);
    if (!allowSubtype) {
      subtypeSelect.value = "";
    }
  }
  if (attributeSelect) {
    attributeSelect.disabled = !allowAttribute;
    attributeSelect.classList.toggle("filter-disabled", !allowAttribute);
    if (!allowAttribute) {
      attributeSelect.value = "";
    }
  }
  if (typeSelect) {
    typeSelect.value = typeValue;
  }
  if (seriesSelect) {
    seriesSelect.value = state.deckBuilder.seriesFilter;
  }
}

function getDeckBuilderGroupedResults() {
  const filtered = getFilteredDeckBuilderCards();
  const groups = [];
  const byGroup = new Map();
  filtered.forEach((card) => {
    const groupKey = getDeckBuilderGroupKey(card);
    if (!byGroup.has(groupKey)) {
      const group = {
        groupKey,
        versions: []
      };
      byGroup.set(groupKey, group);
      groups.push(group);
    }
    byGroup.get(groupKey).versions.push(card);
  });
  groups.forEach((group) => {
    group.versions.sort((a, b) => {
      const seriesRankDiff = getDeckBuilderSeriesRank(a.series) - getDeckBuilderSeriesRank(b.series);
      if (seriesRankDiff !== 0) {
        return seriesRankDiff;
      }
      const numberDiff = normalizeCardNumber(a.number).localeCompare(normalizeCardNumber(b.number), "zh-Hant", { numeric: true });
      if (numberDiff !== 0) {
        return numberDiff;
      }
      return a.name.localeCompare(b.name, "zh-Hant");
    });
    group.selectedCard = group.versions[0];
    group.hasSelected = group.versions.some((card) => card.key === state.deckBuilder.selectedCardKey);
  });
  runtime.deckBuilderGroupedResults = groups;
  runtime.deckBuilderResultKeys = groups.flatMap((group) => group.versions.map((card) => card.key));
  return groups;
}

function renderDeckBuilderSavedOptions() {
  const select = document.getElementById("deck-builder-saved-select");
  if (!select) {
    return;
  }
  const selected = select.value;
  select.innerHTML = '<option value="">選擇已存牌組</option>';
  [...runtime.deckLibrary]
    .sort((a, b) => new Date(b.lastUsedAt || b.savedAt || 0).getTime() - new Date(a.lastUsedAt || a.savedAt || 0).getTime())
    .forEach((deck) => {
      const option = document.createElement("option");
      option.value = deck.id;
      option.textContent = deck.name || "未命名牌組";
      select.appendChild(option);
    });
  if (selected && runtime.deckLibrary.some((deck) => deck.id === selected)) {
    select.value = selected;
  }
}

function renderDeckBuilderFilters() {
  const seriesSelect = document.getElementById("deck-builder-series-filter");
  const typeSelect = document.getElementById("deck-builder-type-filter");
  const attributeSelect = document.getElementById("deck-builder-attribute-filter");
  const subtypeSelect = document.getElementById("deck-builder-subtype-filter");
  const evolutionList = document.getElementById("deck-builder-evolution-filter-list");
  const retreatList = document.getElementById("deck-builder-retreat-filter-list");
  const abilitiesList = document.getElementById("deck-builder-abilities-filter-list");
  const advancedFilters = document.getElementById("deck-builder-advanced-filter-popover");
  const advancedFilterBtn = document.getElementById("deck-builder-advanced-filter-btn");
  if (seriesSelect) {
    const currentValues = [...seriesSelect.options].slice(1).map((option) => option.value);
    const nextValues = runtime.deckBuilderSeriesOptions.map((option) => option.code);
    if (currentValues.join("|") !== nextValues.join("|")) {
      seriesSelect.innerHTML = '<option value="">全部系列</option>';
      runtime.deckBuilderSeriesOptions.forEach((optionData) => {
        const option = document.createElement("option");
        option.value = optionData.code;
        option.textContent = buildDeckBuilderSeriesOptionLabel(optionData);
        seriesSelect.appendChild(option);
      });
    }
    if (!nextValues.includes(state.deckBuilder.seriesFilter)) {
      state.deckBuilder.seriesFilter = "";
    }
    seriesSelect.value = state.deckBuilder.seriesFilter;
  }
  if (typeSelect && typeSelect.options.length <= 1) {
    runtime.deckBuilderTypeOptions.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      typeSelect.appendChild(option);
    });
  }
  if (attributeSelect) {
    const optionValues = getDeckBuilderAttributeOptionsForType(state.deckBuilder.typeFilter);
    const currentValues = [...attributeSelect.options].slice(1).map((option) => option.value);
    if (currentValues.join("|") !== optionValues.join("|")) {
      attributeSelect.innerHTML = '<option value="">全部屬性</option>';
      optionValues.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = formatDeckBuilderAttribute(value);
        attributeSelect.appendChild(option);
      });
    }
    if (!optionValues.includes(state.deckBuilder.attributeFilter)) {
      state.deckBuilder.attributeFilter = "";
    }
  }
  if (subtypeSelect) {
    const allowSubtype = deckBuilderTypeAllowsSubtypeFilter(state.deckBuilder.typeFilter);
    const optionValues = runtime.deckBuilderSubtypeOptions.filter((value) => {
      if (value === "pokemon" && String(state.deckBuilder.typeFilter || "") === "訓練家") {
        return false;
      }
      return true;
    });
    const currentValues = [...subtypeSelect.options].slice(1).map((option) => option.value);
    if (currentValues.join("|") !== optionValues.join("|")) {
      subtypeSelect.innerHTML = '<option value="">全部子類型</option>';
      optionValues.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = formatDeckBuilderSubtype(value);
        subtypeSelect.appendChild(option);
      });
    }
    if (!allowSubtype || !optionValues.includes(state.deckBuilder.subtypeFilter)) {
      state.deckBuilder.subtypeFilter = "";
    }
    subtypeSelect.value = state.deckBuilder.subtypeFilter;
  }
  if (typeSelect) {
    typeSelect.value = state.deckBuilder.typeFilter;
  }
  if (attributeSelect) {
    attributeSelect.value = state.deckBuilder.attributeFilter;
  }
  state.deckBuilder.evolutionStageFilter = normalizeDeckBuilderFilterArray(state.deckBuilder.evolutionStageFilter)
    .filter((value) => runtime.deckBuilderEvolutionOptions.includes(value));
  state.deckBuilder.retreatCostFilter = normalizeDeckBuilderFilterArray(state.deckBuilder.retreatCostFilter)
    .filter((value) => runtime.deckBuilderRetreatCostOptions.includes(value));
  state.deckBuilder.abilitiesFilter = normalizeDeckBuilderFilterArray(state.deckBuilder.abilitiesFilter)
    .filter((value) => ["yes", "no"].includes(value));

  if (evolutionList) {
    evolutionList.innerHTML = "";
    runtime.deckBuilderEvolutionOptions.forEach((value) => {
      evolutionList.appendChild(buildDeckBuilderCheckboxItem(
        "deck-builder-evolution-filter",
        value,
        value,
        state.deckBuilder.evolutionStageFilter.includes(value)
      ));
    });
  }
  if (retreatList) {
    retreatList.innerHTML = "";
    runtime.deckBuilderRetreatCostOptions.forEach((value) => {
      retreatList.appendChild(buildDeckBuilderCheckboxItem(
        "deck-builder-retreat-filter",
        value,
        value,
        state.deckBuilder.retreatCostFilter.includes(value)
      ));
    });
  }
  if (abilitiesList) {
    abilitiesList.innerHTML = "";
    abilitiesList.appendChild(buildDeckBuilderCheckboxItem(
      "deck-builder-abilities-filter",
      "yes",
      "有特性",
      state.deckBuilder.abilitiesFilter.includes("yes")
    ));
    abilitiesList.appendChild(buildDeckBuilderCheckboxItem(
      "deck-builder-abilities-filter",
      "no",
      "無特性",
      state.deckBuilder.abilitiesFilter.includes("no")
    ));
  }
  if (advancedFilters) {
    advancedFilters.classList.toggle("hidden", !state.deckBuilder.advancedFiltersOpen);
  }
  if (advancedFilterBtn) {
    advancedFilterBtn.textContent = "進階篩選";
  }
  syncDeckBuilderFilterAvailability();
}

function renderDeckBuilderCardDetail() {
  const host = document.getElementById("deck-builder-card-detail");
  if (!host) {
    return;
  }
  try {
    const card = resolveDeckBuilderSelectedCard();
    if (!card) {
      host.innerHTML = '<div class="deck-builder-detail-empty">請先選擇一張卡片</div>';
      return;
    }
    const selectedDeckEntry = resolveDeckBuilderSelectedEntry();
    const abilities = Array.isArray(card.abilities) ? card.abilities : [];
    const attacks = Array.isArray(card.attacks) ? card.attacks : [];
    const specialRules = Array.isArray(card.specialRules) ? card.specialRules : [];
    const copiesByName = getDeckBuilderCopiesByName(card.name);
    host.innerHTML = "";
    const top = document.createElement("div");
    top.className = "deck-builder-detail-top";

    const image = document.createElement("img");
    image.className = "deck-builder-detail-image";
    image.src = card.imageUrl || getCardBackImageUrl();
    image.alt = card.name;
    image.draggable = false;
    image.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDeckBuilderImagePreview(card.imageUrl || getCardBackImageUrl(), card.name);
    });
    top.appendChild(image);

    const info = document.createElement("div");
    info.className = "deck-builder-detail-info";
    const title = document.createElement("div");
    title.className = "deck-builder-detail-title";
    title.textContent = card.name;
    title.title = card.name;
    const subtitleGroup = document.createElement("div");
    subtitleGroup.className = "deck-builder-detail-subtitle-group";
    const subtitle = document.createElement("div");
    subtitle.className = "deck-builder-detail-subtitle";
    subtitle.textContent = `${card.series} ${card.number}`;
    subtitle.title = subtitle.textContent;
    subtitleGroup.appendChild(subtitle);
    let productLine = null;
    if (card.productName) {
      productLine = document.createElement("div");
      productLine.className = "deck-builder-detail-subtitle";
      productLine.textContent = card.productName;
      productLine.title = card.productName;
      subtitleGroup.appendChild(productLine);
    }
    const versionCards = resolveDeckBuilderVersionCards(card);
    let versionRow = null;
    if (versionCards.length > 1) {
      versionRow = document.createElement("label");
      versionRow.className = "deck-builder-version-row";
      const versionLabel = document.createElement("span");
      versionLabel.className = "deck-builder-version-label";
      versionLabel.textContent = "切換版本";
      const versionSelect = document.createElement("select");
      versionSelect.className = "deck-builder-version-select";
      versionCards.forEach((versionCard) => {
        const option = document.createElement("option");
        option.value = versionCard.key;
        option.textContent = versionCard.versionLabel || getDeckBuilderVariantLabel(versionCard);
        option.selected = versionCard.key === card.key;
        versionSelect.appendChild(option);
      });
      versionSelect.addEventListener("change", () => {
        const newKey = versionSelect.value || versionCards[0].key;
        const newCard = runtime.deckBuilderCardMap.get(newKey);
        const currentDeckEntry = resolveDeckBuilderSelectedEntry();
        if (currentDeckEntry && newCard) {
          // 來自牌組清單的版本切換：更新 entry 的 card 並保持選取
          currentDeckEntry.card = newCard;
          currentDeckEntry.key = newCard.key;
          state.deckBuilder.selectedCardKey = newCard.key;
          // 不清除 selectedDeckEntryKey，維持牌組清單選取狀態
        } else {
          selectDeckBuilderCatalogCard(newKey);
        }
        runtime.deckBuilderVirtualStartIndex = -1;
        renderDeckBuilderCardList();
        renderDeckBuilderCardDetail();
        renderDeckBuilderDeckList();
      });
      versionRow.appendChild(versionLabel);
      versionRow.appendChild(versionSelect);
    }
    const tags = document.createElement("div");
    tags.className = "deck-builder-detail-tags";
    [card.cardType, card.attribute ? formatDeckBuilderAttribute(card.attribute) : "", card.subtype ? formatDeckBuilderSubtype(card.subtype) : "", card.regulationMark ? `標記 ${card.regulationMark}` : "", card.hp ? `HP ${card.hp}` : ""]
      .filter(Boolean)
      .forEach((label) => {
        const tag = document.createElement("span");
        tag.className = "deck-builder-tag";
        tag.textContent = label;
        tags.appendChild(tag);
      });
    const copies = document.createElement("div");
    copies.className = "deck-builder-detail-subtitle";
    copies.textContent = `目前牌組內：${copiesByName} 張`;
    const actions = document.createElement("div");
    actions.className = "deck-builder-detail-actions";
    if (selectedDeckEntry && selectedDeckEntry.card && selectedDeckEntry.card.key === card.key) {
      const decrementBtn = document.createElement("button");
      decrementBtn.type = "button";
      decrementBtn.className = "deck-builder-deck-adjust-btn";
      decrementBtn.textContent = "－";
      decrementBtn.addEventListener("click", () => {
        changeDeckBuilderEntryCount(selectedDeckEntry.key, -1);
      });

      const incrementBtn = document.createElement("button");
      incrementBtn.type = "button";
      incrementBtn.className = "deck-builder-deck-adjust-btn";
      incrementBtn.textContent = "＋";
      incrementBtn.disabled = !canAddDeckBuilderCard(card, 1).ok;
      incrementBtn.addEventListener("click", () => {
        changeDeckBuilderEntryCount(selectedDeckEntry.key, 1);
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "deck-builder-deck-adjust-btn";
      removeBtn.textContent = "移除";
      removeBtn.addEventListener("click", () => {
        changeDeckBuilderEntryCount(selectedDeckEntry.key, -selectedDeckEntry.count);
      });

      actions.appendChild(decrementBtn);
      actions.appendChild(incrementBtn);
      actions.appendChild(removeBtn);
    } else {
      const addOneBtn = document.createElement("button");
      addOneBtn.type = "button";
      addOneBtn.textContent = "加入 1 張";
      addOneBtn.disabled = !canAddDeckBuilderCard(card, 1).ok;
      addOneBtn.addEventListener("click", () => {
        addDeckBuilderCard(card, 1);
      });
      const addFourBtn = document.createElement("button");
      addFourBtn.type = "button";
      addFourBtn.textContent = "加入 4 張";
      addFourBtn.disabled = !canAddDeckBuilderCard(card, 4).ok;
      addFourBtn.addEventListener("click", () => {
        addDeckBuilderCard(card, 4);
      });
      actions.appendChild(addOneBtn);
      actions.appendChild(addFourBtn);
    }

    info.appendChild(title);
    info.appendChild(subtitleGroup);
    info.appendChild(tags);
    info.appendChild(copies);
    info.appendChild(actions);
    top.appendChild(info);
    host.appendChild(top);
    if (versionRow) {
      host.appendChild(versionRow);
    }

    const appendSection = (titleText, bodyBuilder) => {
      const section = document.createElement("section");
      section.className = "deck-builder-detail-section";
      const titleEl = document.createElement("div");
      titleEl.className = "deck-builder-detail-section-title";
      titleEl.textContent = titleText;
      section.appendChild(titleEl);
      bodyBuilder(section);
      host.appendChild(section);
    };

    let hasContent = false;
    if (card.ruleText || specialRules.length) {
      hasContent = true;
      appendSection("規則", (section) => {
        if (card.ruleText) {
          const body = document.createElement("div");
          body.className = "deck-builder-detail-text";
          body.textContent = card.ruleText;
          section.appendChild(body);
        }
        specialRules.filter(Boolean).forEach((rule) => {
          const ruleEl = document.createElement("div");
          ruleEl.className = "deck-builder-detail-text";
          ruleEl.textContent = rule;
          section.appendChild(ruleEl);
        });
      });
    }
    if (card.effectText) {
      hasContent = true;
      appendSection("效果", (section) => {
        const body = document.createElement("div");
        body.className = "deck-builder-detail-text";
        body.textContent = card.effectText;
        section.appendChild(body);
      });
    }
    if (abilities.length) {
      hasContent = true;
      appendSection("特性", (section) => {
        abilities.forEach((ability) => {
          const item = document.createElement("div");
          item.className = "deck-builder-detail-item";
          const name = String(ability.name || "").trim();
          const effect = String(ability.effect_text || ability.effect || ability.text || "").trim();
          if (name) {
            const nameEl = document.createElement("div");
            nameEl.className = "deck-builder-detail-item-title";
            nameEl.textContent = name;
            item.appendChild(nameEl);
          }
          if (effect) {
            const effectEl = document.createElement("div");
            effectEl.className = "deck-builder-detail-text";
            effectEl.textContent = effect;
            item.appendChild(effectEl);
          }
          section.appendChild(item);
        });
      });
    }
    if (attacks.length) {
      hasContent = true;
      appendSection("招式", (section) => {
        attacks.forEach((attack) => {
          const item = document.createElement("div");
          item.className = "deck-builder-detail-item";
          const name = String(attack.name || "").trim();
          const cost = Array.isArray(attack.cost) ? attack.cost.map((entry) => formatDeckBuilderAttribute(entry)).filter(Boolean) : [];
          const damage = String(attack.damage || "").trim();
          const effect = String(attack.effect_text || attack.effect || attack.text || "").trim();
          if (name) {
            const nameEl = document.createElement("div");
            nameEl.className = "deck-builder-detail-item-title";
            nameEl.textContent = name;
            item.appendChild(nameEl);
          }
          if (cost.length) {
            const costEl = document.createElement("div");
            costEl.className = "deck-builder-detail-text";
            costEl.textContent = `需求能量：${cost.join(" ")}`;
            item.appendChild(costEl);
          }
          if (damage) {
            const damageEl = document.createElement("div");
            damageEl.className = "deck-builder-detail-text";
            damageEl.textContent = `傷害：${damage}`;
            item.appendChild(damageEl);
          }
          if (effect) {
            const effectEl = document.createElement("div");
            effectEl.className = "deck-builder-detail-text";
            effectEl.textContent = `效果：${effect}`;
            item.appendChild(effectEl);
          }
          section.appendChild(item);
        });
      });
    }
    if (!hasContent) {
      const empty = document.createElement("div");
      empty.className = "deck-builder-detail-empty";
      empty.textContent = "這張卡目前沒有額外顯示資訊";
      host.appendChild(empty);
    }
    fitDeckBuilderTextToSingleLine(title, 20, 12);
    fitDeckBuilderTextToSingleLine(subtitle, 13, 10);
    if (productLine) {
      fitDeckBuilderTextToSingleLine(productLine, 13, 10);
    }
  } catch (error) {
    host.innerHTML = '<div class="deck-builder-detail-empty">卡片詳細資料載入失敗</div>';
    console.error("renderDeckBuilderCardDetail failed", error);
  }
}

function renderDeckBuilderCardList() {
  const host = document.getElementById("deck-builder-card-list");
  if (!host) {
    return;
  }
  const desiredScrollTop = runtime.deckBuilderCardListScrollTop || host.scrollTop || 0;
  const grouped = getDeckBuilderGroupedResults();
  const hasSelectedDeckEntry = !!resolveDeckBuilderSelectedEntry();
  if (!state.deckBuilder.selectedCardKey) {
    selectDeckBuilderCatalogCard(grouped[0] ? grouped[0].selectedCard.key : "");
  } else if (!runtime.deckBuilderResultKeys.includes(state.deckBuilder.selectedCardKey) && !hasSelectedDeckEntry) {
    selectDeckBuilderCatalogCard(grouped[0] ? grouped[0].selectedCard.key : "");
  }
  if (grouped.length === 0) {
    host.innerHTML = '<div class="deck-builder-card-list-empty">沒有符合條件的卡片</div>';
    runtime.deckBuilderVirtualStartIndex = -1;
    renderDeckBuilderCardDetail();
    return;
  }
  const rowHeight = 90;
  // 一次渲染全部，不再做虛擬滾動分段
  const startIndex = 0;
  const endIndex = grouped.length;

  // 虛擬滾動快取：只有在 startIndex 相同且資料筆數未改變時才跳過重繪
  const prevGroupCount = runtime.deckBuilderVirtualGroupCount || -1;
  if (runtime.deckBuilderVirtualStartIndex === startIndex && prevGroupCount === grouped.length && host.querySelector(".deck-builder-virtual-layer")) {
    updateDeckBuilderCardSelectionUi();
    if (Math.abs((host.scrollTop || 0) - desiredScrollTop) > 1) {
      host.scrollTop = desiredScrollTop;
    }
    renderDeckBuilderCardDetail();
    return;
  }

  runtime.deckBuilderVirtualStartIndex = startIndex;
  runtime.deckBuilderVirtualGroupCount = grouped.length;

  const spacer = document.createElement("div");
  spacer.className = "deck-builder-virtual-spacer";
  spacer.style.height = `${grouped.length * rowHeight}px`;
  const layer = document.createElement("div");
  layer.className = "deck-builder-virtual-layer";
  layer.style.transform = `translateY(${startIndex * rowHeight}px)`;
  layer.style.willChange = "transform";

  grouped.slice(startIndex, endIndex).forEach((group) => {
    const card = group.selectedCard;
    const row = document.createElement("button");
    row.type = "button";
    row.className = `deck-builder-card-row${group.hasSelected ? " selected" : ""}`;
    row.dataset.cardKey = card.key;
    row.addEventListener("click", () => {
      runtime.deckBuilderKeyboardScope = "catalog";
      selectDeckBuilderCatalogCard(card.key);
      updateDeckBuilderCardSelectionUi();
      updateDeckBuilderDeckSelectionUi();
      renderDeckBuilderCardDetail();
    });

    const thumb = document.createElement("img");
    thumb.className = "deck-builder-thumb";
    thumb.src = card.imageUrl || getCardBackImageUrl();
    thumb.alt = card.name;
    thumb.loading = "eager";
    thumb.decoding = "async";

    const main = document.createElement("div");
    main.className = "deck-builder-card-main";
    const infoLine = document.createElement("div");
    infoLine.className = "deck-builder-card-info-line";
    const nameEl = document.createElement("div");
    nameEl.className = "deck-builder-card-name";
    nameEl.textContent = card.name;
    const meta = document.createElement("div");
    meta.className = "deck-builder-card-meta";
    meta.textContent = `${card.series} ${card.number}｜${card.cardType}`;
    infoLine.appendChild(nameEl);
    infoLine.appendChild(meta);
    main.appendChild(infoLine);

    const actions = document.createElement("div");
    actions.className = "deck-builder-card-actions";
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.textContent = "+1";
    addBtn.disabled = !canAddDeckBuilderCard(card, 1).ok;
    addBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      addDeckBuilderCard(card, 1);
    });
    actions.appendChild(addBtn);

    row.appendChild(thumb);
    row.appendChild(main);
    row.appendChild(actions);
    layer.appendChild(row);
  });
  const frag = document.createDocumentFragment();
  frag.appendChild(spacer);
  frag.appendChild(layer);
  host.innerHTML = "";
  host.appendChild(frag);
  if (Math.abs((host.scrollTop || 0) - desiredScrollTop) > 1) {
    host.scrollTop = desiredScrollTop;
  }
  renderDeckBuilderCardDetail();
}

function renderDeckBuilderDeckList() {
  const host = document.getElementById("deck-builder-deck-list");
  const summaryEl = document.getElementById("deck-builder-summary");
  const warningEl = document.getElementById("deck-builder-warning");
  const saveBtn = document.getElementById("deck-builder-save-btn");
  if (!host || !summaryEl || !warningEl) {
    return;
  }
  const desiredScrollTop = runtime.deckBuilderDeckListScrollTop || host.scrollTop || 0;

  const validation = getDeckBuilderValidation();
  summaryEl.innerHTML = `
    <div class="deck-builder-summary-status ${validation.valid ? "valid" : "invalid"}">${validation.valid ? "可直接套用" : "規則未完成"}</div>
    <div class="deck-builder-summary-line">總張數 ${validation.total} / 60　寶可夢 ${validation.pokemon}　訓練家 ${validation.trainer}　能量 ${validation.energy}</div>
  `;
  if (validation.warnings.length) {
    warningEl.classList.remove("hidden");
    warningEl.textContent = getDeckBuilderWarningShortText(validation);
    warningEl.title = validation.warnings.join(" ");
  } else {
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    warningEl.title = "";
  }

  if (saveBtn) {
    saveBtn.disabled = !validation.valid;
  }

  host.innerHTML = "";
  const displayCards = getDeckBuilderDeckDisplayCards();
  if (!displayCards.length) {
    host.innerHTML = '<div class="deck-builder-deck-empty">尚未加入任何卡片</div>';
    return;
  }
  displayCards.forEach((item) => {
    const { entry, displayKey } = item;
    const card = entry.card;
    const selected = runtime.deckBuilderSelectedDeckDisplayKey === displayKey;
    const row = document.createElement("div");
    row.className = `deck-builder-deck-card${selected ? " selected" : ""}`;
    row.dataset.displayKey = displayKey;
    row.title = `${card.name}｜${card.series} ${card.number}`;
    row.addEventListener("click", () => {
      selectDeckBuilderDeckEntry(entry, displayKey);
      renderDeckBuilderCardDetail();
      updateDeckBuilderCardSelectionUi();
      updateDeckBuilderDeckSelectionUi();
    });

    const shell = document.createElement("div");
    shell.className = "deck-builder-deck-card-shell";
    const thumb = document.createElement("img");
    thumb.className = "deck-builder-deck-card-image";
    thumb.src = card.imageUrl || getCardBackImageUrl();
    thumb.alt = card.name;
    thumb.loading = "eager";
    thumb.decoding = "async";
    shell.appendChild(thumb);

    row.appendChild(shell);
    host.appendChild(row);
  });
  if (Math.abs((host.scrollTop || 0) - desiredScrollTop) > 1) {
    host.scrollTop = desiredScrollTop;
  }
}

function renderDeckBuilderState() {
  renderDeckBuilderSavedOptions();
  renderDeckBuilderFilters();
  renderDeckBuilderCardList();
  renderDeckBuilderCardDetail();
  renderDeckBuilderDeckList();
  updateDeckBuilderWindowTitle();
}

function updateDeckBuilderWindowTitle() {
  const deckNameInput = document.getElementById("deck-builder-name-input");
  const deckName = String(deckNameInput && deckNameInput.value || "").trim() || "未命名牌組";
  const total = getDeckBuilderCurrentTotal();
  const validation = getDeckBuilderValidation();
  const delta = total - 60;
  const status = validation.valid ? "可儲存" : (delta > 0 ? `超出${delta}張` : `尚差${Math.abs(delta)}張`);
  const title = `PTCG 牌組編輯器｜${deckName}｜${total}/60｜${status}`;
  document.title = title;
  if (IS_DECK_BUILDER_WINDOW && runtime.ipcRenderer) {
    runtime.ipcRenderer.send("set-deck-builder-window-title", title);
  }
}

function clearDeckBuilderDeck() {
  state.deckBuilder.deckEntries = [];
  state.deckBuilder.selectedDeckEntryKey = "";
  state.deckBuilder.selectedCardKey = runtime.deckBuilderGroupedResults[0]?.selectedCard?.key || runtime.deckBuilderCatalog[0]?.key || "";
  runtime.deckBuilderSelectedDeckDisplayKey = "";
  runtime.deckBuilderCardListScrollTop = 0;
  runtime.deckBuilderDeckListScrollTop = 0;
  runtime.deckBuilderVirtualStartIndex = -1;
  runtime.deckBuilderKeyboardScope = "catalog";
  const nameInput = document.getElementById("deck-builder-name-input");
  if (nameInput) {
    nameInput.value = "";
  }
  const savedSelect = document.getElementById("deck-builder-saved-select");
  if (savedSelect) {
    savedSelect.value = "";
  }
  renderDeckBuilderState();
}

function hydrateDeckBuilderFromEntries(entries, name = "", selectedId = "") {
  state.deckBuilder.deckEntries = normalizeDeckEntries(entries).map((entry) => {
    const key = buildDeckBuilderCardKeyFromParts({
      name: entry.name,
      series: entry.series,
      number: entry.number,
      cardType: entry.cardType,
      subtype: entry.subtype || "",
      attribute: entry.elementType
    });
    const card = findDeckBuilderCatalogCardForEntry(entry) || runtime.deckBuilderCardMap.get(key) || buildDeckBuilderFallbackCard(entry);
    return {
      key: card.key,
      card,
      count: Number(entry.count) || 0
    };
  }).filter((entry) => entry.count > 0);
  state.deckBuilder.selectedDeckEntryKey = state.deckBuilder.deckEntries[0]?.key || "";
  state.deckBuilder.selectedCardKey = state.deckBuilder.deckEntries[0]?.card?.key || state.deckBuilder.selectedCardKey;
  runtime.deckBuilderSelectedDeckDisplayKey = state.deckBuilder.deckEntries[0]?.key ? `${state.deckBuilder.deckEntries[0].key}::0` : "";
  runtime.deckBuilderCardListScrollTop = 0;
  runtime.deckBuilderDeckListScrollTop = 0;
  runtime.deckBuilderVirtualStartIndex = -1;
  runtime.deckBuilderKeyboardScope = state.deckBuilder.deckEntries.length ? "deck" : "catalog";
  const nameInput = document.getElementById("deck-builder-name-input");
  if (nameInput) {
    nameInput.value = name;
  }
  const savedSelect = document.getElementById("deck-builder-saved-select");
  if (savedSelect) {
    savedSelect.value = selectedId;
  }
  renderDeckBuilderState();
}

function saveDeckBuilderDeck() {
  const validation = getDeckBuilderValidation();
  if (!validation.valid) {
    showToast("牌組尚未符合規則，無法儲存。", "warn", 1800);
    return;
  }
  const nameInput = document.getElementById("deck-builder-name-input");
  const savedSelect = document.getElementById("deck-builder-saved-select");
  const deckName = String(nameInput && nameInput.value || "").trim();
  if (!deckName) {
    showToast("請輸入牌組名稱。", "warn", 1800);
    return;
  }
  const entries = buildDeckBuilderEntries();
  const payload = {
    id: savedSelect && savedSelect.value ? savedSelect.value : `builder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: deckName,
    savedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    owner: "player1",
    rawText: buildDeckBuilderRawText(entries),
    coverImageUrl: getDeckCoverImageFromEntries(entries),
    entries
  };
  const existingIndex = runtime.deckLibrary.findIndex((deck) => deck.id === payload.id);
  if (existingIndex >= 0) {
    runtime.deckLibrary[existingIndex] = {
      ...runtime.deckLibrary[existingIndex],
      ...payload,
      savedAt: runtime.deckLibrary[existingIndex].savedAt || payload.savedAt
    };
  } else {
    runtime.deckLibrary.unshift(payload);
  }
  if (setDeckLibraryToStorage(runtime.deckLibrary)) {
    notifyDeckLibraryUpdated();
  }
  renderDeckLibraryList();
  renderDeckBuilderSavedOptions();
  if (savedSelect) {
    savedSelect.value = payload.id;
  }
  showToast("牌組已儲存", "success", 1600);
}

async function exportDeckBuilderRawText() {
  const entries = buildDeckBuilderEntries();
  if (!entries.length) {
    showToast("目前沒有卡片可匯出。", "warn", 1800);
    return;
  }
  const validation = getDeckBuilderValidation();
  const rawText = buildDeckBuilderRawText(entries);
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(rawText);
    } else {
      const temp = document.createElement("textarea");
      temp.value = rawText;
      temp.setAttribute("readonly", "true");
      temp.style.position = "fixed";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    if (validation.valid) {
      showToast("已匯出卡表文字", "success", 1600);
    } else {
      showToast("已匯出卡表文字，但牌組尚未符合規則。", "warn", 2200);
    }
  } catch {
    showToast("匯出卡表文字失敗", "error", 1800);
  }
}

async function exportDeckBuilderToFile() {
  if (!runtime.ipcRenderer) {
    showToast("目前環境不支援匯出檔案", "warn", 1800);
    return;
  }
  const entries = buildDeckBuilderEntries();
  if (!entries.length) {
    showToast("目前沒有卡片可匯出。", "warn", 1800);
    return;
  }
  const nameInput = document.getElementById("deck-builder-name-input");
  const deckName = String(nameInput && nameInput.value || "").trim() || "未命名牌組";
  const rawText = buildDeckBuilderRawText(entries);
  try {
    const result = await runtime.ipcRenderer.invoke("export-deck-builder-file", {
      name: deckName,
      rawText
    });
    if (!result || result.ok !== true) {
      if (result && result.error === "已取消匯出") {
        return;
      }
      showToast(result && result.error ? result.error : "匯出檔案失敗", "error", 1800);
      return;
    }
    showToast("已匯出牌組檔案", "success", 1600);
  } catch (error) {
    showToast(error instanceof Error ? error.message : "匯出檔案失敗", "error", 1800);
  }
}

function loadDeckBuilderSavedDeck() {
  const select = document.getElementById("deck-builder-saved-select");
  if (!select || !select.value) {
    showToast("請先選擇已存牌組。", "warn", 1800);
    return;
  }
  const item = runtime.deckLibrary.find((deck) => deck.id === select.value);
  if (!item || !Array.isArray(item.entries)) {
    showToast("找不到已存牌組資料。", "error", 1800);
    return;
  }
  hydrateDeckBuilderFromEntries(item.entries, item.name || "", item.id);
  showToast(`已載入「${item.name}」`, "success", 1500);
}

async function applyDeckBuilderToOwner(owner) {
  const validation = getDeckBuilderValidation();
  if (!validation.valid) {
    showToast("牌組尚未符合規則，無法套用。", "warn", 1800);
    return;
  }
  const entries = buildDeckBuilderEntries();
  const rawText = buildDeckBuilderRawText(entries);
  if (IS_DECK_BUILDER_WINDOW && runtime.ipcRenderer) {
    const response = await runtime.ipcRenderer.invoke("apply-deck-builder-to-owner", {
      owner,
      entries,
      rawText
    });
    if (!response || response.ok !== true) {
      showToast(response && response.error ? response.error : "套用牌組失敗", "error", 1800);
      return;
    }
    showToast(owner === "player1" ? "已套用到我方牌組" : "已套用到對手牌組", "success", 1600);
    return;
  }
  await applyDeckEntriesForOwner(entries, owner, {
    broadcastImport: state.peer.multiplayerEnabled && owner === "player1",
    sourceText: rawText
  });
  const input = document.getElementById(owner === "player1" ? "deck-import-input-player1" : "deck-import-input-opponent");
  if (input) {
    input.value = rawText;
  }
  showToast(owner === "player1" ? "已套用到我方牌組" : "已套用到對手牌組", "success", 1600);
}

function closeDeckBuilderModal() {
  if (IS_DECK_BUILDER_WINDOW) {
    window.close();
    return;
  }
  const modal = document.getElementById("deck-builder-modal");
  if (!modal) {
    return;
  }
  hideWithAnimation(modal);
  modal.setAttribute("aria-hidden", "true");
  state.deckBuilder.isOpen = false;
  state.deckBuilder.advancedFiltersOpen = false;
  closeDeckBuilderImportModal();
  closeDeckBuilderImagePreview();
  clearDeckBuilderRenderedMedia();

  // 清除所有篩選、搜尋、快取、牌組
  state.deckBuilder.search = "";
  state.deckBuilder.seriesFilter = "";
  state.deckBuilder.typeFilter = "";
  state.deckBuilder.attributeFilter = "";
  state.deckBuilder.subtypeFilter = "";
  state.deckBuilder.evolutionFilter = [];
  state.deckBuilder.retreatCostFilter = [];
  state.deckBuilder.selectedCardKey = "";
  state.deckBuilder.selectedDeckEntryKey = "";
  state.deckBuilder.deckEntries = [];
  state.deckBuilder.currentDeckId = "";
  runtime.deckBuilderSelectedDeckDisplayKey = "";
  runtime.deckBuilderVirtualStartIndex = -1;
  runtime.deckBuilderVirtualGroupCount = -1;
  runtime.deckBuilderKeyboardScope = "catalog";
  const searchInput = document.getElementById("deck-builder-search-input");
  if (searchInput) searchInput.value = "";
  const nameInput = document.getElementById("deck-builder-name-input");
  if (nameInput) nameInput.value = "";
  const savedSelect = document.getElementById("deck-builder-saved-select");
  if (savedSelect) savedSelect.value = "";
}

function closeDeckBuilderImagePreview() {
  const modal = document.getElementById("deck-builder-image-preview-modal");
  const image = document.getElementById("deck-builder-image-preview");
  if (!modal || !image) {
    return;
  }
  hideWithAnimation(modal);
  modal.setAttribute("aria-hidden", "true");
  // 動畫結束後 src 才會清空（元素隱藏後）
  setTimeout(() => { image.src = ""; image.alt = "卡圖預覽"; }, 200);
}

function clearDeckBuilderRenderedMedia() {
  const cardList = document.getElementById("deck-builder-card-list");
  const deckList = document.getElementById("deck-builder-deck-list");
  const detail = document.getElementById("deck-builder-card-detail");
  [cardList, deckList, detail].forEach((el) => {
    if (!el) {
      return;
    }
    el.querySelectorAll("img").forEach((img) => {
      img.src = "";
    });
    if (el === detail) {
      el.innerHTML = '<div class="deck-builder-detail-empty">請先選擇一張卡片</div>';
    } else {
      el.innerHTML = "";
    }
  });
  runtime.deckBuilderGroupedResults = [];
  runtime.deckBuilderResultKeys = [];
  runtime.deckBuilderCardListScrollTop = 0;
  runtime.deckBuilderDeckListScrollTop = 0;
  clearRetainedImageHandles();
}

function isDeckBuilderImagePreviewOpen() {
  const modal = document.getElementById("deck-builder-image-preview-modal");
  return !!modal && !modal.classList.contains("hidden");
}

function focusDeckBuilderCardByOffset(offset) {
  const host = document.getElementById("deck-builder-card-list");
  const grouped = runtime.deckBuilderGroupedResults || [];
  if (!host || !grouped.length) {
    return;
  }
  const currentIndex = Math.max(0, grouped.findIndex((group) => group.versions.some((card) => card.key === state.deckBuilder.selectedCardKey)));
  const nextIndex = Math.max(0, Math.min(grouped.length - 1, currentIndex + offset));
  const nextCard = grouped[nextIndex] && grouped[nextIndex].selectedCard;
  if (!nextCard || nextCard.key === state.deckBuilder.selectedCardKey) {
    return;
  }
  selectDeckBuilderCatalogCard(nextCard.key);
  const rowHeight = 90;
  const targetTop = Math.max(0, nextIndex * rowHeight - Math.max(0, (host.clientHeight - rowHeight) / 2));
  runtime.deckBuilderCardListScrollTop = targetTop;
  host.scrollTop = targetTop;
  renderDeckBuilderCardList();
  renderDeckBuilderCardDetail();
  renderDeckBuilderDeckList();
}

function focusDeckBuilderDeckEntryByOffset(offset) {
  const host = document.getElementById("deck-builder-deck-list");
  const displayCards = getDeckBuilderDeckDisplayCards();
  if (!host || !displayCards.length) {
    return;
  }
  const currentIndex = Math.max(0, displayCards.findIndex((item) => item.displayKey === runtime.deckBuilderSelectedDeckDisplayKey));
  const step = Math.abs(offset) === 1 ? Math.sign(offset) * 10 : offset;
  const nextIndex = Math.max(0, Math.min(displayCards.length - 1, currentIndex + step));
  const nextEntry = displayCards[nextIndex];
  if (!nextEntry || nextEntry.displayKey === runtime.deckBuilderSelectedDeckDisplayKey) {
    return;
  }
  runtime.deckBuilderKeyboardScope = "deck";
  selectDeckBuilderDeckEntry(nextEntry.entry, nextEntry.displayKey);
  const rowHeight = 118;
  const rowIndex = Math.floor(nextIndex / 10);
  const targetTop = Math.max(0, rowIndex * rowHeight - Math.max(0, (host.clientHeight - rowHeight) / 2));
  runtime.deckBuilderDeckListScrollTop = targetTop;
  host.scrollTop = targetTop;
  renderDeckBuilderCardDetail();
  renderDeckBuilderDeckList();
}

function openDeckBuilderImagePreview(src, alt = "") {
  const modal = document.getElementById("deck-builder-image-preview-modal");
  const image = document.getElementById("deck-builder-image-preview");
  if (!modal || !image || !src) {
    return;
  }
  image.src = src;
  image.alt = alt || "卡圖預覽";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

async function openDeckBuilderModal() {
  const modal = document.getElementById("deck-builder-modal");
  const statusEl = document.getElementById("deck-builder-load-status");
  if (!modal) {
    return;
  }
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  state.deckBuilder.isOpen = true;
  state.deckBuilder.importModalOpen = false;
  state.deckBuilder.importBusy = false;
  state.deckBuilder.importStatus = "尚未開始匯入";
  state.deckBuilder.importPercent = 0;
  state.deckBuilder.selectedDeckEntryKey = "";
  runtime.deckBuilderSelectedDeckDisplayKey = "";
  runtime.deckBuilderKeyboardScope = "catalog";
  if (!runtime.deckBuilderCatalogReady) {
    state.deckBuilder.isLoading = true;
    if (statusEl) {
      statusEl.textContent = "讀取 cards.json 中";
    }
    try {
      await ensureDeckBuilderCatalogLoaded();
      renderDeckBuilderFilters();
      state.deckBuilder.selectedCardKey = "";
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = "讀取卡片資料失敗";
      }
      showToast(error instanceof Error ? error.message : "讀取牌庫資料失敗", "error", 2200);
    } finally {
      state.deckBuilder.isLoading = false;
    }
  }
  if (runtime.deckBuilderCatalogReady) {
    state.deckBuilder.selectedCardKey = "";
  }
  renderDeckBuilderImportModal();
  renderDeckBuilderState();
  // 升級所有原生 <select> 為自訂下拉選單
  upgradeAllSelectsInContainer(modal);
}

function setupDeckBuilder() {
  const toggleBtn = document.getElementById("deck-builder-toggle-btn");
  const closeBtn = document.getElementById("deck-builder-close-btn");
  const modal = document.getElementById("deck-builder-modal");
  const importModal = document.getElementById("deck-builder-import-modal");
  const importCloseBtn = document.getElementById("deck-builder-import-close-btn");
  const importInput = document.getElementById("deck-builder-import-input");
  const importStartBtn = document.getElementById("deck-builder-import-start-btn");
  const imagePreviewModal = document.getElementById("deck-builder-image-preview-modal");
  const searchInput = document.getElementById("deck-builder-search-input");
  const searchClearBtn = document.getElementById("deck-builder-search-clear-btn");
  const seriesFilter = document.getElementById("deck-builder-series-filter");
  const typeFilter = document.getElementById("deck-builder-type-filter");
  const attributeFilter = document.getElementById("deck-builder-attribute-filter");
  const subtypeFilter = document.getElementById("deck-builder-subtype-filter");
  const advancedFilterBtn = document.getElementById("deck-builder-advanced-filter-btn");
  const advancedFilterPopover = document.getElementById("deck-builder-advanced-filter-popover");
  const resetFiltersBtn = document.getElementById("deck-builder-reset-filters-btn");
  const nameInput = document.getElementById("deck-builder-name-input");
  const clearBtn = document.getElementById("deck-builder-clear-btn");
  const loadSavedBtn = document.getElementById("deck-builder-load-saved-btn");
  const importBtn = document.getElementById("deck-builder-import-btn");
  const exportFileBtn = document.getElementById("deck-builder-export-file-btn");
  const saveBtn = document.getElementById("deck-builder-save-btn");
  const cardListHost = document.getElementById("deck-builder-card-list");
  const deckListHost = document.getElementById("deck-builder-deck-list");
  if (!toggleBtn || !modal) {
    return;
  }

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.deckBuilder.isOpen) {
      closeDeckBuilderModal();
      return;
    }
    void openDeckBuilderModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeDeckBuilderModal();
    });
  }
  // 點擊邊緣不關閉，只能透過右上角 X 按鈕關閉
  if (importModal) {
    importModal.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
  }
  if (importCloseBtn) {
    importCloseBtn.addEventListener("click", () => {
      closeDeckBuilderImportModal();
    });
  }
  if (importInput) {
    importInput.addEventListener("input", () => {
      state.deckBuilder.importInput = importInput.value || "";
    });
  }
  if (importStartBtn) {
    importStartBtn.addEventListener("click", () => {
      void importDeckBuilderFromInput();
    });
  }
  document.addEventListener("pointerdown", (event) => {
    if (!state.deckBuilder.isOpen || !state.deckBuilder.advancedFiltersOpen) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest("#deck-builder-advanced-filter-popover") || target.closest("#deck-builder-advanced-filter-btn")) {
      return;
    }
    state.deckBuilder.advancedFiltersOpen = false;
    renderDeckBuilderFilters();
  });
  if (imagePreviewModal) {
    imagePreviewModal.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("#deck-builder-image-preview")) {
        closeDeckBuilderImagePreview();
      }
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.deckBuilder.search = searchInput.value || "";
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      state.deckBuilder.search = "";
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      updateDeckBuilderWindowTitle();
    });
  }
  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      state.deckBuilder.typeFilter = typeFilter.value || "";
      renderDeckBuilderFilters();
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (advancedFilterBtn) {
    advancedFilterBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      state.deckBuilder.advancedFiltersOpen = !state.deckBuilder.advancedFiltersOpen;
      renderDeckBuilderFilters();
    });
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      state.deckBuilder.search = "";
      state.deckBuilder.seriesFilter = "";
      state.deckBuilder.typeFilter = "";
      state.deckBuilder.attributeFilter = "";
      state.deckBuilder.subtypeFilter = "";
      state.deckBuilder.evolutionStageFilter = [];
      state.deckBuilder.retreatCostFilter = [];
      state.deckBuilder.abilitiesFilter = [];
      state.deckBuilder.advancedFiltersOpen = false;
      if (searchInput) {
        searchInput.value = "";
      }
      renderDeckBuilderFilters();
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (seriesFilter) {
    seriesFilter.addEventListener("change", () => {
      state.deckBuilder.seriesFilter = seriesFilter.value || "";
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (attributeFilter) {
    attributeFilter.addEventListener("change", () => {
      state.deckBuilder.attributeFilter = attributeFilter.value || "";
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (subtypeFilter) {
    subtypeFilter.addEventListener("change", () => {
      state.deckBuilder.subtypeFilter = subtypeFilter.value || "";
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (advancedFilterPopover) {
    advancedFilterPopover.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
        return;
      }
      if (target.name === "deck-builder-evolution-filter") {
        toggleDeckBuilderFilterValue("evolutionStageFilter", target.value, target.checked);
      } else if (target.name === "deck-builder-retreat-filter") {
        toggleDeckBuilderFilterValue("retreatCostFilter", target.value, target.checked);
      } else if (target.name === "deck-builder-abilities-filter") {
        toggleDeckBuilderFilterValue("abilitiesFilter", target.value, target.checked);
      } else {
        return;
      }
      const hasAdvancedFilter = state.deckBuilder.evolutionStageFilter.length || state.deckBuilder.retreatCostFilter.length || state.deckBuilder.abilitiesFilter.length;
      if (hasAdvancedFilter) {
        state.deckBuilder.typeFilter = "寶可夢";
      }
      runtime.deckBuilderCardListScrollTop = 0;
      if (cardListHost) {
        cardListHost.scrollTop = 0;
      }
      renderDeckBuilderFilters();
      renderDeckBuilderCardList();
      renderDeckBuilderCardDetail();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearDeckBuilderDeck();
    });
  }
  if (loadSavedBtn) {
    loadSavedBtn.addEventListener("click", () => {
      loadDeckBuilderSavedDeck();
    });
  }
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      openDeckBuilderImportModal();
    });
  }
  if (exportFileBtn) {
    exportFileBtn.addEventListener("click", () => {
      void exportDeckBuilderToFile();
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveDeckBuilderDeck();
    });
  }
  if (cardListHost) {
    let _scrollRafPending = false;
    cardListHost.addEventListener("scroll", () => {
      runtime.deckBuilderCardListScrollTop = cardListHost.scrollTop || 0;
      if (_scrollRafPending) return;
      _scrollRafPending = true;
      requestAnimationFrame(() => {
        _scrollRafPending = false;
        // 全量渲染模式，捲動時不需要重繪
      });
    }, { passive: true });
    cardListHost.addEventListener("pointerdown", () => {
      runtime.deckBuilderKeyboardScope = "catalog";
    });
  }
  if (deckListHost) {
    deckListHost.addEventListener("scroll", () => {
      runtime.deckBuilderDeckListScrollTop = deckListHost.scrollTop || 0;
    });
  }
  document.addEventListener("keydown", (event) => {
    if (!state.deckBuilder.isOpen) {
      return;
    }
    if (event.key === "Escape" && isDeckBuilderImagePreviewOpen()) {
      event.preventDefault();
      closeDeckBuilderImagePreview();
      return;
    }
    const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") {
      return;
    }
    if (isDeckBuilderImagePreviewOpen()) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusDeckBuilderCardByOffset(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusDeckBuilderCardByOffset(-1);
    }
  });
  renderDeckBuilderSavedOptions();
}

async function applyDeckEntriesForOwner(entries, owner, options = {}) {
  const { broadcastImport = false, sourceText = "" } = options;
  setImportPhase(owner, owner === "player1" ? "解析我方卡表" : "解析對手卡表");
  const normalizedEntries = normalizeDeckEntries(entries);
  const total = normalizedEntries.reduce((sum, entry) => sum + entry.count, 0);
  if (total !== 60) {
    throw new Error(`匯入後牌組不是 60 張，目前是 ${total} 張。`);
  }

  if (state.peer.multiplayerEnabled && (owner === "player1" || owner === "opponent")) {
    state.importLock[owner] = false;
  }
  state.importedDeckSourceText[owner] = String(sourceText || "").trim();
  updateAutoSetupButtonUi();
  updateDeckImportAvailability();
  updateOpponentImportSyncView();

  if (broadcastImport) {
    sendPeerAction({
      type: ACTION_TYPES.SYNC_DECK,
      mode: "deck-import",
      owner,
      entries: sanitizeDeckEntriesForSync(normalizedEntries),
      rawText: state.importedDeckSourceText[owner] || ""
    });
  }

  const downloadStartedAt = performance.now();
  const deckId = `live-${owner}-${state.peer.remoteId || "local"}`;
  const cachedEntries = await cacheDeckImagesForOffline(deckId, normalizedEntries, owner);
  setImportMetric(owner, "downloadMs", performance.now() - downloadStartedAt);
  setImportDisplayPercent(owner, 99);
  setImportPhase(owner, owner === "player1" ? "準備卡圖中" : "準備對手卡圖中");
  const remaining = cards.filter((card) => card.owner !== owner);
  const maxId = remaining.reduce((max, card) => Math.max(max, card.id), 0);
  primeDeckImageRefsFromEntries(owner, cachedEntries);
  const rebuilt = buildCardsFromEntries(cachedEntries, owner, maxId + 1);
  state.importedDeckEntries[owner] = stripImageRefsFromEntries(cachedEntries);
  cards.length = 0;
  remaining.forEach((card) => cards.push(card));
  rebuilt.forEach((card) => cards.push(card));
  clearSelections();
  state.latestCardByZone = {};
  state.typeHintByZone["player1-active"] = null;
  state.typeHintByZone["opponent-active"] = null;
  state.prizeCountSnapshot.player1 = null;
  state.prizeCountSnapshot.opponent = null;
  closeOverlay();
  hideDeckMenu();
  hideStatusMenu();
  updatePeerUiVisibility();
  updateOpponentImportSyncView();
  renderBoard();
  const preloadSeq = ++runtime.preloadJobSeqByOwner[owner];
  const decodeStartedAt = performance.now();
  void warmCardImages(rebuilt, owner, preloadSeq).then(() => {
    if (preloadSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return;
    }
    setImportMetric(owner, "cacheMs", performance.now() - decodeStartedAt);
    state.importLock[owner] = true;
    setImportProgress(owner, rebuilt.length, rebuilt.length, false, owner === "player1" ? "我方卡表已就緒" : "對手卡表已就緒");
    setImportDisplayPercent(owner, 100);
    updateAutoSetupButtonUi();
    updateDeckImportAvailability();
    updateOpponentImportSyncView();
    renderBoard();
    checkAndStartBattle();
  }).catch(() => {
    // keep UI responsive even if preload fails
    setImportMetric(owner, "cacheMs", performance.now() - decodeStartedAt);
    state.importLock[owner] = true;
    setImportProgress(owner, rebuilt.length, rebuilt.length, false, owner === "player1" ? "我方卡表已就緒" : "對手卡表已就緒");
    setImportDisplayPercent(owner, 100);
    updateAutoSetupButtonUi();
    updateDeckImportAvailability();
    updateOpponentImportSyncView();
    checkAndStartBattle();
  });
  broadcastDeckSummary(owner);
  checkAndStartBattle();
}

async function preloadImageWithFallback(card) {
  const refs = getImageSourcesForCard(card);
  const urlChain = [refs.primary, refs.secondary];
  for (const url of urlChain) {
    if (!url) {
      continue;
    }
    if (state.imageCache.get(url) === true) {
      return url;
    }
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "sync";
        img.loading = "eager";
        img.onload = async () => {
          try {
            if (typeof img.decode === "function") {
              await img.decode();
            }
          } catch {
            // decode fallback: keep success path if bytes are already loaded
          }
          retainDecodedImageHandle(url, img);
          resolve();
        };
        img.onerror = () => reject(new Error("load-failed"));
        img.src = url;
      });
      setImageCacheStatus(url, true);
      return url;
    } catch {
      setImageCacheStatus(url, false);
    }
  }
  if (!refs.placeholder) {
    refs.placeholder = createPlaceholderDataUrl(card);
  }
  return refs.placeholder;
}

async function preloadImages(cardList, jobSeq = runtime.preloadJobSeqByOwner[owner], owner = "player1") {
  const list = cardList.filter(Boolean);
  const targetsByKey = new Map();
  list.forEach((card) => {
    const refs = getImageSourcesForCard(card);
    const key = [refs.primary || "", refs.secondary || "", getPlaceholderCacheKey(card)].join("|");
    if (!targetsByKey.has(key)) {
      targetsByKey.set(key, { sample: card, cards: [] });
    }
    targetsByKey.get(key).cards.push(card);
  });
  const targets = [...targetsByKey.values()];
  let done = 0;
  const concurrency = Math.min(10, Math.max(4, Math.ceil(targets.length / 10) || 4));
  updateImageProgress(0, targets.length, owner);
  let cursor = 0;

  const processTarget = async (target) => {
    if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return false;
    }
    while (runtime.imagePreloadPaused) {
      if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
        return false;
      }
      await delayMs(50);
    }
    const resolved = await preloadImageWithFallback(target.sample);
    if (jobSeq !== runtime.preloadJobSeqByOwner[owner]) {
      return false;
    }
    target.cards.forEach((card) => {
      if (!card.imageRefs) {
        card.imageRefs = { primary: "", secondary: "", placeholder: "" };
      }
      if (resolved === card.imageRefs.primary) {
        card.imageRefs.resolved = "primary";
        card.imageRefs.activeUrl = card.imageRefs.primary;
      } else if (resolved === card.imageRefs.secondary) {
        card.imageRefs.resolved = "secondary";
        card.imageRefs.activeUrl = card.imageRefs.secondary;
      } else {
        card.imageRefs.placeholder = resolved;
        card.imageRefs.resolved = "placeholder";
        card.imageRefs.activeUrl = card.imageRefs.placeholder;
      }
      syncDeckImageRefsFromCard(card);
    });
    done += 1;
    updateImageProgress(done, targets.length, owner);
    if (done % 2 === 0) {
      await delayMs(0);
    }
    return true;
  };

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < targets.length) {
      const currentIndex = cursor;
      cursor += 1;
      const ok = await processTarget(targets[currentIndex]);
      if (!ok) {
        return false;
      }
    }
    return true;
  });

  const results = await Promise.all(workers);
  if (results.some((ok) => !ok)) {
    return false;
  }
  return true;
}

async function importDeckFromInput(rawText) {
  return importDeckForOwner(rawText, "player1");
}

async function importDeckForOwner(rawText, owner) {
  resetImportMetrics(owner);
  setImportProgress(owner, 0, 0, true, owner === "player1" ? "準備解析我方卡表" : "準備解析對手卡表");
  const parseStartedAt = performance.now();
  const entries = await parseDeckInputToEntriesCached(rawText, owner);
  setImportMetric(owner, "parseMs", performance.now() - parseStartedAt);
  await applyDeckEntriesForOwner(entries, owner, {
    broadcastImport: state.peer.multiplayerEnabled && owner === "player1",
    sourceText: rawText
  });
}

async function syncRemoteDeckImport(owner, rawText, fallbackEntries = null) {
  const sourceText = String(rawText || "").trim();
  const fallbackSignature = Array.isArray(fallbackEntries) ? JSON.stringify(fallbackEntries) : "";
  const signature = sourceText || fallbackSignature;
  if (
    signature &&
    runtime.remoteImportSignatureByOwner[owner] === signature &&
    (state.importProgress[owner]?.active || state.importLock[owner])
  ) {
    return true;
  }
  const token = Date.now() + Math.random();
  runtime.remoteImportTokenByOwner[owner] = token;
  runtime.remoteImportSignatureByOwner[owner] = signature;
  state.importedDeckSourceText[owner] = sourceText;
  resetImportMetrics(owner);
  if (owner === "player1" || owner === "opponent") {
    state.importLock[owner] = false;
    setImportProgress(owner, 0, 0, true, owner === "player1" ? "同步我方卡表中" : "收到對手卡表");
    updateAutoSetupButtonUi();
    updateDeckImportAvailability();
    updateOpponentImportSyncView();
  }
  if (sourceText) {
    try {
      setImportPhase(owner, owner === "player1" ? "解析同步卡表中" : "解析對手卡表中");
      const parseStartedAt = performance.now();
      const parsedEntries = await parseDeckInputToEntriesCached(sourceText, owner);
      setImportMetric(owner, "parseMs", performance.now() - parseStartedAt);
      if (runtime.remoteImportTokenByOwner[owner] !== token) {
        return false;
      }
      // 將 fallbackEntries 中的 cardId 補充到解析結果（按 series+number 匹配）
      if (Array.isArray(fallbackEntries) && fallbackEntries.length > 0) {
        const cidMap = new Map();
        fallbackEntries.forEach((fe) => {
          if (fe.cardId) {
            const k = `${normalizeSeries(fe.series || "")}|${normalizeCardNumber(fe.number || "")}`.toLowerCase();
            if (!cidMap.has(k)) cidMap.set(k, Number(fe.cardId) || 0);
          }
        });
        if (cidMap.size > 0) {
          parsedEntries.forEach((pe) => {
            if (!pe.cardId) {
              const k = `${normalizeSeries(pe.series || "")}|${normalizeCardNumber(pe.number || "")}`.toLowerCase();
              const cid = cidMap.get(k);
              if (cid) pe.cardId = cid;
            }
          });
        }
      }
      await applyDeckEntriesForOwner(parsedEntries, owner, {
        broadcastImport: false,
        sourceText
      });
      return true;
    } catch {
      // fallback to synced entries below
    }
  }
  if (Array.isArray(fallbackEntries) && fallbackEntries.length > 0) {
    setImportPhase(owner, owner === "player1" ? "套用同步卡表中" : "套用對手卡表中");
    if (runtime.remoteImportTokenByOwner[owner] !== token) {
      return false;
    }
    await applyDeckEntriesForOwner(fallbackEntries, owner, {
      broadcastImport: false,
      sourceText
    });
    return true;
  }
  setImportProgress(owner, 0, 0, false, owner === "player1" ? "" : "等待對手匯入");
  return false;
}

function getPreviewAnchorElementsByOwner(owner) {
  if (owner === "player1") {
    return [document.getElementById("player1-prize")].filter(Boolean);
  }
  if (owner === "opponent") {
    return [document.getElementById("opponent-prize")].filter(Boolean);
  }
  return [];
}

function getElementsUnionRect(elements) {
  if (!elements || elements.length === 0) {
    return null;
  }

  const rects = elements
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect && rect.width > 0 && rect.height > 0);

  if (rects.length === 0) {
    return null;
  }

  return {
    left: Math.min(...rects.map((rect) => rect.left)),
    top: Math.min(...rects.map((rect) => rect.top)),
    right: Math.max(...rects.map((rect) => rect.right)),
    bottom: Math.max(...rects.map((rect) => rect.bottom))
  };
}

function positionCardZoom(zoom, pointer = null, card = null) {
  if (!zoom) {
    return;
  }
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const rect = zoom.getBoundingClientRect();
  const pad = 16;
  const anchorRect = card ? getElementsUnionRect(getPreviewAnchorElementsByOwner(card.owner)) : null;
  const boardRect = getElementsUnionRect([document.querySelector(".board")].filter(Boolean));

  if (anchorRect) {
    const anchorWidth = Math.max(0, anchorRect.right - anchorRect.left);
    const left = Math.max(
      pad,
      Math.min(anchorRect.left + (anchorWidth - rect.width) / 2, vw - rect.width - pad)
    );
    const sharedTop = boardRect ? boardRect.top + 18 : pad;
    const top = Math.max(
      pad,
      Math.min(sharedTop - rect.height - 14, vh - rect.height - pad)
    );

    zoom.style.left = `${left}px`;
    zoom.style.top = `${top}px`;
    zoom.style.right = "auto";
    return;
  }

  const anchorX = pointer && Number.isFinite(pointer.x) ? pointer.x : vw - rect.width - pad;
  const anchorY = pointer && Number.isFinite(pointer.y) ? pointer.y : pad;

  let left;
  if (anchorX > vw / 2) {
    left = Math.max(pad, anchorX - rect.width - 18);
  } else {
    left = Math.min(vw - rect.width - pad, anchorX + 18);
  }
  let top = Math.max(pad, Math.min(anchorY - rect.height / 2, vh - rect.height - pad));

  if (!state.overlay.isOpen && !pointer) {
    left = vw - rect.width - pad;
    top = pad;
  }

  zoom.style.left = `${left}px`;
  zoom.style.top = `${top}px`;
  zoom.style.right = "auto";
}

function showCardZoom(card, pointer = null) {
  if (state.draggingCardIds.length > 0) {
    return;
  }
  const zoom = document.getElementById("card-zoom");
  const zoomImg = document.getElementById("card-zoom-image");
  if (!zoom || !zoomImg) {
    return;
  }
  zoom.classList.remove("hidden");
  zoom.setAttribute("aria-hidden", "false");
  const refs = getImageSourcesForCard(card);
  zoomImg.dataset.fallbackStage = "primary";
  zoomImg.onerror = () => {
    const current = zoomImg.currentSrc || zoomImg.src;
    if (current) {
      setImageCacheStatus(current, false);
    }
    if (zoomImg.dataset.fallbackStage === "primary" && refs.secondary) {
      zoomImg.dataset.fallbackStage = "secondary";
      zoomImg.src = refs.secondary;
      return;
    }
    if (!refs.placeholder) {
      refs.placeholder = createPlaceholderDataUrl(card);
    }
    zoomImg.dataset.fallbackStage = "placeholder";
    zoomImg.src = refs.placeholder;
  };
  zoomImg.onload = () => {
    const current = zoomImg.currentSrc || zoomImg.src;
    if (current) {
      refs.activeUrl = current;
      setImageCacheStatus(current, true);
    }
    positionCardZoom(zoom, pointer, card);
  };
  zoomImg.src = resolvePreferredImageUrl(card);
  zoom.classList.toggle("overlay-preview", !!state.overlay.isOpen);
  positionCardZoom(zoom, pointer, card);
}

function hideCardZoom() {
  const zoom = document.getElementById("card-zoom");
  if (!zoom) {
    return;
  }
  zoom.classList.remove("overlay-preview");
  zoom.style.left = "";
  zoom.style.top = "";
  zoom.style.right = "";
  zoom.classList.add("hidden");
  zoom.setAttribute("aria-hidden", "true");
  const zoomImg = document.getElementById("card-zoom-image");
  if (zoomImg) {
    zoomImg.onload = null;
    zoomImg.onerror = null;
    zoomImg.removeAttribute("src");
  }
  state.hoveredCardId = null;
}

function setupImageImportActions() {
  const importPlayerBtn = document.getElementById("deck-import-btn-player1");
  const importOpponentBtn = document.getElementById("deck-import-btn-opponent");
  const saveDeckBtn = document.getElementById("save-deck-named-btn");
  const inputPlayer = document.getElementById("deck-import-input-player1");
  const inputOpponent = document.getElementById("deck-import-input-opponent");
  if (saveDeckBtn) {
    saveDeckBtn.disabled = true;
  }
  if (importPlayerBtn && inputPlayer) {
    importPlayerBtn.addEventListener("click", async () => {
      try {
        const entries = await parseDeckInputToEntries(inputPlayer.value, "player1");
        await applyDeckEntriesForOwner(entries, "player1", {
          broadcastImport: state.peer.multiplayerEnabled,
          sourceText: inputPlayer.value
        });
        runtime.pendingDeckSave = {
          owner: "player1",
          rawText: inputPlayer.value,
          entries: normalizeDeckEntries(entries),
          coverImageUrl: getDeckCoverImageFromEntries(entries)
        };
        if (saveDeckBtn) {
          saveDeckBtn.classList.remove("hidden");
          saveDeckBtn.disabled = false;
        }
        updateDeckImportAvailability();
      } catch (error) {
        if (saveDeckBtn) {
          saveDeckBtn.classList.add("hidden");
          saveDeckBtn.disabled = true;
        }
        showToast(error instanceof Error ? error.message : String(error), "error", 3000);
      }
    });
  }
  if (importOpponentBtn && inputOpponent) {
    importOpponentBtn.addEventListener("click", async () => {
      try {
        const entries = await parseDeckInputToEntries(inputOpponent.value, "opponent");
        await applyDeckEntriesForOwner(entries, "opponent", {
          broadcastImport: false,
          sourceText: inputOpponent.value
        });
        runtime.pendingDeckSave = {
          owner: "opponent",
          rawText: inputOpponent.value,
          entries: normalizeDeckEntries(entries),
          coverImageUrl: getDeckCoverImageFromEntries(entries)
        };
        if (saveDeckBtn) {
          saveDeckBtn.classList.remove("hidden");
          saveDeckBtn.disabled = false;
        }
        updateDeckImportAvailability();
      } catch (error) {
        if (saveDeckBtn) {
          saveDeckBtn.classList.add("hidden");
          saveDeckBtn.disabled = true;
        }
        showToast(error instanceof Error ? error.message : String(error), "error", 3000);
      }
    });
  }
  if (saveDeckBtn) {
    saveDeckBtn.addEventListener("click", () => {
      openDeckSaveModal();
    });
  }

  const modal = document.getElementById("deck-save-modal");
  const close = document.getElementById("deck-save-modal-close");
  const confirmBtn = document.getElementById("deck-save-confirm-btn");
  const input = document.getElementById("deck-save-name-input");
  const renameModal = document.getElementById("deck-rename-modal");
  const renameClose = document.getElementById("deck-rename-modal-close");
  const renameConfirmBtn = document.getElementById("deck-rename-confirm-btn");
  const renameInput = document.getElementById("deck-rename-name-input");
  if (close && modal) {
    close.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      setImagePreloadPaused(false);
    });
  }
  if (input) {
    input.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    input.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      void savePendingDeckToLocal();
    });
  }
  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void savePendingDeckToLocal();
      }
    });
  }
  if (renameClose && renameModal) {
    renameClose.addEventListener("click", () => {
      closeDeckRenameModal();
    });
  }
  if (renameInput) {
    renameInput.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    renameInput.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    renameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        confirmDeckRename();
      }
    });
  }
  if (renameConfirmBtn) {
    renameConfirmBtn.addEventListener("click", () => {
      confirmDeckRename();
    });
  }
}

function setupDeckImportPanel() {
  const toggleBtn = document.getElementById("deck-import-toggle-btn");
  const panel = document.getElementById("deck-import-panel");
  const closeBtn = document.getElementById("deck-import-close-btn");
  if (!toggleBtn || !panel) {
    return;
  }

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!state.singlePlayer) {
      return;
    }
    const willOpen = panel.classList.contains("hidden");
    if (willOpen) {
      panel.classList.remove("hidden");
      _animateOpen(panel, null, "panel");
      setImportProgress("player1", 0, 0, false);
      setImportProgress("opponent", 0, 0, false);
      updateOpponentImportSyncView();
    } else {
      hideWithAnimation(panel);
    }
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!state.singlePlayer) {
        return;
      }
      hideWithAnimation(panel);
    });
  }

  document.addEventListener("click", (event) => {
    if (panel.classList.contains("hidden")) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (
      target.closest("#deck-import-panel") ||
      target.closest("#deck-import-toggle-btn") ||
      target.closest("#deck-save-modal") ||
      target.closest("#deck-rename-modal")
    ) {
      return;
    }
    if (!state.singlePlayer) {
      return;
    }
    hideWithAnimation(panel);
  });
}

function updateAutoSetupButtonUi() {
  const btn = document.getElementById("auto-setup-btn");
  const newMatchBtn = document.getElementById("new-match-btn");
  const singlePlayerLocked = state.singlePlayer
    && (
      !Array.isArray(state.importedDeckEntries.player1) || state.importedDeckEntries.player1.length === 0
      || !Array.isArray(state.importedDeckEntries.opponent) || state.importedDeckEntries.opponent.length === 0
      || !isOwnerImportFullyReady("player1")
      || !isOwnerImportFullyReady("opponent")
      || state.gamePhase === "遊戲中"
    );
  const multiplayerLocked = !state.singlePlayer
    && (!isOwnerImportFullyReady("player1") || !isOwnerImportFullyReady("opponent") || state.gamePhase === "\u904a\u6232\u4e2d");
  const startLocked = runtime.autoSetupRunning || (state.singlePlayer ? singlePlayerLocked : multiplayerLocked);
  if (!btn) {
    if (newMatchBtn) {
      newMatchBtn.classList.remove("hidden");
      newMatchBtn.disabled = startLocked;
      newMatchBtn.classList.toggle("ready-on", !state.singlePlayer && !!state.ready.local);
    }
    return;
  }
  btn.classList.remove("hidden");
  btn.textContent = state.singlePlayer ? "\u904a\u6232\u958b\u59cb" : "\u6e96\u5099\u5b8c\u6210";
  btn.disabled = startLocked;
  btn.classList.toggle("ready-on", !state.singlePlayer && !!state.ready.local);
  if (newMatchBtn) {
    newMatchBtn.classList.remove("hidden");
    newMatchBtn.disabled = startLocked;
    newMatchBtn.classList.toggle("ready-on", !state.singlePlayer && !!state.ready.local);
  }
}

function destroyPeerRuntime() {
  clearPeerRetryTimer();
  runtime.peerConnectPending = false;
  runtime.suppressPeerClosePrompt = true;
  if (state.peer.conn) {
    try {
      state.peer.conn.close();
    } catch {}
  }
  if (state.peer.peer) {
    try {
      state.peer.peer.destroy();
    } catch {}
  }
  state.peer.id = "";
  state.peer.remoteId = "";
  state.peer.isHost = false;
  state.peer.peer = null;
  state.peer.conn = null;
  state.peer.connected = false;
  state.ready.remote = false;
  state.rematch.remote = false;
  state.handReveal.player1 = false;
  state.handReveal.opponent = false;
  state.importLock.player1 = false;
  state.importLock.opponent = false;
  state.chat.isOpen = false;
  state.chat.hasUnread = false;
  state.chat.messages = [];
  closeChatModal();
  updatePeerIdUi("已停用");
  updatePeerConnectionUi(false);
  setTimeout(() => {
    runtime.suppressPeerClosePrompt = false;
  }, 800);
}

function clearPeerSessionStateKeepIdentityBase() {
  clearPeerRetryTimer();
  runtime.peerConnectPending = false;
  runtime.suppressPeerClosePrompt = true;
  if (state.peer.conn) {
    try {
      state.peer.conn.close();
    } catch {}
  }
  state.peer.remoteId = "";
  state.peer.isHost = false;
  state.peer.conn = null;
  state.peer.connected = false;
  state.ready.remote = false;
  state.rematch.remote = false;
  state.handReveal.player1 = false;
  state.handReveal.opponent = false;
  state.chat.isOpen = false;
  state.chat.hasUnread = false;
  state.chat.messages = [];
  closeChatModal();
  updatePeerConnectionUi(false);
  setTimeout(() => {
    runtime.suppressPeerClosePrompt = false;
  }, 800);
}

function disconnectPeerSessionKeepIdentity() {
  if (!state.peer.peer || !state.peer.id) {
    clearPeerSessionStateKeepIdentityBase();
    updatePeerIdUi("");
    return;
  }
  clearPeerSessionStateKeepIdentityBase();
  updatePeerIdUi(state.peer.id);
}

function updatePeerUiVisibility() {
  const hud = document.getElementById("p2p-hud");
  const chatBtn = document.getElementById("chat-toggle-btn");
  const handBtn = document.getElementById("hand-visibility-toggle-btn");
  const importToggleBtn = document.getElementById("deck-import-toggle-btn");
  const importCloseBtn = document.getElementById("deck-import-close-btn");
  const localImportBusy = !!state.importProgress.player1.active;
  if (hud) {
    hud.classList.toggle("hidden", state.singlePlayer || !state.peer.multiplayerEnabled);
  }
  if (chatBtn) {
    chatBtn.classList.toggle("hidden", state.singlePlayer || !state.peer.multiplayerEnabled);
  }
  if (handBtn) {
    handBtn.classList.toggle("hidden", state.singlePlayer || !state.peer.multiplayerEnabled);
  }
  if (importToggleBtn) {
    importToggleBtn.disabled = !state.singlePlayer && (!!state.importLock.player1 || localImportBusy);
  }
  if (importCloseBtn) {
    importCloseBtn.classList.toggle("hidden", !state.singlePlayer);
  }
  updateHandVisibilityButtonUi();
  updateChatUnreadUi();
  updateDeckImportAvailability();
}

function updateDeckImportAvailability() {
  const toggleBtn = document.getElementById("deck-import-toggle-btn");
  const importPlayerBtn = document.getElementById("deck-import-btn-player1");
  const localImportBusy = !!state.importProgress.player1.active;
  if (toggleBtn) {
    toggleBtn.disabled = !state.singlePlayer && (!!state.importLock.player1 || localImportBusy);
  }
  if (importPlayerBtn) {
    importPlayerBtn.disabled = (!state.singlePlayer && !!state.importLock.player1) || localImportBusy;
  }
  updateImportStatusTexts();
  updateOpponentImportSyncView();
}

function updateImportStatusTexts() {
  const playerStatus = document.getElementById("player1-import-status");
  if (playerStatus) {
    const text = getImportPhaseLabel("player1");
    const metrics = formatImportMetrics("player1");
    playerStatus.textContent = text ? (metrics ? `${text}｜${metrics}` : text) : " ";
    playerStatus.classList.toggle("status-placeholder", !text);
  }

  const opponentStatus = document.getElementById("opponent-import-status");
  if (opponentStatus) {
    const text = getImportPhaseLabel("opponent");
    const metrics = formatImportMetrics("opponent");
    opponentStatus.textContent = text ? (metrics ? `${text}｜${metrics}` : text) : " ";
    opponentStatus.classList.toggle("status-placeholder", !text);
  }
}

function getDeckEntriesAsText(entries) {
  return normalizeDeckEntries(entries)
    .map((entry) => `${entry.count} ${entry.name} ${entry.series} ${entry.number}`)
    .join("\n");
}

function updateOpponentImportSyncView() {
  const block = document.getElementById("opponent-import-block");
  const title = document.getElementById("opponent-import-title");
  const input = document.getElementById("deck-import-input-opponent");
  const button = document.getElementById("deck-import-btn-opponent");
  const status = document.getElementById("opponent-import-status");
  if (!block || !title || !input || !button || !status) {
    return;
  }

  const remoteEntries = state.importedDeckEntries.opponent;
  if (state.singlePlayer) {
    block.classList.remove("sync-preview-mode");
    title.textContent = "對手卡表";
    input.readOnly = false;
    input.disabled = false;
    input.classList.remove("hidden", "sync-placeholder");
    input.placeholder = "貼上對手卡表";
    button.classList.remove("hidden", "status-placeholder");
    status.classList.remove("hidden");
    status.classList.remove("status-placeholder");
    updateImportStatusTexts();
    return;
  }

  block.classList.remove("hidden");
  block.classList.add("sync-preview-mode");
  title.textContent = "對手卡表";
  input.readOnly = true;
  input.disabled = true;
  input.classList.remove("hidden");
  input.classList.add("sync-placeholder");
  input.value = "";
  button.classList.remove("hidden");
  button.classList.add("status-placeholder");
  status.classList.remove("hidden");
  status.classList.remove("status-placeholder");
  updateImportStatusTexts();
}

function updateHandVisibilityButtonUi() {
  const btn = document.getElementById("hand-visibility-toggle-btn");
  if (!btn) {
    return;
  }
  const owner = state.currentViewer || "player1";
  const enabled = !!state.handReveal[owner];
  btn.classList.toggle("hand-visible", enabled);
}

function updateChatUnreadUi() {
  const badge = document.getElementById("chat-unread-badge");
  if (!badge) {
    return;
  }
  badge.classList.toggle("hidden", state.singlePlayer || state.chat.isOpen || !state.chat.hasUnread);
}

function updatePeerConnectionUi(connected) {
  const lightIds = ["peer-conn-light", "peer-conn-light-hud"];
  const textIds = ["peer-conn-text", "peer-conn-text-hud"];
  const multiBtn = document.getElementById("mode-multi-btn");
  lightIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.classList.toggle("on", !!connected);
    el.classList.toggle("off", !connected);
  });
  textIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = connected ? "連線中" : "未連線";
    }
  });
  const hud = document.getElementById("p2p-hud");
  if (hud) {
    hud.classList.toggle("connected-minimal", !!connected);
  }
  if (multiBtn) {
    multiBtn.disabled = !connected;
  }
  updatePeerUiVisibility();
}

function updatePeerIdUi(peerId) {
  ["peer-id-text", "peer-id-text-hud"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = peerId || "未取得";
    }
  });
}

function copyMyPeerId() {
  const myId = state.peer.id;
  if (!myId) {
    showToast("ID 尚未建立完成，系統會自動重試。", "warn", 2200);
    schedulePeerRetry();
    return;
  }
  navigator.clipboard.writeText(myId).then(() => {
    showToast("已複製我的 ID", "success", 1600);
  }).catch(() => {
    showToast("複製失敗，請手動複製 ID。", "error", 2400);
  });
}

function getFriendlyPeerErrorMessage(err) {
  const type = err && err.type ? String(err.type) : "";
  switch (type) {
    case "browser-incompatible":
      return "瀏覽器不支援 Peer 連線";
    case "network":
      return "網路不穩或無法連到 PeerJS 官方伺服器";
    case "peer-unavailable":
      return "找不到對方 ID，請確認輸入是否正確";
    case "unavailable-id":
      return "此 ID 已被使用，系統將自動重新取得";
    case "server-error":
      return "PeerJS 官方伺服器暫時不可用";
    case "socket-error":
      return "連線通道建立失敗，請檢查網路環境";
    default:
      return type ? `連線錯誤: ${type}` : "Peer 連線錯誤";
  }
}

function formatPeerErrorDetails(err) {
  if (!err) {
    return "unknown-error";
  }
  const type = err.type ? String(err.type) : "";
  const message = err.message ? String(err.message) : "";
  if (type && message) {
    return `${type} / ${message}`;
  }
  return type || message || "unknown-error";
}

function connectToPeerId(remotePeerId) {
  const id = String(remotePeerId || "").trim();
  if (!id) {
    showToast("請先輸入對方 ID", "warn", 1800);
    return;
  }
  if (!state.peer.peer) {
    showToast("本機 ID 尚未建立完成，系統會自動重試。", "warn", 2200);
    schedulePeerRetry();
    return;
  }
  if (id === state.peer.id) {
    showToast("不可連線到自己的 ID", "warn", 2200);
    return;
  }
  if (state.peer.conn && state.peer.connected) {
    if (state.peer.remoteId === id) {
      return;
    }
    try { state.peer.conn.close(); } catch {}
  }
  const conn = state.peer.peer.connect(id, { reliable: true });
  setupPeerConnection(conn, { isHost: false });
}

function updateReadyUi() {
  const btn = document.getElementById("ready-toggle-btn");
  const rematchBtn = document.getElementById("rematch-toggle-btn");
  const autoBtn = document.getElementById("auto-setup-btn");
  const newMatchBtn = document.getElementById("new-match-btn");
  if (!btn) {
    return;
  }
  btn.textContent = "\u6e96\u5099\u597d\u4e86";
  btn.classList.toggle("hidden", state.singlePlayer);
  btn.classList.toggle("ready-on", !!state.ready.local);
  btn.disabled = state.singlePlayer || state.gamePhase === "\u904a\u6232\u4e2d";
  if (autoBtn) {
    autoBtn.classList.toggle("ready-on", !state.singlePlayer && !!state.ready.local);
  }
  if (newMatchBtn) {
    newMatchBtn.classList.toggle("ready-on", !state.singlePlayer && !!state.ready.local);
  }
  if (rematchBtn) {
    rematchBtn.textContent = "\u518d\u4f86\u4e00\u5c40";
    rematchBtn.classList.toggle("rematch-on", !!state.rematch.local);
    rematchBtn.disabled = state.singlePlayer
      ? runtime.autoSetupRunning || !runtime.singleRematchUnlocked
      : false;
  }
}

function updateGamePhaseUi() {
  const el = document.getElementById("game-phase-indicator");
  if (!el) {
    return;
  }
  el.textContent = `遊戲階段：${state.gamePhase}`;
}

function setGamePhase(phaseText) {
  state.gamePhase = phaseText;
  updateGamePhaseUi();
  updateReadyUi();
}

function openMatchModeGate() {
  const gate = document.getElementById("mode-gate");
  if (!gate) {
    return;
  }
  if (runtime.modeGateCloseTimer) {
    clearTimeout(runtime.modeGateCloseTimer);
    runtime.modeGateCloseTimer = null;
  }
  gate.classList.remove("hidden");
  gate.classList.remove("closing");
  gate.setAttribute("aria-hidden", "false");
}

function closeMatchModeGate() {
  const gate = document.getElementById("mode-gate");
  if (!gate) {
    return;
  }
  if (runtime.modeGateCloseTimer) {
    clearTimeout(runtime.modeGateCloseTimer);
    runtime.modeGateCloseTimer = null;
  }
  gate.classList.add("closing");
  runtime.modeGateCloseTimer = setTimeout(() => {
    gate.classList.add("hidden");
    gate.classList.remove("closing");
    gate.setAttribute("aria-hidden", "true");
    runtime.modeGateCloseTimer = null;
  }, 220);
}

function showBattleStartBanner(text = "對戰開始") {
  const banner = document.getElementById("battle-start-banner");
  if (!banner) {
    return;
  }
  banner.textContent = text;
  banner.classList.remove("hidden");
  banner.classList.remove("showing");
  void banner.offsetWidth;
  banner.classList.add("showing");
  banner.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    banner.classList.remove("showing");
    banner.classList.add("hidden");
    banner.setAttribute("aria-hidden", "true");
  }, 1650);
}

function clearReadyStateAndUi() {
  state.ready.local = false;
  state.ready.remote = false;
  updateReadyUi();
}

function clearRematchStateAndUi() {
  state.rematch.local = false;
  state.rematch.remote = false;
  updateReadyUi();
}

function clearSessionCaches(options = {}) {
  const {
    preserveImageCaches = true,
    pruneImageCaches = false
  } = options;

  runtime.preloadJobSeqByOwner.player1 += 1;
  runtime.preloadJobSeqByOwner.opponent += 1;
  runtime.cacheTaskByOwner.player1 = "";
  runtime.cacheTaskByOwner.opponent = "";
  runtime.imagePreloadPaused = false;
  runtime.deckActionInProgress = false;
  runtime.gameLogs = [];
  runtime.renderQueued = false;
  runtime.renderQueuedOptions = null;

  state.pendingAnimations.length = 0;
  state.latestCardByZone = {};
  state.zoneDamage = {};
  state.handReveal.player1 = false;
  state.handReveal.opponent = false;
  state.damageShakeIds.clear();
  state.selectedCardIds.clear();
  state.overlay.scrollTop = 0;
  state.overlay.scrollLeft = 0;
  state.draggingCardIds = [];
  state.hoveredCardId = null;
  state.zoomPinned = false;
  state.chat.isOpen = false;
  state.chat.hasUnread = false;
  state.chat.messages = [];
  state.coin.busy = false;
  state.coin.result = "";

  if (runtime.coinTossAnimation) {
    runtime.coinTossAnimation.cancel();
    runtime.coinTossAnimation = null;
  }
  if (runtime.coinSettleTicker) {
    clearInterval(runtime.coinSettleTicker);
    runtime.coinSettleTicker = null;
  }

  cleanupDragPreview();
  hideCardZoom();
  closeChatModal();
  updateCoinTossUi();
  logRendererDiagnostic("clear-session-caches", {
    preserveImageCaches,
    pruneImageCaches
  });
  clearRetainedImageHandles();

  if (!preserveImageCaches) {
    if (pruneImageCaches) {
      pruneImageCachesToImportedDecks();
    } else {
      state.imageCache.clear();
      state.placeholderCache.clear();
    }
  }
}

function normalizeCardForReset(card, owner, syncId, id) {
  card.owner = owner;
  card.syncId = syncId;
  card.id = id;
  card.zoneId = getOwnerDeckZone(owner);
  card.isFaceUp = false;
  card.poison = false;
  card.burn = false;
  card.behaviorStatus = "";
  card.rotationDeg = 0;
  card.elementType = card.elementType || inferElementTypeByText(card.name);
  return card;
}

function resetImportedDeckState() {
  runtime.pendingDeckSave = null;
  runtime.pendingDeckRenameId = "";
  runtime.singleRematchUnlocked = false;
  state.importedDeckEntries.player1 = null;
  state.importedDeckEntries.opponent = null;
  state.importedDeckSourceText.player1 = "";
  state.importedDeckSourceText.opponent = "";
  runtime.remoteImportTokenByOwner.player1 = 0;
  runtime.remoteImportTokenByOwner.opponent = 0;
  runtime.remoteImportSignatureByOwner.player1 = "";
  runtime.remoteImportSignatureByOwner.opponent = "";
  runtime.deckParseCache.clear();
  clearDeckImageRefs();
  state.importLock.player1 = false;
  state.importLock.opponent = false;
  setImportProgress("player1", 0, 0, false, "");
  setImportProgress("opponent", 0, 0, false, "");
}

async function resetSessionState(mode = "initial", options = {}) {
  const {
    preservePeerIdentity = false,
    preservePeerConnection = false,
    openModeGate = false,
    openImportPanel = false,
    clearImportedDecks = true
  } = options;

  state.singlePlayer = mode !== "multi";
  state.peer.multiplayerEnabled = mode === "multi";
  if (clearImportedDecks) {
    resetImportedDeckState();
  }
  state.greatVoid.player1 = false;
  state.greatVoid.opponent = false;
  clearReadyStateAndUi();
  clearRematchStateAndUi();
  setGamePhase("準備中");
  clearSessionCaches({ preserveImageCaches: false, pruneImageCaches: false });
  if (preservePeerConnection) {
    state.peer.multiplayerEnabled = mode === "multi";
  } else if (preservePeerIdentity) {
    disconnectPeerSessionKeepIdentity();
  } else {
    destroyPeerRuntime();
  }
  seedDemoState();
  renderBoard();
  updateAutoSetupButtonUi();
  updatePeerConnectionUi(preservePeerConnection ? !!state.peer.connected : false);
  updatePeerUiVisibility();
  updateOpponentImportSyncView();
  renderDeckLibraryList();
  const panel = document.getElementById("deck-import-panel");
  if (panel) {
    if (openImportPanel) {
      // 延遲顯示，等模式選擇視窗的關閉動畫播完
      setTimeout(() => {
        panel.classList.remove("hidden");
        _animateOpen(panel, null, "panel");
      }, 280);
    } else {
      panel.classList.add("hidden");
    }
  }
  if (openModeGate) {
    openMatchModeGate();
  }
}

async function hardResetToInitialState({ openModeGate = false, preservePeerIdentity = false } = {}) {
  await resetSessionState("initial", {
    openModeGate,
    preservePeerIdentity,
    openImportPanel: false,
    clearImportedDecks: true
  });
}

async function resetBoardToImportedStage(options = {}) {
  const {
    preserveImageCaches = true,
    pruneImageCaches = false
  } = options;
  const owners = ["player1", "opponent"];
  const rebuilt = [];
  let nextId = 1;

  clearSessionCaches({ preserveImageCaches, pruneImageCaches });

  owners.forEach((owner) => {
    const entries = state.importedDeckEntries[owner];
    if (Array.isArray(entries) && entries.length > 0) {
      const fresh = buildCardsFromEntries(entries, owner, nextId);
      fresh.forEach((card, idx) => {
        normalizeCardForReset(card, owner, idx + 1, nextId + idx);
      });
      rebuilt.push(...fresh);
      nextId += fresh.length;
      return;
    }

    const fallback = cards.filter((c) => c.owner === owner);
    fallback.forEach((card, idx) => {
      rebuilt.push(normalizeCardForReset(card, owner, idx + 1, nextId));
      nextId += 1;
    });
  });

  cards.length = 0;
  rebuilt.forEach((c) => cards.push(c));
  state.latestCardByZone = {};
  state.typeHintByZone["player1-active"] = null;
  state.typeHintByZone["opponent-active"] = null;
  state.prizeCountSnapshot.player1 = null;
  state.prizeCountSnapshot.opponent = null;
  clearSelections();
  closeOverlay();
  hideDeckMenu();
  hideStatusMenu();
  renderBoard();
  updateDeckImportAvailability();
  updateOpponentImportSyncView();
  updateImageProgress(0, 0);
}

async function triggerBattleStart({ broadcast = false, shuffleOrders = null } = {}) {
  if (runtime.autoSetupRunning) {
    return;
  }
  if (state.peer.multiplayerEnabled) {
    runtime.autoSetupRunning = true;
    updateAutoSetupButtonUi();
    try {
      const panel = document.getElementById("deck-import-panel");
      if (panel) {
        panel.classList.add("hidden");
      }
      await resetBoardToImportedStage({
        awaitPreload: false,
        preserveImageCaches: false,
        pruneImageCaches: true
      });
      const owners = ["player1", "opponent"];
      const effectiveOrders = {};
      owners.forEach((owner) => {
        const orderKey = broadcast ? owner : mirrorOwner(owner);
        const requestedOrder = shuffleOrders && Array.isArray(shuffleOrders[orderKey]) ? shuffleOrders[orderKey] : null;
        effectiveOrders[owner] = prepareOpeningDeckOrder(owner, requestedOrder);
      });
      if (broadcast) {
        sendPeerAction({
          type: ACTION_TYPES.START_BATTLE,
          shuffleOrders: effectiveOrders
        });
        sendPeerAction({ type: ACTION_TYPES.READY_STATE, ready: false });
      }
      let doneCount = 0;
      for (const owner of owners) {
        if (!effectiveOrders[owner]) {
          continue;
        }
        const ok = await drawOpeningHandForOwner(owner);
        if (ok) {
          doneCount += 1;
        }
      }
      if (doneCount === 0) {
        showToast("無可用牌組，無法開始對戰", "warn", 2200);
        return;
      }
    } finally {
      runtime.autoSetupRunning = false;
      updateAutoSetupButtonUi();
    }
  }
  showBattleStartBanner("對戰開始");
  clearReadyStateAndUi();
  clearRematchStateAndUi();
  setImportProgress("player1", 0, 0, false);
  setImportProgress("opponent", 0, 0, false);
  state.prizeCountSnapshot.player1 = null;
  state.prizeCountSnapshot.opponent = null;
  setGamePhase("遊戲中");
}

function checkAndStartBattle() {
  if (!state.peer.multiplayerEnabled || !state.peer.connected) {
    return;
  }
  if (!isOwnerImportFullyReady("player1") || !isOwnerImportFullyReady("opponent")) {
    return;
  }
  if (state.ready.local && state.ready.remote && state.peer.isHost) {
    void triggerBattleStart({ broadcast: true });
  }
}

async function triggerRematchStart({ broadcast = false } = {}) {
  if (runtime.autoSetupRunning) {
    return;
  }
  runtime.autoSetupRunning = true;
  logRendererDiagnostic("rematch-start", {
    broadcast
  });
  updateAutoSetupButtonUi();
  try {
    setGamePhase("準備中");
    if (broadcast) {
      sendPeerAction({ type: ACTION_TYPES.READY_STATE, ready: false });
      sendPeerAction({ type: ACTION_TYPES.REMATCH_STATE, ready: false });
    }
    await resetBoardToImportedStage({
      awaitPreload: false,
      preserveImageCaches: true,
      pruneImageCaches: false
    });
    const owners = ["player1", "opponent"];
    const effectiveOrders = {};
    owners.forEach((owner) => {
      effectiveOrders[owner] = prepareOpeningDeckOrder(owner);
    });
    if (broadcast) {
      sendPeerAction({
        type: ACTION_TYPES.START_BATTLE,
        shuffleOrders: effectiveOrders
      });
    }
    let doneCount = 0;
    for (const owner of owners) {
      if (!effectiveOrders[owner]) {
        continue;
      }
      const ok = await drawOpeningHandForOwner(owner);
      if (ok) {
        doneCount += 1;
      }
    }
    if (doneCount > 0) {
      showBattleStartBanner("再來一局");
      clearRematchStateAndUi();
      clearReadyStateAndUi();
      state.prizeCountSnapshot.player1 = null;
      state.prizeCountSnapshot.opponent = null;
      setGamePhase("遊戲中");
    } else {
      showToast("無可用牌組，無法開始再來一局", "warn", 2200);
    }
  } finally {
    runtime.autoSetupRunning = false;
    logRendererDiagnostic("rematch-finish", {
      broadcast
    });
    updateAutoSetupButtonUi();
    updateReadyUi();
  }
}

function checkAndStartRematch() {
  if (!state.peer.multiplayerEnabled || !state.peer.connected) {
    return;
  }
  if (state.rematch.local && state.rematch.remote && state.peer.isHost) {
    void triggerRematchStart({ broadcast: true });
  }
}

function setLocalReady(ready, { broadcast = true } = {}) {
  if (!state.singlePlayer && ready && !isOwnerImportFullyReady("player1")) {
    showToast("\u8acb\u5148\u532f\u5165\u6211\u65b9\u5361\u8868", "warn", 2200);
    return;
  }
  state.ready.local = !!ready;
  updateReadyUi();
  if (broadcast) {
    sendPeerAction({ type: ACTION_TYPES.READY_STATE, ready: !!ready });
  }
  checkAndStartBattle();
}

function setLocalRematch(ready, { broadcast = true } = {}) {
  if (state.singlePlayer) {
    if (!runtime.singleRematchUnlocked) {
      return;
    }
    void triggerRematchStart({ broadcast: false });
    return;
  }
  state.rematch.local = !!ready;
  updateReadyUi();
  if (broadcast) {
    sendPeerAction({ type: ACTION_TYPES.REMATCH_STATE, ready: !!ready });
  }
  checkAndStartRematch();
}

function setupReadyButton() {
  const btn = document.getElementById("ready-toggle-btn");
  const rematchBtn = document.getElementById("rematch-toggle-btn");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", () => {
    setLocalReady(!state.ready.local, { broadcast: true });
  });
  if (rematchBtn) {
    rematchBtn.addEventListener("click", () => {
      setLocalRematch(!state.rematch.local, { broadcast: true });
    });
  }
  updateReadyUi();
}

function discardMainCardWithAttach(target) {
  if (!target) {
    showToast("請先選取一張戰鬥區或備戰區卡片", "warn", 1800);
    return;
  }
  if (!isBattleOrBenchMainZone(target.zoneId) || !isCardMovableByViewer(target)) {
    showToast("僅可棄置我方戰鬥區或備戰區卡片", "warn", 1800);
    return;
  }
  const beforeMap = snapshotCardZones();
  clearLatestHighlights();
  const discardZone = getOwnerDiscardZone(target.owner);
  const attachZone = UNIQUE_MAIN_TO_ATTACH[target.zoneId];
  const attachCards = attachZone ? getCardsInZone(attachZone) : [];
  const moving = [target, ...attachCards];
  moving.forEach((card) => moveCardToZone(card, discardZone));
  clearSelections({ refresh: true });
  renderBoardForMovedCards(beforeMap, moving.map((card) => card.id));
  triggerDropEffects(discardZone, moving.map((card) => card.id));
  appendGameLog(`${target.owner === "player1" ? "我方" : "對手"}一鍵棄置 ${moving.length} 張`);
  broadcastMoveSync(moving.map((c) => c.id), beforeMap);
}

async function startAutoSetupSequence() {
  if (!state.singlePlayer) {
    showToast("自動開局目前僅支援單人模式", "warn", 2000);
    return;
  }
  if (runtime.autoSetupRunning) {
    return;
  }

  runtime.autoSetupRunning = true;
  updateAutoSetupButtonUi();
  try {
    if (anyCardOnBoard()) {
      const ok = await openResetConfirmModal();
      if (!ok) {
        return;
      }
    }
    clearReadyStateAndUi();
    clearRematchStateAndUi();
    setGamePhase("準備中");
    await resetBoardToImportedStage({
      awaitPreload: true,
      preserveImageCaches: false,
      pruneImageCaches: true
    });
    const owners = ["player1", "opponent"];
    let doneCount = 0;
    for (const owner of owners) {
      const ok = await runAutoSetupForOwner(owner);
      if (ok) {
        doneCount += 1;
      }
    }
    setImportProgress("player1", 0, 0, false);
    setImportProgress("opponent", 0, 0, false);
    if (doneCount > 0) {
      runtime.singleRematchUnlocked = true;
      updateReadyUi();
      showToast("雙方自動開局完成", "success", 1800);
    } else {
      showToast("無可用牌組，未執行自動開局", "warn", 2200);
    }
  } finally {
    runtime.autoSetupRunning = false;
    updateAutoSetupButtonUi();
    updateReadyUi();
  }
}

function setupAutoSetupControls() {
  const autoBtn = document.getElementById("auto-setup-btn");
  const newMatchBtn = document.getElementById("new-match-btn");
  const confirmYes = document.getElementById("reset-confirm-yes");
  const confirmNo = document.getElementById("reset-confirm-no");

  if (autoBtn) {
    autoBtn.addEventListener("click", () => {
      const panel = document.getElementById("deck-import-panel");
      if (state.singlePlayer) {
        if (panel) {
          panel.classList.add("hidden");
        }
        void startAutoSetupSequence();
        return;
      }
      setLocalReady(!state.ready.local, { broadcast: true });
    });
  }
  if (newMatchBtn) {
    newMatchBtn.addEventListener("click", () => {
      if (state.singlePlayer) {
        void startAutoSetupSequence();
        return;
      }
      setLocalReady(!state.ready.local, { broadcast: true });
    });
  }
  if (confirmYes) {
    confirmYes.addEventListener("click", () => resolveResetConfirm(true));
  }
  if (confirmNo) {
    confirmNo.addEventListener("click", () => resolveResetConfirm(false));
  }
}

function setupGreatVoidToggle() {
  const btn = document.getElementById("great-void-toggle-btn");
  if (!btn) {
    return;
  }

  btn.addEventListener("click", () => {
    if (state.peer.multiplayerEnabled) {
      const owner = state.currentViewer || "player1";
      setGreatVoidForOwner(owner, !isGreatVoidActiveForOwner(owner), { broadcast: true });
      return;
    }

    const next = !(isGreatVoidActiveForOwner("player1") && isGreatVoidActiveForOwner("opponent"));
    setGreatVoidForOwner("player1", next, { broadcast: false });
    setGreatVoidForOwner("opponent", next, { broadcast: false });
  });

  renderGreatVoidLayouts();
}

function setupHandVisibilityToggle() {
  const btn = document.getElementById("hand-visibility-toggle-btn");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", () => {
    if (!state.peer.multiplayerEnabled) {
      return;
    }
    const owner = state.currentViewer || "player1";
    setHandVisibilityForOwner(owner, !state.handReveal[owner], { broadcast: true });
  });
  updateHandVisibilityButtonUi();
}

function getCardRelativePos(cardId) {
  const el = document.querySelector(`.card[data-card-id="${cardId}"]`);
  const board = document.getElementById("board-root");
  if (!el || !board) {
    return { xPct: 0, yPct: 0 };
  }
  const r = el.getBoundingClientRect();
  const b = board.getBoundingClientRect();
  const xPct = b.width > 0 ? ((r.left + r.width / 2 - b.left) / b.width) * 100 : 0;
  const yPct = b.height > 0 ? ((r.top + r.height / 2 - b.top) / b.height) * 100 : 0;
  return { xPct: Number(xPct.toFixed(3)), yPct: Number(yPct.toFixed(3)) };
}

function sendPeerAction(action) {
  const conn = state.peer.conn;
  if (!state.peer.multiplayerEnabled || !conn || !state.peer.connected || state.peer.applyingRemote) {
    return;
  }
  conn.send(action);
}

function setHandVisibilityForOwner(owner, visible, { broadcast = true } = {}) {
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  state.handReveal[owner] = !!visible;
  updateHandVisibilityButtonUi();
  renderBoard({ zoneIds: [getOwnerHandZone(owner)], overlay: false, indicators: false, resources: false, winner: false, animations: false });
  if (broadcast && state.peer.multiplayerEnabled) {
    sendPeerAction({
      type: ACTION_TYPES.TOGGLE_HAND_VISIBILITY,
      owner,
      visible: !!visible
    });
  }
}

function renderChatMessages() {
  const list = document.getElementById("chat-message-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  const frag = document.createDocumentFragment();
  state.chat.messages.forEach((message) => {
    const row = document.createElement("div");
    const isLocal = message.sender === (state.currentViewer || "player1");
    row.className = `chat-message-row ${isLocal ? "local" : "remote"}`;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = `${isLocal ? "我：" : "對手："}${message.text}`;
    row.appendChild(bubble);
    frag.appendChild(row);
  });
  list.appendChild(frag);
  list.scrollTop = list.scrollHeight;
}

function openChatModal() {
  const modal = document.getElementById("chat-modal");
  if (!modal) {
    return;
  }
  state.chat.isOpen = true;
  state.chat.hasUnread = false;
  modal.classList.remove("hidden");
  renderChatMessages();
  updateChatUnreadUi();
  const input = document.getElementById("chat-input");
  if (input) {
    requestAnimationFrame(() => input.focus());
  }
}

function closeChatModal() {
  const modal = document.getElementById("chat-modal");
  if (!modal) {
    return;
  }
  state.chat.isOpen = false;
  hideWithAnimation(modal);
  updateChatUnreadUi();
}

function updateCoinTossUi() {
  const btn = document.getElementById("coin-toss-btn");
  const disc = document.getElementById("coin-toss-disc");
  const symbol = document.getElementById("coin-toss-symbol");
  if (!btn) {
    return;
  }
  btn.disabled = !!state.coin.busy;
  const hasResult = !!state.coin.result;
  if (!state.coin.busy) {
    const isTails = state.coin.result === "反面";
    if (disc) {
      disc.classList.toggle("is-tails", isTails);
    }
    if (symbol) {
      symbol.textContent = isTails ? "反" : "正";
    }
  }
  if (!hasResult && !state.coin.busy) {
    btn.classList.remove("coin-toss-heads", "coin-toss-tails", "coin-toss-spinning");
    if (disc) {
      disc.style.transform = "rotateZ(0deg) scaleY(1)";
    }
  }
  btn.setAttribute("aria-label", hasResult ? `擲硬幣，結果${state.coin.result}` : "擲硬幣");
}

function buildCoinTossKeyframes() {
  return [
    { transform: "translateY(0px) scaleX(1) scaleY(1)", offset: 0 },
    { transform: "translateY(6px) scaleX(1.08) scaleY(0.84)", offset: 0.05 },
    { transform: "translateY(-96px) scaleX(0.92) scaleY(1.08)", offset: 0.28 },
    { transform: "translateY(-32px) scaleX(0.97) scaleY(1.03)", offset: 0.42 },
    { transform: "translateY(0px) scaleX(1.1) scaleY(0.82)", offset: 0.56 },
    { transform: "translateY(-34px) scaleX(0.96) scaleY(1.05)", offset: 0.7 },
    { transform: "translateY(-10px) scaleX(0.99) scaleY(1.02)", offset: 0.8 },
    { transform: "translateY(0px) scaleX(1.05) scaleY(0.9)", offset: 0.9 },
    { transform: "translateY(0px) scaleX(1) scaleY(1)", offset: 1 }
  ];
}

function setCoinFace(face) {
  const disc = document.getElementById("coin-toss-disc");
  const symbol = document.getElementById("coin-toss-symbol");
  const isTails = face === "反面";
  if (disc) {
    disc.classList.toggle("is-tails", isTails);
  }
  if (symbol) {
    symbol.textContent = isTails ? "反" : "正";
  }
}

function shouldStackHandZone(zoneId) {
  if (!isHandZone(zoneId)) {
    return false;
  }
  if (state.singlePlayer) {
    return true;
  }
  return zoneId === "player1-hand";
}

async function playCoinToss(result, { broadcast = false, startedAt = 0, flipCount = 10 } = {}) {
  const btn = document.getElementById("coin-toss-btn");
  const disc = document.getElementById("coin-toss-disc");
  if (!btn || !disc || state.coin.busy) {
    return;
  }

  state.coin.busy = true;
  state.coin.result = "";
  btn.classList.remove("coin-toss-heads", "coin-toss-tails");
  btn.classList.add("coin-toss-spinning");
  const previousFace = disc.classList.contains("is-tails") ? "反面" : "正面";
  setCoinFace(previousFace);
  updateCoinTossUi();

  const normalizedFlipCount = Math.max(8, Math.min(14, Number(flipCount) || 10));
  if (runtime.coinTossAnimation) {
    runtime.coinTossAnimation.cancel();
  }
  if (runtime.coinFlipTicker) {
    window.clearTimeout(runtime.coinFlipTicker);
    runtime.coinFlipTicker = null;
  }

  const startTime = Number(startedAt) || 0;
  const waitMs = startTime > 0 ? Math.max(0, startTime - Date.now()) : 0;
  if (broadcast && state.peer.multiplayerEnabled) {
    sendPeerAction({
      type: ACTION_TYPES.COIN_TOSS,
      result,
      startedAt: startTime,
      flipCount: normalizedFlipCount
    });
  }
  if (waitMs > 0) {
    await delayMs(waitMs);
  }

  const durationMs = 1760;
  const primaryPhaseMs = 880;
  const secondaryPhaseMs = 340;
  const settleQuietMs = 260;
  const totalFlipWindow = primaryPhaseMs + secondaryPhaseMs - settleQuietMs;
  const primaryFlipCount = Math.max(6, normalizedFlipCount - 2);
  const secondaryFlipCount = Math.max(1, Math.min(2, normalizedFlipCount - primaryFlipCount));
  const primaryInterval = Math.max(68, Math.round(primaryPhaseMs / primaryFlipCount));
  let faceToggle = 0;
  setCoinFace("正面");
  const flipTicker = window.setInterval(() => {
    faceToggle += 1;
    setCoinFace(faceToggle % 2 === 0 ? "正面" : "反面");
  }, primaryInterval);
  const scheduledFlipTimeouts = [];
  const secondaryTickerStart = window.setTimeout(() => {
    window.clearInterval(flipTicker);
    if (secondaryFlipCount <= 0) {
      return;
    }
    const secondarySpacing = Math.max(120, Math.round((secondaryPhaseMs - settleQuietMs) / Math.max(1, secondaryFlipCount)));
    for (let i = 0; i < secondaryFlipCount; i += 1) {
      const timeoutId = window.setTimeout(() => {
        faceToggle += 1;
        setCoinFace(faceToggle % 2 === 0 ? "正面" : "反面");
      }, i * secondarySpacing);
      scheduledFlipTimeouts.push(timeoutId);
    }
  }, primaryPhaseMs);
  const stopTickerAt = window.setTimeout(() => {
    window.clearInterval(flipTicker);
    scheduledFlipTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, totalFlipWindow);
  const finalFaceLock = window.setTimeout(() => {
    setCoinFace(result);
  }, totalFlipWindow);

  runtime.coinTossAnimation = disc.animate(
    buildCoinTossKeyframes(),
    {
      duration: durationMs,
      easing: "cubic-bezier(0.18, 0.82, 0.24, 1)",
      fill: "forwards"
    }
  );

  try {
    await runtime.coinTossAnimation.finished;
  } catch {
    // animation cancelled by a new toss or reset
  } finally {
    window.clearInterval(flipTicker);
    window.clearTimeout(secondaryTickerStart);
    window.clearTimeout(stopTickerAt);
    window.clearTimeout(finalFaceLock);
    scheduledFlipTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    runtime.coinFlipTicker = null;
  }

  const isHeads = result === "正面";
  setCoinFace(result);
  disc.style.transform = "translateY(0px) scaleX(1) scaleY(1)";
  btn.classList.remove("coin-toss-spinning");
  btn.classList.add(isHeads ? "coin-toss-heads" : "coin-toss-tails");
  state.coin.busy = false;
  state.coin.result = result;
  runtime.coinTossAnimation = null;
  updateCoinTossUi();
}

async function runCoinToss() {
  const result = Math.random() < 0.5 ? "正面" : "反面";
  const flipCount = 9 + Math.floor(Math.random() * 4);
  await playCoinToss(result, { broadcast: true, startedAt: Date.now() + 320, flipCount });
}

function appendChatMessage(sender, text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return;
  }
  state.chat.messages.push({
    sender,
    text: trimmed,
    sentAt: Date.now()
  });
  if (state.chat.messages.length > 80) {
    state.chat.messages.splice(0, state.chat.messages.length - 80);
  }
  if (!state.chat.isOpen && sender !== (state.currentViewer || "player1")) {
    state.chat.hasUnread = true;
  }
  renderChatMessages();
  updateChatUnreadUi();
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  if (!input) {
    return;
  }
  const text = String(input.value || "").trim();
  if (!text) {
    return;
  }
  appendChatMessage(state.currentViewer || "player1", text);
  if (state.peer.multiplayerEnabled) {
    sendPeerAction({
      type: ACTION_TYPES.CHAT_MESSAGE,
      owner: state.currentViewer || "player1",
      text
    });
  }
  input.value = "";
  input.focus();
}

function buildDeckSummary(owner) {
  const byName = new Map();
  getCardsInZone(getOwnerDeckZone(owner)).forEach((card) => {
    const key = card.name || `Card ${card.id}`;
    byName.set(key, (byName.get(key) || 0) + 1);
  });
  return [...byName.entries()].map(([name, count]) => ({ name, count }));
}

function broadcastDeckSummary(owner) {
  sendPeerAction({
    type: ACTION_TYPES.SYNC_DECK,
    owner,
    summary: buildDeckSummary(owner)
  });
}

function broadcastMoveSync(cardIds, beforeMap = null) {
  if (!cardIds || cardIds.length === 0) {
    return;
  }
  const payload = cardIds.map((id) => {
    const card = getCardById(id);
    if (!card) {
      return null;
    }
    const zoneCards = getCardsInZone(card.zoneId);
      return {
      id: card.id,
      owner: card.owner,
      syncId: card.syncId,
      from: beforeMap ? (beforeMap.get(card.id) || "") : "",
      to: card.zoneId,
      toIndex: zoneCards.findIndex((c) => c.id === card.id),
      pos: getCardRelativePos(card.id),
      isFaceUp: !!card.isFaceUp,
      ...buildCardIdentityPayload(card),
      poison: !!card.poison,
      burn: !!card.burn,
      behaviorStatus: card.behaviorStatus || "",
      rotationDeg: card.rotationDeg || 0
    };
  }).filter(Boolean);
  sendPeerAction({ type: ACTION_TYPES.MOVE_CARD, moves: payload });
}

function broadcastCardStats(card, zoneId = card && card.zoneId) {
  if (!card) {
    return;
  }
  sendPeerAction({
    type: ACTION_TYPES.UPDATE_STATS,
    updates: [{
      id: card.id,
      owner: card.owner,
      syncId: card.syncId,
      zoneId,
      damage: getZoneDamage(zoneId),
      poison: !!card.poison,
      burn: !!card.burn,
      behaviorStatus: card.behaviorStatus || "",
      rotationDeg: card.rotationDeg || 0
    }]
  });
}

function applyRemoteMove(data) {
  clearLatestHighlights();
  const moves = Array.isArray(data.moves) ? data.moves : [];
  const beforeMap = new Map();
  const movedIds = [];
  const targetZones = new Set();
  moves.forEach((mv) => {
    const remoteOwner = mirrorOwner(String(mv.owner || "player1"));
    const card = getOrCreateCardBySyncPayload(remoteOwner, mv);
    if (!card) {
      return;
    }
    const toZone = mirrorZoneId(mv.to);
    if (!toZone) {
      return;
    }
    beforeMap.set(card.id, card.zoneId);
    moveCardToZone(card, toZone);
    targetZones.add(toZone);
    card.poison = !!mv.poison;
    card.burn = !!mv.burn;
    card.behaviorStatus = String(mv.behaviorStatus || "");
    card.rotationDeg = Number(mv.rotationDeg) || 0;
    movedIds.push(card.id);
  });
  renderBoardForMovedCards(beforeMap, movedIds);
  targetZones.forEach((zoneId) => triggerRemotePublicPulse(zoneId, movedIds));
}

function applyRemoteStats(data) {
  const updates = Array.isArray(data.updates) ? data.updates : [];
  const affectedZones = new Set();
  updates.forEach((u) => {
    const localZoneId = mirrorZoneId(String(u.zoneId || ""));
    if (localZoneId) {
      setZoneDamage(localZoneId, Number(u.damage) || 0);
      affectedZones.add(localZoneId);
    }
    const remoteOwner = mirrorOwner(String(u.owner || "player1"));
    const card = getCardBySyncKey(remoteOwner, Number(u.syncId));
    if (!card) {
      return;
    }
    card.poison = !!u.poison;
    card.burn = !!u.burn;
    card.behaviorStatus = String(u.behaviorStatus || "");
    card.rotationDeg = Number(u.rotationDeg) || 0;
    if (card.zoneId) {
      affectedZones.add(card.zoneId);
    }
  });
  renderBoard({ zoneIds: [...affectedZones], overlay: false });
}

function reorderDeckBySyncIds(owner, syncOrder) {
  const zone = getOwnerDeckZone(owner);
  const orderSet = new Set(syncOrder.map((id) => Number(id)));
  const zoneCards = cards.filter((c) => c.zoneId === zone);
  const mapped = syncOrder.map((sid) => zoneCards.find((c) => Number(c.syncId) === Number(sid))).filter(Boolean);
  const untouched = zoneCards.filter((c) => !orderSet.has(Number(c.syncId)));
  reorderDeck(owner, [...mapped, ...untouched]);
}

function applyRemoteShuffle(data) {
  const owner = mirrorOwner(data.owner);
  if (!owner || !Array.isArray(data.order)) {
    return;
  }
  reorderDeckBySyncIds(owner, data.order);
  renderBoard({ zoneIds: [getOwnerDeckZone(owner)], overlay: false, indicators: false, winner: false, animations: false });
}

function applyRemoteGreatVoid(data) {
  const owner = mirrorOwner(String(data.owner || "player1"));
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  setGreatVoidForOwner(owner, !!data.enabled, { broadcast: false });
}

function applyRemoteHandVisibility(data) {
  const owner = mirrorOwner(String(data.owner || "player1"));
  if (owner !== "player1" && owner !== "opponent") {
    return;
  }
  setHandVisibilityForOwner(owner, !!data.visible, { broadcast: false });
}

function applyRemoteChatMessage(data) {
  const sender = mirrorOwner(String(data.owner || "player1"));
  appendChatMessage(sender, data.text);
}

function applyRemoteCoinToss(data) {
  const result = String(data.result || "");
  if (result !== "正面" && result !== "反面") {
    return;
  }
  void playCoinToss(result, {
    broadcast: false,
    startedAt: Number(data.startedAt) || 0,
    flipCount: Number(data.flipCount) || 10
  });
}

function applyRemoteInitState(data) {
  if (!Array.isArray(data.cards)) {
    return;
  }
  const preservedLocalCards = cards
    .filter((card) => card.owner === "player1")
    .map((card) => ({
      ...card,
      imageRefs: card.imageRefs ? { ...card.imageRefs } : null
    }));
  const mirroredRemoteCards = data.cards
    .map((c) => ({
    ...c,
    owner: mirrorOwner(c.owner),
    zoneId: mirrorZoneId(c.zoneId),
    imageRefs: null
    }))
    .filter((card) => card.owner === "opponent");
  cards.length = 0;
  preservedLocalCards.forEach((card) => cards.push(card));
  mirroredRemoteCards.forEach((card) => cards.push(card));
  if (data.greatVoid && typeof data.greatVoid === "object") {
    state.greatVoid.player1 = !!data.greatVoid.opponent;
    state.greatVoid.opponent = !!data.greatVoid.player1;
  }
  if (data.handReveal && typeof data.handReveal === "object") {
    state.handReveal.player1 = !!data.handReveal.opponent;
    state.handReveal.opponent = !!data.handReveal.player1;
  }
  if (data.importedDeckEntries && typeof data.importedDeckEntries === "object") {
    const remoteEntries = Array.isArray(data.importedDeckEntries.player1) ? data.importedDeckEntries.player1 : null;
    const remoteSourceText = data.importedDeckSourceText && typeof data.importedDeckSourceText === "object"
      ? String(data.importedDeckSourceText.player1 || "").trim()
      : "";
    if (remoteEntries && !remoteSourceText) {
      const normalizedRemoteEntries = normalizeDeckEntries(remoteEntries);
      state.importedDeckEntries.opponent = stripImageRefsFromEntries(normalizedRemoteEntries);
      primeDeckImageRefsFromEntries("opponent", normalizedRemoteEntries);
      state.importLock.opponent = true;
      void cacheImportedDeckImagesInBackground("opponent", normalizedRemoteEntries).catch(() => {});
    }
  }
  if (data.importedDeckSourceText && typeof data.importedDeckSourceText === "object") {
    state.importedDeckSourceText.opponent = String(data.importedDeckSourceText.player1 || "").trim();
    if (state.importedDeckSourceText.opponent) {
      void syncRemoteDeckImport("opponent", state.importedDeckSourceText.opponent, state.importedDeckEntries.opponent).catch(() => {});
    }
  }
  if (data.importLock && typeof data.importLock === "object" && data.importedDeckEntries == null) {
    state.importLock.opponent = !!data.importLock.player1;
  }
  state.chat.messages = [];
  state.chat.hasUnread = false;
  state.currentViewer = "player1";
  renderBoard();
  updateHandVisibilityButtonUi();
  updateChatUnreadUi();
  updateAutoSetupButtonUi();
  checkAndStartBattle();
}

async function onPeerData(data) {
  if (!data || typeof data !== "object") {
    return;
  }
  state.peer.applyingRemote = true;
  try {
    if (data.type === ACTION_TYPES.MOVE_CARD) {
      applyRemoteMove(data);
    } else if (data.type === ACTION_TYPES.UPDATE_STATS) {
      applyRemoteStats(data);
    } else if (data.type === ACTION_TYPES.SHUFFLE) {
      applyRemoteShuffle(data);
    } else if (data.type === ACTION_TYPES.TOGGLE_GREAT_VOID) {
      applyRemoteGreatVoid(data);
    } else if (data.type === ACTION_TYPES.TOGGLE_HAND_VISIBILITY) {
      applyRemoteHandVisibility(data);
    } else if (data.type === ACTION_TYPES.CHAT_MESSAGE) {
      applyRemoteChatMessage(data);
    } else if (data.type === ACTION_TYPES.COIN_TOSS) {
      applyRemoteCoinToss(data);
    } else if (data.type === ACTION_TYPES.INIT_STATE) {
      applyRemoteInitState(data);
    } else if (data.type === ACTION_TYPES.SYNC_DECK) {
      if (data.mode === "deck-import" && (typeof data.rawText === "string" || Array.isArray(data.entries))) {
        const remoteOwner = mirrorOwner(data.owner);
        if (remoteOwner === "player1" || remoteOwner === "opponent") {
          await syncRemoteDeckImport(remoteOwner, data.rawText, Array.isArray(data.entries) ? data.entries : null);
        }
      }
    } else if (data.type === ACTION_TYPES.READY_STATE) {
      state.ready.remote = !!data.ready;
      checkAndStartBattle();
    } else if (data.type === ACTION_TYPES.START_BATTLE) {
      await triggerBattleStart({
        broadcast: false,
        shuffleOrders: data.shuffleOrders || null
      });
    } else if (data.type === ACTION_TYPES.REMATCH_STATE) {
      state.rematch.remote = !!data.ready;
      checkAndStartRematch();
    } else if (data.type === ACTION_TYPES.START_REMATCH) {
      await triggerRematchStart({ broadcast: false });
    }
  } finally {
    state.peer.applyingRemote = false;
  }
}

function setupPeerConnection(conn, { isHost = false } = {}) {
  state.peer.conn = conn;
  state.peer.remoteId = conn.peer || "";
  state.peer.isHost = !!isHost;

  let connectionOpened = false;
  const finalizeConnectionOpen = () => {
    if (connectionOpened) {
      return;
    }
    connectionOpened = true;
    state.peer.connected = true;
    runtime.peerConnectPending = false;
    clearPeerRetryTimer();
    state.ready.remote = false;
    state.rematch.remote = false;
    updatePeerConnectionUi(true);
    showToast("連線成功", "success", 1400);
    sendPeerAction({
      type: ACTION_TYPES.SYNC_DECK,
      owner: "player1",
      summary: buildDeckSummary("player1")
    });
    sendPeerAction({
      type: ACTION_TYPES.SYNC_DECK,
      owner: "opponent",
      summary: buildDeckSummary("opponent")
    });
    if (state.peer.isHost) {
      const firstTurn = Math.random() < 0.5 ? "player1" : "opponent";
      sendPeerAction({
        type: ACTION_TYPES.INIT_STATE,
        firstTurn,
        cards: cards.map((c) => sanitizeCardForSync(c)),
        greatVoid: { ...state.greatVoid },
        handReveal: { ...state.handReveal },
        importLock: { ...state.importLock },
        importedDeckEntries: {
          player1: Array.isArray(state.importedDeckEntries.player1)
            ? state.importedDeckEntries.player1.map((entry) => ({ ...entry }))
            : null
        },
        importedDeckSourceText: {
          player1: state.importedDeckSourceText.player1 || ""
        }
      });
    }
    if (Array.isArray(state.importedDeckEntries.player1) && state.importedDeckEntries.player1.length > 0) {
      const sendImportedDeck = () => sendPeerAction({
        type: ACTION_TYPES.SYNC_DECK,
        mode: "deck-import",
        owner: "player1",
        entries: state.importedDeckEntries.player1.map((entry) => ({ ...entry })),
        rawText: state.importedDeckSourceText.player1 || getDeckEntriesAsText(state.importedDeckEntries.player1)
      });
      sendImportedDeck();
      setTimeout(sendImportedDeck, 600);
    }
    sendPeerAction({ type: ACTION_TYPES.READY_STATE, ready: !!state.ready.local });
    sendPeerAction({ type: ACTION_TYPES.REMATCH_STATE, ready: !!state.rematch.local });
    sendPeerAction({
      type: ACTION_TYPES.TOGGLE_HAND_VISIBILITY,
      owner: state.currentViewer || "player1",
      visible: !!state.handReveal[state.currentViewer || "player1"]
    });
  };

  conn.on("open", finalizeConnectionOpen);

  conn.on("data", (payload) => {
    void onPeerData(payload);
  });

  conn.on("close", () => {
    if (runtime.suppressPeerClosePrompt) {
      return;
    }
    state.peer.connected = false;
    state.peer.conn = null;
    state.ready.remote = false;
    state.rematch.remote = false;
    updatePeerConnectionUi(false);
    showToast("對手已斷線", "warn", 2200);
    const keep = confirm("對手已斷線，是否保留目前盤面等待重新連線？");
    if (!keep) {
      void hardResetToInitialState({ openModeGate: true });
    }
  });

  if (conn.open) {
    finalizeConnectionOpen();
  }
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existed = [...document.querySelectorAll("script")].find((s) => s.src === src);
    if (existed) {
      if (typeof window.Peer === "function") {
        resolve();
      } else {
        existed.addEventListener("load", () => resolve(), { once: true });
        existed.addEventListener("error", () => reject(new Error(`載入失敗: ${src}`)), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`載入失敗: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePeerJsLoaded() {
  if (typeof window.Peer === "function") {
    return true;
  }
  if (runtime.isElectron && typeof window.require === "function") {
    try {
      const peerModule = window.require("peerjs");
      window.Peer = peerModule.Peer || peerModule;
      if (typeof window.Peer === "function") {
        return true;
      }
    } catch {
      // fallback to script loading
    }
  }
  const candidates = [
    "./vendor/peerjs.min.js",
    "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js",
    "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js"
  ];
  for (const src of candidates) {
    try {
      await loadScriptOnce(src);
      if (typeof window.Peer === "function") {
        return true;
      }
    } catch {
      // try next CDN
    }
  }
  return typeof window.Peer === "function";
}

function createPeerAndWaitOpen(options, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const peerOptions = options ? { config: PEER_ICE_CONFIG, ...options } : { config: PEER_ICE_CONFIG };
    const peer = new window.Peer(peerOptions);
    let done = false;
    const timer = setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      try { peer.destroy(); } catch {}
      reject(new Error("open-timeout"));
    }, timeoutMs);

    peer.on("open", (id) => {
      if (done) {
        return;
      }
      done = true;
      clearTimeout(timer);
      resolve({ peer, id });
    });

    peer.on("error", (err) => {
      if (done) {
        return;
      }
      done = true;
      clearTimeout(timer);
      try { peer.destroy(); } catch {}
      reject(err instanceof Error ? err : new Error(String(err && err.type ? err.type : err)));
    });
  });
}

function bindPeerRuntimeEvents(peer, myId) {
  state.peer.peer = peer;
  state.peer.id = myId;
  clearPeerRetryTimer();
  updatePeerIdUi(myId);

  const params = new URLSearchParams(window.location.search);
  const invitePeer = params.get("join") || params.get("peer");
  if (invitePeer && invitePeer !== myId) {
    const conn = peer.connect(invitePeer, { reliable: true });
    setupPeerConnection(conn, { isHost: false });
  }

  peer.on("connection", (conn) => {
    setupPeerConnection(conn, { isHost: true });
  });

  peer.on("disconnected", () => {
    if (runtime.suppressPeerClosePrompt) {
      return;
    }
    state.peer.conn = null;
    updatePeerConnectionUi(false);
    showToast("連線中斷，請嘗試重新連線", "warn", 2200);
  });

  peer.on("error", (err) => {
    const msg = getFriendlyPeerErrorMessage(err);
    const detail = formatPeerErrorDetails(err);
    if (!state.peer.connected) {
      state.peer.id = "";
      state.peer.peer = null;
    }
    updatePeerIdUi(state.peer.id);
    updatePeerConnectionUi(false);
    showToast(`${msg} (${detail})`, "error", 3200);
    if (!state.peer.connected) {
      schedulePeerRetry();
    }
  });
}

async function setupPeerNetworking(force = false) {
  if (state.singlePlayer && !force) {
    return;
  }
  if (runtime.peerConnectPending) {
    return;
  }
  if (state.peer.id || state.peer.peer) {
    return;
  }
  runtime.peerConnectPending = true;
  updatePeerConnectionUi(false);
  updatePeerIdUi("");
  if (window.location.protocol === "file:" && !runtime.isElectron) {
    updatePeerIdUi("請用 localhost 開啟頁面");
    runtime.peerConnectPending = false;
    updatePeerConnectionUi(false);
    return;
  }

  const loaded = await ensurePeerJsLoaded();
  if (!loaded || typeof window.Peer !== "function") {
    runtime.peerConnectPending = false;
    updatePeerConnectionUi(false);
    schedulePeerRetry();
    return;
  }

  const strategies = [
    { debug: 1 },
    { key: "peerjs", debug: 1 }
  ];

  let lastErr = null;
  for (const opt of strategies) {
    try {
      const { peer, id } = await createPeerAndWaitOpen(opt, 9000);
      runtime.peerConnectPending = false;
      bindPeerRuntimeEvents(peer, id);
      return;
    } catch (err) {
      lastErr = err;
    }
  }

  const reason = getFriendlyPeerErrorMessage(lastErr);
  const detail = formatPeerErrorDetails(lastErr);
  runtime.peerConnectPending = false;
  updatePeerIdUi("");
  updatePeerConnectionUi(false);
  showToast(`${reason} (${detail})`, "error", 3200);
  schedulePeerRetry();
}

function setupMatchModeGate() {
  const gate = document.getElementById("mode-gate");
  const singleBtn = document.getElementById("mode-single-btn");
  const multiBtn = document.getElementById("mode-multi-btn");
  const fetchIdBtn = document.getElementById("peer-fetch-id-btn");
  const modeSelectBtn = document.getElementById("mode-select-btn");
  const copyBtn = document.getElementById("peer-copy-link-btn");
  const connectBtn = document.getElementById("peer-connect-btn");
  const connectInput = document.getElementById("peer-connect-input");
  const opponentImportBlock = document.getElementById("opponent-import-block");
  const hud = document.getElementById("p2p-hud");
  if (!gate || !singleBtn || !multiBtn) {
    return;
  }

  openMatchModeGate();
  updatePeerConnectionUi(false);

  if (fetchIdBtn) {
    fetchIdBtn.addEventListener("click", () => {
      void setupPeerNetworking(true);
    });
  }

  singleBtn.addEventListener("click", () => {
    void resetSessionState("single", {
      preservePeerIdentity: true,
      openImportPanel: true,
      clearImportedDecks: true
    }).then(() => {
      if (opponentImportBlock) {
        opponentImportBlock.classList.remove("hidden");
      }
      closeMatchModeGate();
    });
  });

  multiBtn.addEventListener("click", () => {
    const hasLiveConnection = !!(state.peer.connected || state.peer.conn || state.peer.remoteId);
    void resetSessionState("multi", {
      preservePeerIdentity: true,
      preservePeerConnection: hasLiveConnection,
      openImportPanel: true,
      clearImportedDecks: true
    }).then(() => {
      if (opponentImportBlock) {
        opponentImportBlock.classList.remove("hidden");
      }
      if (state.peer.id || state.peer.peer) {
        runtime.peerConnectPending = false;
        updatePeerConnectionUi(!!state.peer.connected);
      } else {
        updatePeerConnectionUi(false);
        void setupPeerNetworking();
      }
      closeMatchModeGate();
    });
  });

  if (modeSelectBtn) {
    modeSelectBtn.addEventListener("click", async () => {
      if (runtime.autoSetupRunning) {
        return;
      }
      await hardResetToInitialState({
        openModeGate: true,
        preservePeerIdentity: !!state.peer.id || !!state.peer.peer
      });
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyMyPeerId);
  }
  if (connectBtn && connectInput) {
    connectBtn.addEventListener("click", () => connectToPeerId(connectInput.value));
    connectInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        connectToPeerId(connectInput.value);
      }
    });
  }

  const gateSettingsBtn = document.getElementById("mode-gate-settings-btn");
  if (gateSettingsBtn) {
    gateSettingsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const modal = document.getElementById("settings-modal");
      if (modal) {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
      }
    });
  }
}

function setupSettingsModal() {
  const openBtn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("settings-modal-close");
  const fileInput = document.getElementById("background-image-input");
  const applyBtn = document.getElementById("background-image-apply-btn");
  const resetBtn = document.getElementById("background-image-reset-btn");
  const preview = document.getElementById("background-image-preview");
  const strengthInput = document.getElementById("background-strength-input");
  const strengthText = document.getElementById("background-strength-text");
  if (!openBtn || !modal || !closeBtn || !fileInput || !applyBtn || !resetBtn || !preview || !strengthInput || !strengthText) {
    return;
  }

  let pendingPreviewUrl = "";

  const clearPendingPreview = () => {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
      pendingPreviewUrl = "";
    }
  };

  const closeModal = () => {
    clearPendingPreview();
    hideWithAnimation(modal);
    modal.setAttribute("aria-hidden", "true");
  };

  const syncPreview = () => {
    let src = "";
    try {
      src = localStorage.getItem(CUSTOM_BG_STORAGE_KEY) || "";
    } catch {}
    preview.src = src || "./wallpapers/mega_greninja.jpg";
  };

  const syncStrength = () => {
    let raw = "100";
    try {
      raw = localStorage.getItem(CUSTOM_BG_STRENGTH_KEY) || "100";
    } catch {}
    const strength = normalizeBackgroundStrength(raw);
    strengthInput.value = String(strength);
    strengthText.textContent = `${strength}%`;
  };

  openBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    syncPreview();
    syncStrength();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  });

  closeBtn.addEventListener("click", closeModal);

  fileInput.addEventListener("change", () => {
    clearPendingPreview();
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      syncPreview();
      return;
    }
    pendingPreviewUrl = URL.createObjectURL(file);
    preview.src = pendingPreviewUrl;
  });

  applyBtn.addEventListener("click", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      showToast("請先選擇背景圖檔", "warn", 1800);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        showToast("背景圖讀取失敗", "error", 2200);
        return;
      }
      try {
        localStorage.setItem(CUSTOM_BG_STORAGE_KEY, result);
      } catch {
        showToast("背景圖儲存失敗", "error", 2200);
        return;
      }
      applyBackgroundImage(result);
      syncPreview();
      fileInput.value = "";
      clearPendingPreview();
      showToast("已套用自訂背景", "success", 1800);
      closeModal();
    };
    reader.onerror = () => {
      showToast("背景圖讀取失敗", "error", 2200);
    };
    reader.readAsDataURL(file);
  });

  resetBtn.addEventListener("click", () => {
    try {
      localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
    } catch {}
    fileInput.value = "";
    clearPendingPreview();
    applyBackgroundImage("");
    syncPreview();
    showToast("已還原預設背景", "success", 1800);
    closeModal();
  });

  strengthInput.addEventListener("input", () => {
    const strength = normalizeBackgroundStrength(strengthInput.value);
    applyBackgroundStrength(strength);
    strengthText.textContent = `${strength}%`;
  });

  strengthInput.addEventListener("change", () => {
    const strength = normalizeBackgroundStrength(strengthInput.value);
    try {
      localStorage.setItem(CUSTOM_BG_STRENGTH_KEY, String(strength));
    } catch {}
    applyBackgroundStrength(strength);
    strengthText.textContent = `${strength}%`;
  });

  // === 解析度設定 ===
  const resolutionSelect = document.getElementById("resolution-select");
  const resolutionApplyBtn = document.getElementById("resolution-apply-btn");
  const resolutionHint = document.getElementById("resolution-hint");

  const RESOLUTION_STORAGE_KEY = "ptcg.resolution";

  const syncResolutionUi = async () => {
    if (!resolutionSelect || !resolutionHint) return;
    try {
      const saved = localStorage.getItem(RESOLUTION_STORAGE_KEY) || "1600x960";
      resolutionSelect.value = saved;
      if (!resolutionSelect.value) resolutionSelect.value = "1600x960";
    } catch {}
    if (runtime.ipcRenderer) {
      try {
        const info = await runtime.ipcRenderer.invoke("get-resolution");
        if (info.fullscreen) {
          resolutionHint.textContent = `目前：全螢幕（${info.width} × ${info.height}）`;
        } else {
          resolutionHint.textContent = `目前：${info.width} × ${info.height}`;
        }
      } catch {}
    }
  };

  function showResolutionConfirm(newValue, previousValue) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "resolution-confirm-overlay";
      const panel = document.createElement("div");
      panel.className = "resolution-confirm-panel";
      const msg = document.createElement("p");
      msg.textContent = "是否保留此解析度設定？";
      const countdown = document.createElement("div");
      countdown.className = "countdown";
      let remaining = 5;
      countdown.textContent = `${remaining} 秒後自動還原`;
      const actions = document.createElement("div");
      actions.className = "resolution-confirm-actions";
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "confirm-btn";
      confirmBtn.textContent = "確認保留";
      const revertBtn = document.createElement("button");
      revertBtn.textContent = "還原";
      actions.appendChild(confirmBtn);
      actions.appendChild(revertBtn);
      panel.appendChild(msg);
      panel.appendChild(countdown);
      panel.appendChild(actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      let timer = null;
      const cleanup = (confirmed) => {
        if (timer) clearInterval(timer);
        overlay.remove();
        resolve(confirmed);
      };

      timer = setInterval(() => {
        remaining -= 1;
        countdown.textContent = `${remaining} 秒後自動還原`;
        if (remaining <= 0) {
          cleanup(false);
        }
      }, 1000);

      confirmBtn.addEventListener("click", () => cleanup(true));
      revertBtn.addEventListener("click", () => cleanup(false));
    });
  }

  if (resolutionApplyBtn && resolutionSelect) {
    resolutionApplyBtn.addEventListener("click", async () => {
      const value = resolutionSelect.value;
      if (!runtime.ipcRenderer) {
        showToast("此環境不支援調整解析度", "warn", 1800);
        return;
      }

      // 記住當前解析度以便還原
      let previousValue;
      try { previousValue = localStorage.getItem(RESOLUTION_STORAGE_KEY) || "1600x960"; } catch { previousValue = "1600x960"; }
      if (value === previousValue) {
        showToast("解析度未變更", "info", 1200);
        return;
      }

      let payload;
      if (value === "fullscreen") {
        payload = { fullscreen: true };
      } else {
        const parts = value.split("x");
        payload = { width: Number(parts[0]) || 1600, height: Number(parts[1]) || 960 };
      }

      try {
        const result = await runtime.ipcRenderer.invoke("set-resolution", payload);
        if (result && result.ok) {
          // 顯示 5 秒確認視窗
          const confirmed = await showResolutionConfirm(value, previousValue);
          if (confirmed) {
            try { localStorage.setItem(RESOLUTION_STORAGE_KEY, value); } catch {}
            showToast("已套用解析度設定", "success", 1600);
            await syncResolutionUi();
          } else {
            // 還原到之前的解析度
            let revertPayload;
            if (previousValue === "fullscreen") {
              revertPayload = { fullscreen: true };
            } else {
              const parts = previousValue.split("x");
              revertPayload = { width: Number(parts[0]) || 1600, height: Number(parts[1]) || 960 };
            }
            await runtime.ipcRenderer.invoke("set-resolution", revertPayload);
            resolutionSelect.value = previousValue;
            showToast("已還原解析度", "info", 1600);
            await syncResolutionUi();
          }
        }
      } catch (err) {
        showToast("解析度設定失敗", "error", 2000);
      }
    });
  }

  // 開啟設定時同步解析度 UI
  const origOpenHandler = openBtn.onclick;
  openBtn.addEventListener("click", () => { syncResolutionUi(); });

  syncPreview();
  syncStrength();
  syncResolutionUi();
}

function setupImageRootSetting() {
  const display = document.getElementById("deck-image-root-display");
  const browseBtn = document.getElementById("deck-image-root-browse-btn");
  const clearBtn = document.getElementById("deck-image-root-clear-btn");
  if (!display || !browseBtn || !clearBtn) {
    return;
  }

  const syncDisplay = () => {
    let val = "";
    try { val = localStorage.getItem(DECK_BUILDER_CUSTOM_IMAGE_ROOT_KEY) || ""; } catch {}
    display.textContent = val.trim() || "（使用內建路徑）";
    display.title = val.trim();
  };

  browseBtn.addEventListener("click", async () => {
    try {
      const { ipcRenderer } = require("electron");
      const result = await ipcRenderer.invoke("show-open-dialog", {
        title: "選擇卡片圖片資料夾（deck-builder-data 根目錄）",
        properties: ["openDirectory"]
      });
      if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
        const chosen = result.filePaths[0];
        try { localStorage.setItem(DECK_BUILDER_CUSTOM_IMAGE_ROOT_KEY, chosen); } catch {}
        syncDisplay();
        showToast("已設定圖片路徑，請重新載入卡表", "success", 2500);
      }
    } catch (err) {
      showToast("無法開啟資料夾選擇", "error", 2000);
    }
  });

  clearBtn.addEventListener("click", () => {
    try { localStorage.removeItem(DECK_BUILDER_CUSTOM_IMAGE_ROOT_KEY); } catch {}
    syncDisplay();
    showToast("已清除自訂圖片路徑", "success", 1800);
  });

  syncDisplay();
}

function setupChatModal() {
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const modal = document.getElementById("chat-modal");
  const closeBtn = document.getElementById("chat-modal-close");
  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");
  if (!toggleBtn || !modal || !closeBtn || !sendBtn || !input) {
    return;
  }

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.chat.isOpen) {
      closeChatModal();
      return;
    }
    openChatModal();
  });

  closeBtn.addEventListener("click", closeChatModal);
  modal.addEventListener("pointerdown", (event) => {
    if (event.target === modal) {
      closeChatModal();
    }
  });
  sendBtn.addEventListener("click", sendChatMessage);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

function setupCoinTossControl() {
  const btn = document.getElementById("coin-toss-btn");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", () => {
    void runCoinToss();
  });
  updateCoinTossUi();
}

function getMemoryStats() {
  const mem = performance && performance.memory ? performance.memory : null;
  if (!mem) {
    return null;
  }
  return {
    usedMB: Math.round((mem.usedJSHeapSize / 1048576) * 100) / 100,
    totalMB: Math.round((mem.totalJSHeapSize / 1048576) * 100) / 100,
    limitMB: Math.round((mem.jsHeapSizeLimit / 1048576) * 100) / 100
  };
}

function isZoneBlankDragEnabled(zoneId) {
  return zoneId.endsWith("-hand")
    || zoneId.endsWith("-temp-hand")
    || zoneId.endsWith("-reveal")
    || zoneId.endsWith("-attach");
}

function setupZoneBlankDrag() {
  BOARD_ZONE_IDS.forEach((zoneId) => {
    if (!isZoneBlankDragEnabled(zoneId)) {
      return;
    }
    const zone = document.getElementById(zoneId);
    if (!zone || zone.dataset.blankDragReady === "true") {
      return;
    }
    zone.dataset.blankDragReady = "true";
    zone.draggable = true;

    zone.addEventListener("dragstart", (event) => {
      if (event.target.closest(".card")) {
        return;
      }
      hideCardZoom();

      const dragCards = getCardsInZone(zoneId).filter((card) => isCardMovableByViewer(card));
      if (dragCards.length === 0) {
        event.preventDefault();
        return;
      }

      const ids = dragCards.map((card) => card.id);
      state.draggingCardIds = ids;
      runtime.diagnosticDragSeq += 1;
      logRendererDiagnostic("dragstart-zone", {
        seq: runtime.diagnosticDragSeq,
        zoneId,
        count: ids.length
      });
      updateDraggingUi();
      updateDragCursorIndicatorPosition(event.clientX, event.clientY);
      setDragCursorIndicatorVisible(true);

      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/json", JSON.stringify(ids));
      event.dataTransfer.setData("text/plain", ids.join(","));
      applySafeDragImage(event);
    });

    zone.addEventListener("dragend", () => {
      logRendererDiagnostic("dragend-zone", {
        seq: runtime.diagnosticDragSeq,
        zoneId
      });
      state.draggingCardIds = [];
      updateDraggingUi();
      setDragCursorIndicatorVisible(false);
      cleanupDragPreview();
      hideCardZoom();
    });
  });
}

function getOwnerDeckZone(owner) {
  return owner === "opponent" ? "opponent-deck" : "player1-deck";
}

function getOwnerHandZone(owner) {
  return owner === "opponent" ? "opponent-hand" : "player1-hand";
}

function getOwnerTempZone(owner) {
  return owner === "opponent" ? "opponent-temp-hand" : "player1-temp-hand";
}

function getOwnerRevealZone(owner) {
  return owner === "opponent" ? "opponent-reveal" : "player1-reveal";
}

function getOwnerDiscardZone(owner) {
  return owner === "opponent" ? "opponent-discard" : "player1-discard";
}

function getOwnerPrizeZone(owner) {
  return owner === "opponent" ? "opponent-prize" : "player1-prize";
}

function isHandZone(zoneId) {
  return zoneId === "player1-hand" || zoneId === "opponent-hand";
}

function canViewerSeeCardFront(card, zoneId) {
  if (state.overlay.isOpen && state.overlay.type === "library" && zoneId === "library-view") {
    return state.singlePlayer || state.currentViewer === state.overlay.owner;
  }
  if (zoneId === "stadium") {
    return true;
  }
  if (isRevealZone(zoneId)) {
    return true;
  }
  if (DISCARD_ZONES.has(zoneId)) {
    return true;
  }
  if (isBattleOrBenchMainZone(zoneId) || /-attach$/.test(String(zoneId || ""))) {
    return true;
  }
  if (!isHandLikeZone(zoneId)) {
    return card.isFaceUp;
  }
  if (state.singlePlayer) {
    return true;
  }
  if (isHandZone(zoneId) && card.owner !== state.currentViewer) {
    return !!state.handReveal[card.owner];
  }
  return card.owner === state.currentViewer;
}

function isCardMovableByViewer(card) {
  if (!card) {
    return false;
  }
  if (state.singlePlayer) {
    return true;
  }
  return card.owner === "player1";
}

function isDropAllowedForCard(card, targetZoneId) {
  if (!isZoneCurrentlyAvailable(targetZoneId)) {
    return false;
  }
  if (isDeckBottomZone(targetZoneId)) {
    return card.owner === getZoneOwner(targetZoneId);
  }
  const targetOwner = getZoneOwner(targetZoneId);
  if (targetOwner === "neutral") {
    return true;
  }
  return card.owner === targetOwner;
}

function resetBattleState(card) {
  card.poison = false;
  card.burn = false;
  card.behaviorStatus = "";
  card.rotationDeg = 0;
}

function getZoneDamage(zoneId) {
  return Math.max(0, Number(state.zoneDamage[zoneId]) || 0);
}

function setZoneDamage(zoneId, value) {
  if (!isBattleOrBenchMainZone(zoneId)) {
    return;
  }
  const v = Number(value);
  if (!Number.isFinite(v)) {
    return;
  }
  const next = Math.max(0, Math.floor(v));
  if (next <= 0) {
    delete state.zoneDamage[zoneId];
    return;
  }
  state.zoneDamage[zoneId] = next;
}

function clearZoneDamage(zoneId) {
  if (zoneId && Object.prototype.hasOwnProperty.call(state.zoneDamage, zoneId)) {
    delete state.zoneDamage[zoneId];
  }
}

function transferZoneDamage(fromZoneId, toZoneId) {
  if (!isBattleOrBenchMainZone(fromZoneId) || !isBattleOrBenchMainZone(toZoneId) || fromZoneId === toZoneId) {
    return;
  }
  const fromDamage = getZoneDamage(fromZoneId);
  clearZoneDamage(fromZoneId);
  setZoneDamage(toZoneId, fromDamage);
}

function swapZoneDamage(zoneA, zoneB) {
  if (!isBattleOrBenchMainZone(zoneA) || !isBattleOrBenchMainZone(zoneB) || zoneA === zoneB) {
    return;
  }
  const a = getZoneDamage(zoneA);
  const b = getZoneDamage(zoneB);
  setZoneDamage(zoneA, b);
  setZoneDamage(zoneB, a);
}

function createFloatingDamageText(zoneId, delta) {
  const zone = document.getElementById(zoneId);
  if (!zone) {
    return;
  }
  const anchor = zone.querySelector(".card") || zone;
  const rect = anchor.getBoundingClientRect();
  const text = document.createElement("span");
  text.className = `floating-damage-text ${delta > 0 ? "increase" : "decrease"}`;
  text.textContent = `${delta > 0 ? "+" : ""}${delta}`;
  text.style.left = `${rect.left + rect.width / 2}px`;
  text.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(text);

  setTimeout(() => {
    if (text.parentElement) {
      text.remove();
    }
  }, 720);
}

function markDamageFeedback(zoneId, delta) {
  if (delta === 0) {
    return;
  }
  createFloatingDamageText(zoneId, delta);

  if (Math.abs(delta) >= 100) {
    state.damageShakeIds.add(zoneId);
    setTimeout(() => state.damageShakeIds.delete(zoneId), 280);
  }
}

function adjustCardDamage(card, delta, zoneId = card.zoneId) {
  if (!isBattleOrBenchMainZone(zoneId)) {
    return;
  }
  const before = getZoneDamage(zoneId);
  setZoneDamage(zoneId, before + delta);
  const actualDelta = getZoneDamage(zoneId) - before;
  if (isActiveMainZone(zoneId)) {
    updateActiveTypeHintForDefender(zoneId);
  }
  markDamageFeedback(zoneId, actualDelta);
  if (actualDelta !== 0) {
    broadcastCardStats(card, zoneId);
  }
}

function applyZoneEnterRules(card, zoneId) {
  if (PRIZE_ZONES.has(zoneId)) {
    card.isFaceUp = false;
    return;
  }
  if (isBattleOrBenchMainZone(zoneId) || zoneId.endsWith("-attach")) {
    card.isFaceUp = true;
    return;
  }
  if (zoneId.endsWith("-reveal")) {
    card.isFaceUp = true;
    return;
  }
  if (DISCARD_ZONES.has(zoneId)) {
    card.isFaceUp = true;
    state.discardCounter += 1;
    card.discardOrder = state.discardCounter;
  }
}

function moveCardToZone(card, zoneId) {
  const fromZoneId = card.zoneId;
  if (fromZoneId !== zoneId && ACTIVE_MAIN_ZONES.has(fromZoneId)) {
    resetBattleState(card);
  }

  if (fromZoneId && fromZoneId !== zoneId && Array.isArray(state.latestCardByZone[fromZoneId])) {
    state.latestCardByZone[fromZoneId] = state.latestCardByZone[fromZoneId].filter((id) => id !== card.id);
    if (state.latestCardByZone[fromZoneId].length === 0) {
      delete state.latestCardByZone[fromZoneId];
    }
  }

  card.zoneId = zoneId;
  if (fromZoneId !== zoneId && isBattleOrBenchMainZone(fromZoneId) && !isBattleOrBenchMainZone(zoneId)) {
    clearZoneDamage(fromZoneId);
  }
  applyZoneEnterRules(card, zoneId);
  if (fromZoneId !== zoneId) {
    if (!Array.isArray(state.latestCardByZone[zoneId])) {
      state.latestCardByZone[zoneId] = [];
    }
    if (!state.latestCardByZone[zoneId].includes(card.id)) {
      state.latestCardByZone[zoneId].push(card.id);
    }
  }
}

function clearLatestHighlights() {
  state.latestCardByZone = {};
}

function getGreatVoidBenchZoneIds(owner) {
  return [6, 7, 8].flatMap((idx) => [`${owner}-bench-${idx}`, `${owner}-bench-${idx}-attach`]);
}

function createGreatVoidBenchSlot(owner, idx, attach = false) {
  const slot = document.createElement("div");
  slot.className = `zone-slot ${attach ? "attach" : "main-card"} extra-bench-slot`;
  slot.id = attach ? `${owner}-bench-${idx}-attach` : `${owner}-bench-${idx}`;
  slot.dataset.zoneLabel = attach ? "" : owner === "opponent" ? `對手備戰 ${idx}` : `備戰 ${idx}`;
  return slot;
}

function ensureGreatVoidBenchSlots(owner, active) {
  const benchRow = document.getElementById(`${owner}-bench-row`);
  if (!benchRow) {
    return;
  }

  if (active) {
    for (let idx = 6; idx <= 8; idx += 1) {
      if (!document.getElementById(`${owner}-bench-${idx}`)) {
        benchRow.appendChild(createGreatVoidBenchSlot(owner, idx, false));
      }
      if (!document.getElementById(`${owner}-bench-${idx}-attach`)) {
        benchRow.appendChild(createGreatVoidBenchSlot(owner, idx, true));
      }
    }
    setupDropzones();
    setupZoneBlankDrag();
    return;
  }

  getGreatVoidBenchZoneIds(owner).forEach((zoneId) => {
    const node = document.getElementById(zoneId);
    if (node) {
      node.remove();
    }
  });
}

function applyGreatVoidLayout(owner) {
  const benchRow = document.getElementById(`${owner}-bench-row`);
  const center = document.getElementById(owner === "opponent" ? "opponent-center" : "player1-center");
  const active = isGreatVoidActiveForOwner(owner);
  ensureGreatVoidBenchSlots(owner, active);
  if (benchRow) {
    benchRow.classList.toggle("great-void-active", active);
  }
  if (center) {
    center.classList.toggle("great-void-active", active);
  }
}

function renderGreatVoidLayouts() {
  applyGreatVoidLayout("player1");
  applyGreatVoidLayout("opponent");
  const btn = document.getElementById("great-void-toggle-btn");
  if (btn) {
    const localOwner = state.currentViewer || "player1";
    btn.classList.toggle("active", isGreatVoidActiveForOwner(localOwner));
  }
}

function discardGreatVoidCards(owner) {
  const zoneIds = getGreatVoidBenchZoneIds(owner);
  const cardsToDiscard = zoneIds.flatMap((zoneId) => getCardsInZone(zoneId));
  if (cardsToDiscard.length === 0) {
    return [];
  }
  const discardZone = getOwnerDiscardZone(owner);
  cardsToDiscard.forEach((card) => moveCardToZone(card, discardZone));
  return cardsToDiscard.map((card) => card.id);
}

function setGreatVoidForOwner(owner, enabled, options = {}) {
  const {
    broadcast = true
  } = options;
  const next = !!enabled;
  if (state.greatVoid[owner] === next) {
    renderGreatVoidLayouts();
    return;
  }

  const beforeMap = snapshotCardZones();
  const movedIds = next ? [] : discardGreatVoidCards(owner);
  state.greatVoid[owner] = next;

  renderGreatVoidLayouts();
  renderBoard({
    zoneIds: collectAffectedZoneIds(movedIds, beforeMap, [
      ...getGreatVoidBenchZoneIds(owner),
      getOwnerHandZone(owner)
    ]),
    overlay: true,
    indicators: true,
    resources: true,
    winner: true,
    animations: true
  });

  if (movedIds.length > 0) {
    broadcastMoveSync(movedIds, beforeMap);
  }

  if (broadcast) {
    sendPeerAction({
      type: ACTION_TYPES.TOGGLE_GREAT_VOID,
      owner,
      enabled: next
    });
  }
}

function setCappedMapValue(map, key, value, maxSize) {
  if (!key) {
    return;
  }
  if (map.has(key)) {
    map.delete(key);
  }
  map.set(key, value);
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    if (typeof oldestKey === "undefined") {
      break;
    }
    map.delete(oldestKey);
  }
}

function setImageCacheStatus(url, ok) {
  setCappedMapValue(state.imageCache, url, !!ok, IMAGE_CACHE_LIMIT);
}

function setPlaceholderCacheValue(key, value) {
  setCappedMapValue(state.placeholderCache, key, value, PLACEHOLDER_CACHE_LIMIT);
}

function clearSelections(options = {}) {
  const { refresh = false } = options;
  state.selectedCardIds.clear();
  state.draggingCardIds = [];
  updateDraggingUi();
  if (refresh) {
    refreshSelectedCardClasses();
  }
}

function refreshSelectedCardClasses() {
  document.querySelectorAll(".card[data-card-id]").forEach((el) => {
    const cardId = Number(el.dataset.cardId);
    el.classList.toggle("selected", state.selectedCardIds.has(cardId));
  });
}

function updateDraggingUi() {
  document.body.classList.toggle("dragging-active", state.draggingCardIds.length > 0);
  document.querySelectorAll(".card[data-card-id]").forEach((el) => {
    const cardId = Number(el.dataset.cardId);
    el.classList.toggle("dragging-source", state.draggingCardIds.includes(cardId));
  });
  if (state.draggingCardIds.length === 0) {
    setDragCursorIndicatorVisible(false);
  }
}

function collectAffectedZoneIds(cardIds, beforeMap = null, extraZoneIds = []) {
  const zoneIds = new Set(Array.isArray(extraZoneIds) ? extraZoneIds.filter(Boolean) : []);
  cardIds.forEach((id) => {
    const numericId = Number(id);
    if (beforeMap && beforeMap.has(numericId)) {
      zoneIds.add(beforeMap.get(numericId));
    }
    const card = getCardById(numericId);
    if (card && card.zoneId) {
      zoneIds.add(card.zoneId);
    }
  });
  return [...zoneIds].filter(Boolean);
}

function normalizeRenderOptions(options = {}) {
  const zoneIds = Array.isArray(options.zoneIds)
    ? [...new Set(options.zoneIds.filter(Boolean))]
    : null;
  return {
    zoneIds,
    overlay: options.overlay !== false,
    indicators: options.indicators !== false,
    resources: options.resources !== false,
    winner: options.winner !== false,
    animations: options.animations !== false
  };
}

function mergeRenderOptions(base, incoming) {
  if (!base) {
    return normalizeRenderOptions(incoming);
  }
  const next = normalizeRenderOptions(incoming);
  return {
    zoneIds: base.zoneIds === null || next.zoneIds === null
      ? null
      : [...new Set([...base.zoneIds, ...next.zoneIds])],
    overlay: base.overlay || next.overlay,
    indicators: base.indicators || next.indicators,
    resources: base.resources || next.resources,
    winner: base.winner || next.winner,
    animations: base.animations || next.animations
  };
}

function renderBoardForMovedCards(beforeMap, movedIds, options = {}) {
  renderBoard({
    zoneIds: collectAffectedZoneIds(movedIds, beforeMap, options.extraZoneIds || []),
    overlay: true,
    indicators: true,
    resources: true,
    winner: true,
    animations: options.animations !== false
  });
}

function triggerDropEffects(targetZoneId, movedIds = []) {
  const target = document.getElementById(targetZoneId);
  if (target) {
    if (target.classList.contains("floating-stadium")) {
      target.classList.remove("stadium-ripple");
      void target.offsetWidth;
      target.classList.add("stadium-ripple");
      window.setTimeout(() => target.classList.remove("stadium-ripple"), 560);
    } else {
      target.classList.remove("drop-bounce");
      void target.offsetWidth;
      target.classList.add("drop-bounce");
      window.setTimeout(() => target.classList.remove("drop-bounce"), 380);
    }
  }

  if (!Array.isArray(movedIds) || movedIds.length === 0) {
    return;
  }

  window.requestAnimationFrame(() => {
    movedIds.forEach((cardId) => {
      const cardEl = document.querySelector(`.card[data-card-id="${cardId}"]`);
      if (!cardEl) {
        return;
      }
      cardEl.classList.remove("landed-flash", "landed-flash-active", "landed-flash-bench");
      void cardEl.offsetWidth;
      if (ACTIVE_MAIN_ZONES.has(targetZoneId)) {
        cardEl.classList.add("landed-flash-active");
      } else if (isBenchMainZone(targetZoneId)) {
        cardEl.classList.add("landed-flash-bench");
      } else {
        cardEl.classList.add("landed-flash");
      }
      window.setTimeout(() => {
        cardEl.classList.remove("landed-flash", "landed-flash-active", "landed-flash-bench");
      }, 460);
      if (DISCARD_ZONES.has(targetZoneId)) {
        cardEl.classList.remove("discard-tail");
        void cardEl.offsetWidth;
        cardEl.classList.add("discard-tail");
        spawnDiscardTailGhost(cardEl);
        window.setTimeout(() => cardEl.classList.remove("discard-tail"), 720);
      }
    });
  });
}

function isRemotePublicPulseZone(zoneId) {
  if (!zoneId) {
    return false;
  }
  if (zoneId === "stadium") {
    return true;
  }
  if (DISCARD_ZONES.has(zoneId)) {
    return true;
  }
  if (isBattleOrBenchMainZone(zoneId) || /-attach$/.test(String(zoneId || "")) || isRevealZone(zoneId)) {
    return true;
  }
  return false;
}

function triggerRemotePublicPulse(targetZoneId, movedIds = []) {
  if (!isRemotePublicPulseZone(targetZoneId) || !Array.isArray(movedIds) || movedIds.length === 0) {
    return;
  }
  window.requestAnimationFrame(() => {
    movedIds.forEach((cardId) => {
      const cardEl = document.querySelector(`.card[data-card-id="${cardId}"]`);
      if (!cardEl) {
        return;
      }
      cardEl.classList.remove("remote-public-pulse");
      void cardEl.offsetWidth;
      cardEl.classList.add("remote-public-pulse");
      window.setTimeout(() => cardEl.classList.remove("remote-public-pulse"), 620);
    });
  });
}

function spawnDiscardTailGhost(cardEl) {
  if (!(cardEl instanceof HTMLElement)) {
    return;
  }
  const rect = cardEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }
  const ghost = document.createElement("div");
  ghost.className = "discard-tail-ghost";
  ghost.innerHTML = '<span class="discard-tail-streak"></span>';
  const ghostWidth = rect.width * 1.08;
  const ghostHeight = rect.height * 1.85;
  ghost.style.left = `${rect.left - (ghostWidth - rect.width) / 2}px`;
  ghost.style.top = `${rect.top - rect.height * 0.12}px`;
  ghost.style.width = `${ghostWidth}px`;
  ghost.style.height = `${ghostHeight}px`;
  document.body.appendChild(ghost);
  window.setTimeout(() => ghost.remove(), 760);
}

function normalizeIncomingCardIds(rawCardIds) {
  const unique = [...new Set(rawCardIds)];
  return unique
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id))
    .map((id) => getCardById(id))
    .filter(Boolean);
}

function queueMoveAnimation(card, fromZoneId, toZoneId) {
  state.pendingAnimations.push({ card, fromZoneId, toZoneId });
}

function runMoveAnimations() {
  const queue = [...state.pendingAnimations];
  state.pendingAnimations.length = 0;

  queue.forEach((item, idx) => {
    const fromEl = getZoneElement(item.fromZoneId);
    const toEl = getZoneElement(item.toZoneId);
    if (!fromEl || !toEl) {
      return;
    }

    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();

    const ghost = document.createElement("div");
    const showFront = canViewerSeeCardFront(item.card, item.toZoneId);
    ghost.className = `card move-ghost ${showFront ? "front" : "back"}`;
    ghost.classList.add(item.card.owner === "player1" ? "owner-player1" : "owner-opponent");
    const ghostArt = document.createElement("img");
    ghostArt.className = "card-art";
    ghostArt.alt = showFront ? (item.card.name || `Card ${item.card.id}`) : "Card Back";
    ghostArt.src = showFront ? resolvePreferredImageUrl(item.card) : getCardBackImageUrl();
    ghost.appendChild(ghostArt);
    ghost.style.left = `${a.left + a.width / 2 - 28}px`;
    ghost.style.top = `${a.top + a.height / 2 - 38}px`;
    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      setTimeout(() => {
        ghost.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px)`;
      }, idx * 30);
    });

    setTimeout(() => ghost.remove(), 360 + idx * 30);
  });
}

function triggerShuffleAnimation(deckZoneId) {
  const deckZone = document.getElementById(deckZoneId);
  const deckCard = deckZone ? deckZone.querySelector(".card") : null;
  if (!deckCard) {
    return;
  }

    if (deckZone) {
      deckZone.classList.remove("shuffle-shake-zone");
      void deckZone.offsetWidth;
      deckZone.classList.add("shuffle-shake-zone");
    }
    deckCard.classList.remove("shuffle-shake", "shuffle-cut-a", "shuffle-cut-b");
    void deckCard.offsetWidth;
    deckCard.classList.add("shuffle-shake");
    deckCard.classList.add(Math.random() > 0.5 ? "shuffle-cut-a" : "shuffle-cut-b");
    setTimeout(() => {
      deckCard.classList.remove("shuffle-shake", "shuffle-cut-a", "shuffle-cut-b");
      if (deckZone) {
        deckZone.classList.remove("shuffle-shake-zone");
      }
  }, 1100);
}

function cleanupDragPreview() {
  // 不移除 drag preview 元素，保持在 DOM 中避免 Chromium 內部引用已銷毀元素導致崩潰
  // 元素本身是 1x1 透明 GIF，位於畫面外 (top:-9999px)，不影響顯示
}

function clearRetainedImageHandles() {
  runtime.preloadedImageHandles.clear();
}

function ensureDragCursorIndicator() {
  if (state.dragCursorIndicatorEl && state.dragCursorIndicatorEl.parentElement) {
    return state.dragCursorIndicatorEl;
  }
  const el = document.createElement("div");
  el.className = "drag-cursor-indicator";
  el.innerHTML = '<span class="drag-cursor-core"></span><span class="drag-cursor-ring"></span>';
  document.body.appendChild(el);
  state.dragCursorIndicatorEl = el;
  return el;
}

function updateDragCursorIndicatorPosition(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return;
  }
  const el = ensureDragCursorIndicator();
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function setDragCursorIndicatorVisible(visible) {
  const el = ensureDragCursorIndicator();
  el.classList.toggle("visible", Boolean(visible));
}

function getSafeDragImage() {
  if (state.dragPreviewEl && state.dragPreviewEl.parentElement) {
    return state.dragPreviewEl;
  }
  const img = new Image();
  img.width = 1;
  img.height = 1;
  img.alt = "";
  img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  img.style.cssText = "position:fixed;top:-9999px;left:-9999px;pointer-events:none;";
  document.body.appendChild(img);
  state.dragPreviewEl = img;
  return img;
}

function applySafeDragImage(event) {
  const dataTransfer = event && event.dataTransfer;
  if (!dataTransfer || typeof dataTransfer.setDragImage !== "function") {
    return;
  }
  try {
    dataTransfer.setDragImage(getSafeDragImage(), 14, 14);
  } catch {
    // Electron/Chromium may fail here intermittently; keep native drag behavior.
  }
}

function hideStatusMenu() {
  const menu = document.getElementById("status-context-menu");
  if (!menu) {
    return;
  }

  state.statusMenu.isOpen = false;
  state.statusMenu.cardId = null;
  state.statusMenu.zoneId = null;
  menu.classList.add("hidden");
}

function showStatusMenu(cardId, zoneId, x, y) {
  const menu = document.getElementById("status-context-menu");
  if (!menu) {
    return;
  }

  const statusControls = menu.querySelector(".status-controls");
  if (statusControls) {
    statusControls.classList.toggle("hidden", !isActiveMainZone(zoneId));
  }

  state.statusMenu.isOpen = true;
  state.statusMenu.cardId = cardId;
  state.statusMenu.zoneId = zoneId;
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.classList.remove("hidden");
}

function applyStatusAction(card, action) {
  if (!card) {
    return;
  }
  const zoneId = card.zoneId;

  if (action === "recover") {
    resetBattleState(card);
    renderBoard({ zoneIds: [zoneId], overlay: false });
    broadcastCardStats(card);
    return;
  }

  if (action === "poison") {
    card.poison = true;
    renderBoard({ zoneIds: [zoneId], overlay: false });
    broadcastCardStats(card);
    return;
  }

  if (action === "burn") {
    card.burn = true;
    renderBoard({ zoneIds: [zoneId], overlay: false });
    broadcastCardStats(card);
    return;
  }

  const behaviorMeta = BEHAVIOR_STATUS_META[action];
  if (!behaviorMeta) {
    return;
  }

  card.behaviorStatus = action;
  card.rotationDeg = behaviorMeta.rotation;
  renderBoard({ zoneIds: [zoneId], overlay: false });
  broadcastCardStats(card);
}

function moveExistingMainToAttach(mainZoneId, excludedIds) {
  const attach = UNIQUE_MAIN_TO_ATTACH[mainZoneId];
  if (!attach) {
    return;
  }

  getCardsInZone(mainZoneId)
    .filter((c) => !excludedIds.has(c.id))
    .forEach((c) => {
      if (ACTIVE_MAIN_ZONES.has(mainZoneId)) {
        resetBattleState(c);
      }
      moveCardToZone(c, attach);
    });
}

function moveToStadium(incomingCards) {
  incomingCards.forEach((incoming) => {
    getCardsInZone("stadium")
      .filter((c) => c.id !== incoming.id)
      .forEach((old) => moveCardToZone(old, getOwnerDiscardZone(old.owner)));

    moveCardToZone(incoming, "stadium");
    incoming.isFaceUp = true;
  });
}

function moveToUniqueMainZone(targetZoneId, incomingCards) {
  const attach = UNIQUE_MAIN_TO_ATTACH[targetZoneId];
  const existingMain = getCardsInZone(targetZoneId)[0] || null;
  const existingDamage = getZoneDamage(targetZoneId);
  const incomingIds = new Set(incomingCards.map((c) => c.id));
  moveExistingMainToAttach(targetZoneId, incomingIds);

  if (incomingCards.length === 0) {
    return;
  }

  const incomingFirst = incomingCards[0];
  const sourceIsBattleOrBench = isBattleOrBenchMainZone(incomingFirst.zoneId);
  if (sourceIsBattleOrBench) {
    transferZoneDamage(incomingFirst.zoneId, targetZoneId);
  } else if (existingMain) {
    setZoneDamage(targetZoneId, existingDamage);
  } else if (!existingMain) {
    clearZoneDamage(targetZoneId);
  }

  if (ACTIVE_MAIN_ZONES.has(targetZoneId)) {
    resetBattleState(incomingFirst);
  }

  moveCardToZone(incomingFirst, targetZoneId);
  incomingCards.slice(1).forEach((c) => moveCardToZone(c, attach));
}

function moveToPrizeZone(targetZoneId, incomingCards) {
  const incomingIds = new Set(incomingCards.map((c) => c.id));
  const existingCount = getCardsInZone(targetZoneId).filter((c) => !incomingIds.has(c.id)).length;
  const capacity = Math.max(0, 6 - existingCount);
  if (incomingCards.length > capacity) {
    showToast("獎勵卡最多放置六張", "warn", 1800);
  }

  incomingCards.slice(0, capacity).forEach((c) => moveCardToZone(c, targetZoneId));
}

function moveToGenericZone(targetZoneId, incomingCards) {
  incomingCards.forEach((c) => moveCardToZone(c, targetZoneId));
}

function moveCardsToDeckBottom(owner, incomingCards) {
  const deckZoneId = getOwnerDeckZone(owner);
  const incomingSet = new Set(incomingCards.map((card) => card.id));
  const existingDeckCards = getCardsInZone(deckZoneId).filter((card) => !incomingSet.has(card.id));

  incomingCards.forEach((card) => {
    moveCardToZone(card, deckZoneId);
    card.isFaceUp = false;
  });

  reorderDeck(owner, [...existingDeckCards, ...incomingCards]);
}

function getAttachZoneForMainZone(mainZoneId) {
  return UNIQUE_MAIN_TO_ATTACH[mainZoneId] || "";
}

function swapZoneCards(zoneA, zoneB) {
  const zoneACards = getCardsInZone(zoneA);
  const zoneBCards = getCardsInZone(zoneB);
  zoneACards.forEach((card) => moveCardToZone(card, zoneB));
  zoneBCards.forEach((card) => moveCardToZone(card, zoneA));
}

function broadcastZoneStats(zoneIds) {
  const uniqueZoneIds = [...new Set((zoneIds || []).filter((zoneId) => isBattleOrBenchMainZone(zoneId)))];
  if (uniqueZoneIds.length === 0) {
    return;
  }
  const updates = uniqueZoneIds.map((zoneId) => {
    const mainCard = getCardsInZone(zoneId)[0] || null;
    if (!mainCard) {
      return {
        zoneId,
        owner: getZoneOwner(zoneId),
        syncId: 0,
        damage: getZoneDamage(zoneId),
        poison: false,
        burn: false,
        behaviorStatus: "",
        rotationDeg: 0
      };
    }
    return {
      zoneId,
      owner: mainCard.owner,
      syncId: mainCard.syncId,
      damage: getZoneDamage(zoneId),
      poison: !!mainCard.poison,
      burn: !!mainCard.burn,
      behaviorStatus: mainCard.behaviorStatus || "",
      rotationDeg: mainCard.rotationDeg || 0
    };
  });
  sendPeerAction({ type: ACTION_TYPES.UPDATE_STATS, updates });
}

function tryHandleRetreatSwap(targetZoneId, movableCards) {
  if (movableCards.length === 0) {
    return false;
  }
  const owner = movableCards[0].owner;
  if (!isBattleOrBenchMainZone(targetZoneId) || getZoneOwner(targetZoneId) !== owner) {
    return false;
  }
  const sourceMain = movableCards.find((card) => isBattleOrBenchMainZone(card.zoneId) && getZoneOwner(card.zoneId) === owner);
  if (!sourceMain || sourceMain.zoneId === targetZoneId) {
    return false;
  }
  const sourceZone = sourceMain.zoneId;
  const sourceAttach = getAttachZoneForMainZone(sourceZone);
  const targetAttach = getAttachZoneForMainZone(targetZoneId);
  swapZoneDamage(sourceZone, targetZoneId);
  swapZoneCards(sourceZone, targetZoneId);
  if (sourceAttach && targetAttach) {
    swapZoneCards(sourceAttach, targetAttach);
  }
  return true;
}

function snapshotCardZones() {
  const map = new Map();
  cards.forEach((card) => {
    map.set(card.id, card.zoneId);
  });
  return map;
}

function collectMovedCardIds(beforeMap) {
  const moved = [];
  cards.forEach((card) => {
    if (beforeMap.get(card.id) !== card.zoneId) {
      moved.push(card.id);
    }
  });
  return moved;
}

function handleDrop(targetZoneId, rawCardIds) {
  const beforeMap = snapshotCardZones();
  const incomingCards = normalizeIncomingCardIds(rawCardIds);
  const movableCards = incomingCards.filter((c) => isCardMovableByViewer(c) && isDropAllowedForCard(c, targetZoneId));

  if (movableCards.length === 0) {
    return;
  }
  logRendererDiagnostic("drop", {
    seq: runtime.diagnosticDragSeq,
    targetZoneId,
    cardIds: movableCards.map((card) => card.id)
  });
  clearLatestHighlights();

  if (tryHandleRetreatSwap(targetZoneId, movableCards)) {
    const movedIds = collectMovedCardIds(beforeMap);
    clearSelections({ refresh: true });
    renderBoardForMovedCards(beforeMap, movedIds);
    triggerDropEffects(targetZoneId, movedIds);
    broadcastMoveSync(movedIds, beforeMap);
    broadcastZoneStats([targetZoneId, ...movableCards.map((card) => beforeMap.get(card.id) || card.zoneId)]);
    return;
  }

  movableCards.forEach((c) => {
    const fromDeck = c.zoneId === getOwnerDeckZone(c.owner) || state.overlay.type === "library";
    if (fromDeck && !PRIZE_ZONES.has(targetZoneId) && targetZoneId !== "library-view") {
      c.isFaceUp = true;
    }
  });

  if (targetZoneId === "stadium") {
    moveToStadium(movableCards);
    const movedIds = collectMovedCardIds(beforeMap);
    clearSelections({ refresh: true });
    renderBoardForMovedCards(beforeMap, movedIds);
    triggerDropEffects(targetZoneId, movedIds);
    broadcastMoveSync(movedIds, beforeMap);
    broadcastZoneStats(movableCards.map((card) => beforeMap.get(card.id)));
    return;
  }

  if (UNIQUE_MAIN_TO_ATTACH[targetZoneId]) {
    moveToUniqueMainZone(targetZoneId, movableCards);
    const movedIds = collectMovedCardIds(beforeMap);
    clearSelections({ refresh: true });
    renderBoardForMovedCards(beforeMap, movedIds);
    triggerDropEffects(targetZoneId, movedIds);
    broadcastMoveSync(movedIds, beforeMap);
    broadcastZoneStats([
      targetZoneId,
      ...movableCards.map((card) => beforeMap.get(card.id)),
      ...movableCards.map((card) => card.zoneId)
    ]);
    return;
  }

  if (PRIZE_ZONES.has(targetZoneId)) {
    moveToPrizeZone(targetZoneId, movableCards);
    const movedIds = collectMovedCardIds(beforeMap);
    clearSelections({ refresh: true });
    renderBoardForMovedCards(beforeMap, movedIds);
    triggerDropEffects(targetZoneId, movedIds);
    broadcastMoveSync(movedIds, beforeMap);
    broadcastZoneStats(movableCards.map((card) => beforeMap.get(card.id)));
    return;
  }

  if (isDeckBottomZone(targetZoneId)) {
    const owner = getZoneOwner(targetZoneId);
    moveCardsToDeckBottom(owner, movableCards);
    const movedIds = movableCards.map((card) => card.id);
    const zoneChangedIds = movedIds.filter((cardId) => beforeMap[cardId] !== getOwnerDeckZone(owner));
    clearSelections({ refresh: true });
    renderBoard({
      zoneIds: collectAffectedZoneIds(movedIds, beforeMap, [getOwnerDeckZone(owner), targetZoneId]),
      overlay: true,
      indicators: true,
      resources: true,
      winner: true,
      animations: true
    });
    triggerDropEffects(getOwnerDeckZone(owner), movedIds);
    if (zoneChangedIds.length > 0) {
      broadcastMoveSync(zoneChangedIds, beforeMap);
    }
    broadcastZoneStats(movableCards.map((card) => beforeMap.get(card.id)));
    sendPeerAction({
      type: ACTION_TYPES.SHUFFLE,
      owner,
      order: getCardsInZone(getOwnerDeckZone(owner)).map((card) => card.syncId)
    });
    return;
  }

  if (targetZoneId === "library-view" || targetZoneId === "discard-view") {
    clearSelections({ refresh: true });
    renderBoard({ zoneIds: [], overlay: true, indicators: false, resources: false, winner: false, animations: false });
    return;
  }

  moveToGenericZone(targetZoneId, movableCards);
  const movedIds = collectMovedCardIds(beforeMap);
  clearSelections({ refresh: true });
  renderBoardForMovedCards(beforeMap, movedIds);
  triggerDropEffects(targetZoneId, movedIds);
  broadcastMoveSync(movedIds, beforeMap);
  broadcastZoneStats(movableCards.map((card) => beforeMap.get(card.id)));
}

function toggleCardSelected(cardId) {
  const card = getCardById(cardId);
  if (!card || !isCardMovableByViewer(card)) {
    return;
  }

  if (state.selectedCardIds.has(cardId)) {
    state.selectedCardIds.delete(cardId);
  } else {
    state.selectedCardIds.add(cardId);
  }

  if (state.overlay.isOpen) {
    refreshSelectedCardClasses();
    return;
  }

  refreshSelectedCardClasses();
}

function createCardElement(card, options = {}) {
  const {
    forceBack = false,
    zoneId = card.zoneId,
    allowDrag = true,
    selectable = true,
    addMoveClass = false
  } = options;

  const shouldShowFront = !forceBack && canViewerSeeCardFront(card, zoneId);
  const canDrag = allowDrag && isCardMovableByViewer(card);
  const hasDamageControls = isBattleOrBenchMainZone(zoneId);

  const el = document.createElement("div");
  el.className = `card ${shouldShowFront ? "front" : "back"}`;
  if (addMoveClass) {
    el.classList.add("moving");
  }

  if (ACTIVE_MAIN_ZONES.has(zoneId) && card.rotationDeg !== 0) {
    el.style.transform = `rotate(${card.rotationDeg}deg)`;
  }
  if (state.damageShakeIds.has(zoneId)) {
    el.classList.add("damage-shake");
  }

  el.classList.add(card.owner === "player1" ? "owner-player1" : "owner-opponent");
  el.dataset.cardId = String(card.id);
  el.draggable = canDrag;

  const label = document.createElement("div");
  label.className = "card-label";
  label.textContent = "";
  if (shouldShowFront) {
    const refs = getImageSourcesForCard(card);
    const art = document.createElement("img");
    art.className = "card-art";
    art.alt = card.name || `Card ${card.id}`;
    art.draggable = false;
    art.loading = "eager";
    art.decoding = "sync";
    art.dataset.fallbackStage = "primary";
    art.src = resolvePreferredImageUrl(card);
    art.onload = () => {
      refs.activeUrl = art.currentSrc || art.src;
      if (refs.activeUrl) {
        setImageCacheStatus(refs.activeUrl, true);
      }
      syncDeckImageRefsFromCard(card);
    };
    art.onerror = () => {
      const current = art.currentSrc || art.src;
      if (current) {
        setImageCacheStatus(current, false);
      }
      if (art.dataset.fallbackStage === "primary" && refs.secondary) {
        art.dataset.fallbackStage = "secondary";
        art.src = refs.secondary;
        return;
      }
      if (art.dataset.fallbackStage !== "placeholder") {
        art.dataset.fallbackStage = "placeholder";
        if (!refs.placeholder) {
          refs.placeholder = createPlaceholderDataUrl(card);
        }
        art.src = refs.placeholder;
      }
      syncDeckImageRefsFromCard(card);
    };
    el.appendChild(art);
  } else {
    const backArt = document.createElement("img");
    backArt.className = "card-art";
    backArt.alt = "Card Back";
    backArt.draggable = false;
    backArt.src = getCardBackImageUrl();
    el.appendChild(backArt);
  }
  el.appendChild(label);

  if (hasDamageControls) {
    el.addEventListener("wheel", (event) => {
      event.preventDefault();
      adjustCardDamage(card, event.deltaY < 0 ? 10 : -10, zoneId);
      renderBoard({ zoneIds: [zoneId], overlay: false });
    }, { passive: false });
  }

  if (state.selectedCardIds.has(card.id)) {
    el.classList.add("selected");
  }
  const latestIds = Array.isArray(state.latestCardByZone[zoneId]) ? state.latestCardByZone[zoneId] : [];
  if (latestIds.includes(card.id)) {
    el.classList.add("latest-card");
  }

  if (selectable) {
    el.addEventListener("click", (event) => {
      hideDeckMenu();
      hideStatusMenu();
      event.stopPropagation();
      toggleCardSelected(card.id);
    });
  }

  if (shouldShowFront) {
    el.addEventListener("mouseenter", (event) => {
      state.hoveredCardId = card.id;
      if (!state.zoomPinned) {
        showCardZoom(card, { x: event.clientX, y: event.clientY });
      }
    });
    el.addEventListener("mousemove", (event) => {
      if (!state.zoomPinned && state.hoveredCardId === card.id) {
        showCardZoom(card, { x: event.clientX, y: event.clientY });
      }
    });
    el.addEventListener("mouseleave", () => {
      if (state.hoveredCardId === card.id) {
        state.hoveredCardId = null;
      }
      if (!state.zoomPinned) {
        hideCardZoom();
      }
    });
  }

  if (hasDamageControls) {
    el.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showStatusMenu(card.id, zoneId, event.clientX, event.clientY);
    });
  }

  el.addEventListener("dragstart", (event) => {
    hideDeckMenu();
    hideStatusMenu();
    hideCardZoom();

    if (!canDrag) {
      event.preventDefault();
      return;
    }

    const dragIds = state.selectedCardIds.has(card.id)
      ? [...state.selectedCardIds].filter((id) => {
        const selected = getCardById(id);
        return selected && isCardMovableByViewer(selected);
      })
      : [card.id];

    if (dragIds.length === 0) {
      event.preventDefault();
      return;
    }

    state.draggingCardIds = dragIds;
    runtime.diagnosticDragSeq += 1;
    logRendererDiagnostic("dragstart-card", {
      seq: runtime.diagnosticDragSeq,
      cardId: card.id,
      syncId: card.syncId,
      zoneId,
      owner: card.owner,
      selectedCount: dragIds.length
    });
    updateDraggingUi();
    updateDragCursorIndicatorPosition(event.clientX, event.clientY);
    setDragCursorIndicatorVisible(true);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/json", JSON.stringify(dragIds));
    event.dataTransfer.setData("text/plain", dragIds.join(","));
    applySafeDragImage(event);
  });

  el.addEventListener("dragend", () => {
    logRendererDiagnostic("dragend-card", {
      seq: runtime.diagnosticDragSeq,
      cardId: card.id,
      zoneId,
      owner: card.owner
    });
    state.draggingCardIds = [];
    updateDraggingUi();
    setDragCursorIndicatorVisible(false);
    cleanupDragPreview();
    hideCardZoom();
    // 補回拖曳期間延遲的 overlay 重新渲染
    if (runtime.overlayRenderPending) {
      runtime.overlayRenderPending = false;
      requestAnimationFrame(() => renderOverlayView());
    }
  });

  return el;
}

function renderPrizeZone(zone, zoneCards) {
  zoneCards.slice(0, 6).forEach((card) => {
    zone.appendChild(createCardElement(card, { zoneId: zone.id, addMoveClass: true }));
  });
}

function renderHandLikeZone(zone, zoneCards) {
  const rootStyles = getComputedStyle(document.documentElement);
  const cardWidth = parseFloat(rootStyles.getPropertyValue("--hand-card-w")) || 56;
  const sideReserve = 6;
  const isActualHandZone = shouldStackHandZone(zone.id);
  const displayGroups = isActualHandZone ? groupHandCardsForDisplay(zoneCards) : zoneCards.map((card) => ({ key: `card-${card.id}`, cards: [card] }));
  const availableWidth = Math.max(0, zone.clientWidth - sideReserve * 2);
  const naturalWidth = displayGroups.length * cardWidth;
  let overlap = 0;

  if (displayGroups.length > 1 && availableWidth > 0 && naturalWidth > availableWidth) {
    const halfCover = Math.floor(cardWidth / 2);
    const requiredOverlap = Math.ceil((naturalWidth - availableWidth) / (displayGroups.length - 1));
    overlap = Math.max(halfCover, requiredOverlap);
    overlap = Math.min(overlap, cardWidth - 2);
  }

  zone.style.justifyContent = "center";
  zone.style.flexWrap = "nowrap";
  zone.style.alignItems = "flex-end";

  displayGroups.forEach((group, idx) => {
    const visibleCards = group.cards.length > 4 ? group.cards.slice(0, 4) : group.cards;
    const wrapper = document.createElement("div");
    wrapper.className = group.cards.length > 1 ? "hand-stack-group" : "hand-single-group";
    wrapper.style.marginLeft = idx === 0 ? "0px" : `${-overlap}px`;
    wrapper.style.zIndex = String(idx + 1);
    wrapper.style.height = group.cards.length > 1
      ? `calc(var(--hand-card-h) + ${(visibleCards.length - 1) * 12}px)`
      : "var(--hand-card-h)";

    visibleCards.forEach((card, cardIdx) => {
      const cardEl = createCardElement(card, {
        zoneId: zone.id,
        forceBack: !canViewerSeeCardFront(card, zone.id),
        addMoveClass: true
      });
      if (group.cards.length > 1) {
        cardEl.classList.add("stacked-hand-card");
        cardEl.style.bottom = `${(visibleCards.length - 1 - cardIdx) * 12}px`;
        cardEl.style.zIndex = String(cardIdx + 1);
      }
      wrapper.appendChild(cardEl);
    });

    if (group.cards.length > 4) {
      const countBadge = document.createElement("span");
      countBadge.className = "hand-stack-count";
      countBadge.textContent = String(group.cards.length);
      wrapper.appendChild(countBadge);
    }

    zone.appendChild(wrapper);
  });
}

function buildHandGroupKey(card) {
  return [
    String(card.name || "").trim(),
    normalizeSeries(card.series || ""),
    normalizeCardNumber(card.number || ""),
    String(card.cardType || "").trim(),
    String(card.elementType || "").trim()
  ].join("|");
}

function groupHandCardsForDisplay(zoneCards) {
  const groups = [];
  const byKey = new Map();
  zoneCards.forEach((card) => {
    const key = buildHandGroupKey(card);
    if (!byKey.has(key)) {
      const next = { key, cards: [] };
      byKey.set(key, next);
      groups.push(next);
    }
    byKey.get(key).cards.push(card);
  });
  return groups;
}

function sortDeckOverlayCards(cardsInSource) {
  const groups = new Map();
  const orderedKeys = [];
  cardsInSource.forEach((card, index) => {
    const key = buildHandGroupKey(card);
    if (!groups.has(key)) {
      groups.set(key, []);
      orderedKeys.push(key);
    }
    groups.get(key).push({ card, index });
  });
  return orderedKeys
    .sort((a, b) => {
      const groupA = groups.get(a) || [];
      const groupB = groups.get(b) || [];
      const cardA = groupA[0]?.card;
      const cardB = groupB[0]?.card;
      const nameCompare = String(cardA?.name || "").localeCompare(String(cardB?.name || ""), "zh-Hant");
      if (nameCompare !== 0) {
        return nameCompare;
      }
      const seriesCompare = normalizeSeries(cardA?.series || "").localeCompare(normalizeSeries(cardB?.series || ""), "en");
      if (seriesCompare !== 0) {
        return seriesCompare;
      }
      return normalizeCardNumber(cardA?.number || "").localeCompare(normalizeCardNumber(cardB?.number || ""), "en");
    })
    .flatMap((key) => (groups.get(key) || []).sort((a, b) => a.index - b.index).map((item) => item.card));
}

function clearZoneCards(zoneId) {
  const zone = getZoneElement(zoneId);
  if (!zone) {
    return null;
  }
  zone.querySelectorAll(".card, .hand-stack-group, .hand-single-group").forEach((el) => el.remove());
  return zone;
}

function renderZone(zoneId) {
  const zone = clearZoneCards(zoneId);
  if (!zone) {
    return;
  }

  const zoneCards = getCardsInZone(zoneId);

  if (zone.classList.contains("deck-zone")) {
    zone.dataset.count = String(zoneCards.length);
    if (zoneCards.length > 0) {
      zone.appendChild(createCardElement(zoneCards[0], {
        forceBack: true,
        allowDrag: false,
        selectable: false,
        zoneId,
        addMoveClass: true
      }));
    }
    return;
  }

  if (DISCARD_ZONES.has(zoneId)) {
    const ordered = [...zoneCards].sort((a, b) => (b.discardOrder || 0) - (a.discardOrder || 0));
    if (ordered.length > 0) {
      zone.appendChild(createCardElement(ordered[0], {
        zoneId,
        allowDrag: false,
        selectable: false,
        addMoveClass: true
      }));
    }
    return;
  }

  delete zone.dataset.count;

  if (PRIZE_ZONES.has(zoneId)) {
    renderPrizeZone(zone, zoneCards);
    return;
  }

  if (isHandLikeZone(zoneId)) {
    renderHandLikeZone(zone, zoneCards);
    return;
  }

  zoneCards.forEach((card) => {
    zone.appendChild(createCardElement(card, { zoneId, addMoveClass: true }));
  });
}

function renderOverlayCardsInBatches(overlayZone, cardsInSource, options, scrollSnapshot = null) {
  const batch = 16;
  let index = 0;
  const token = ++runtime.overlayRenderToken;
  overlayZone.innerHTML = "";

  const paint = () => {
    if (token !== runtime.overlayRenderToken || !state.overlay.isOpen) {
      return;
    }
    const frag = document.createDocumentFragment();
    const until = Math.min(index + batch, cardsInSource.length);
    for (; index < until; index += 1) {
      const card = cardsInSource[index];
      frag.appendChild(createCardElement(card, options(card)));
    }
    overlayZone.appendChild(frag);
    if (scrollSnapshot) {
      overlayZone.scrollTop = scrollSnapshot.top;
      overlayZone.scrollLeft = scrollSnapshot.left;
    }
    if (index < cardsInSource.length) {
      requestAnimationFrame(paint);
    }
  };
  requestAnimationFrame(paint);
}

function renderOverlayView() {
  const overlayRoot = document.getElementById("overlay-root");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayHint = document.getElementById("overlay-hint");
  const overlayZone = document.getElementById("overlay-zone");

  if (!overlayRoot || !overlayTitle || !overlayHint || !overlayZone) {
    return;
  }

  if (!state.overlay.isOpen) {
    runtime.overlayRenderToken += 1;
    hideWithAnimation(overlayRoot);
    overlayRoot.setAttribute("aria-hidden", "true");
    overlayZone.dataset.zoneId = "";
    overlayZone.innerHTML = "";
    overlayHint.classList.add("hidden");
    overlayHint.textContent = "";
    state.overlay.scrollTop = 0;
    state.overlay.scrollLeft = 0;
    return;
  }

  state.overlay.scrollTop = overlayZone.scrollTop;
  state.overlay.scrollLeft = overlayZone.scrollLeft;

  overlayRoot.classList.remove("hidden");
  overlayRoot.setAttribute("aria-hidden", "false");
  overlayRoot.classList.toggle("overlay-left", !!state.singlePlayer && state.overlay.owner === "opponent");

  const isOwnerViewer = state.singlePlayer || state.currentViewer === state.overlay.owner;
  const titleOwner = state.overlay.owner === "player1" ? "我方" : "對手";
  overlayTitle.textContent = state.overlay.type === "library" ? `${titleOwner}牌庫視窗` : `${titleOwner}棄牌區視窗`;

  overlayZone.dataset.zoneId = state.overlay.zoneId;
  overlayZone.innerHTML = "";

  if (!isOwnerViewer && state.overlay.type === "library") {
    overlayHint.classList.remove("hidden");
    overlayHint.textContent = "對手正在查看牌組";
    return;
  }

  overlayHint.classList.add("hidden");
  overlayHint.textContent = "";

  const sourceZone = state.overlay.type === "library"
    ? getOwnerDeckZone(state.overlay.owner)
    : getOwnerDiscardZone(state.overlay.owner);
  const cardsInSource = state.overlay.type === "library"
    ? sortDeckOverlayCards(getCardsInZone(sourceZone))
    : getCardsInZone(sourceZone);
  renderOverlayCardsInBatches(overlayZone, cardsInSource, (card) => ({
    zoneId: state.overlay.zoneId,
    forceBack: state.overlay.type === "library" ? !isOwnerViewer : false,
    addMoveClass: true
  }), {
    top: state.overlay.scrollTop,
    left: state.overlay.scrollLeft
  });
}

function renderActiveZoneStatusIndicators() {
  ACTIVE_MAIN_ZONES.forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone) {
      return;
    }

    zone.querySelectorAll(".zone-status-indicators").forEach((el) => el.remove());
    const activeCard = getCardsInZone(zoneId)[0];
    if (!activeCard) {
      return;
    }

    const labels = getCardStatusLabels(activeCard);
    if (labels.length === 0) {
      return;
    }

    const badgeWrap = document.createElement("div");
    badgeWrap.className = "zone-status-indicators";

    labels.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "zone-status-chip";
      chip.textContent = label;
      badgeWrap.appendChild(chip);
    });

    zone.appendChild(badgeWrap);
  });
}

function renderZoneDamageIndicators() {
  MAIN_BATTLE_BENCH_ZONES.forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone) {
      return;
    }

    zone.querySelectorAll(".zone-damage-indicator, .zone-type-hint").forEach((el) => el.remove());
    const mainCard = getCardsInZone(zoneId)[0];
    if (!mainCard || getZoneDamage(zoneId) <= 0) {
      return;
    }

    const badge = document.createElement("div");
    badge.className = "zone-damage-indicator";
    badge.textContent = String(getZoneDamage(zoneId));
    zone.appendChild(badge);

    if (isActiveMainZone(zoneId)) {
      const hint = state.typeHintByZone[zoneId];
      if (hint && hint.text) {
        const hintEl = document.createElement("span");
        hintEl.className = `zone-type-hint ${hint.className || ""}`.trim();
        hintEl.textContent = hint.text;
        zone.appendChild(hintEl);
      }
    }
  });
}

function renderBoard(options = {}) {
  const renderOptions = normalizeRenderOptions(options);
  if (runtime.renderInProgress) {
    runtime.renderQueued = true;
    runtime.renderQueuedOptions = mergeRenderOptions(runtime.renderQueuedOptions, renderOptions);
    return;
  }
  runtime.renderInProgress = true;
  try {
    renderGreatVoidLayouts();
    const zoneIds = renderOptions.zoneIds || BOARD_ZONE_IDS;
    zoneIds.forEach((zoneId) => {
      renderZone(zoneId);
    });

    if (renderOptions.overlay) {
      // 拖曳進行中時延遲 overlay 重新渲染，避免被拖曳的 DOM 元素被銷毀導致 Chromium 崩潰
      if (state.draggingCardIds.length > 0 && state.overlay.isOpen) {
        runtime.overlayRenderPending = true;
      } else {
        runtime.overlayRenderPending = false;
        renderOverlayView();
      }
    }
    if (renderOptions.indicators) {
      updateActiveTypeHints();
      renderZoneDamageIndicators();
      renderActiveZoneStatusIndicators();
    }
    if (renderOptions.resources) {
      renderResourceMonitor();
    }
    if (renderOptions.winner) {
      checkWinnerByPrize();
    }
    if (renderOptions.animations) {
      runMoveAnimations();
    }
    if (!state.zoomPinned) {
      const hoveredVisible = state.hoveredCardId
        ? document.querySelector(`.card[data-card-id="${state.hoveredCardId}"]`)
        : null;
      if (!hoveredVisible) {
        hideCardZoom();
      }
    }
  } finally {
    runtime.renderInProgress = false;
    if (runtime.renderQueued) {
      const queuedOptions = runtime.renderQueuedOptions || {};
      runtime.renderQueued = false;
      runtime.renderQueuedOptions = null;
      requestAnimationFrame(() => renderBoard(queuedOptions));
    }
  }
}

function fisherYatesShuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reorderDeck(owner, orderedCards) {
  const deckZone = getOwnerDeckZone(owner);
  const ids = new Set(orderedCards.map((c) => c.id));
  const others = cards.filter((c) => c.zoneId !== deckZone);
  const untouchedDeck = cards.filter((c) => c.zoneId === deckZone && !ids.has(c.id));
  const rebuilt = [...others, ...orderedCards, ...untouchedDeck];

  cards.length = 0;
  rebuilt.forEach((c) => cards.push(c));
}

function drawCardFromDeck(owner, fromBottom = false) {
  const deckCards = getCardsInZone(getOwnerDeckZone(owner));
  if (deckCards.length === 0) {
    return null;
  }
  return fromBottom ? deckCards[deckCards.length - 1] : deckCards[0];
}

function openOverlay(type, owner) {
  state.overlay.isOpen = true;
  state.overlay.type = type;
  state.overlay.owner = owner;
  state.overlay.zoneId = type === "library" ? "library-view" : "discard-view";
  clearSelections();
  hideStatusMenu();
  renderOverlayView();
}

function closeOverlay() {
  state.overlay.isOpen = false;
  state.overlay.type = null;
  state.overlay.owner = null;
  state.overlay.zoneId = null;
  clearSelections();
  hideCardZoom();
  renderOverlayView();
}

function hideDeckMenu() {
  const menu = document.getElementById("deck-context-menu");
  if (!menu) {
    return;
  }

  state.deckMenu.isOpen = false;
  state.deckMenu.zoneId = null;
  menu.classList.add("hidden");
}

function showDeckMenu(zoneId) {
  const menu = document.getElementById("deck-context-menu");
  const zone = document.getElementById(zoneId);
  if (!menu) {
    return;
  }
  if (!zone) {
    return;
  }

  state.deckMenu.isOpen = true;
  state.deckMenu.zoneId = zoneId;
  menu.classList.remove("hidden");

  const rect = zone.getBoundingClientRect();
  const boardRect = document.getElementById("board-root")?.getBoundingClientRect();
  const mirrorOffset = boardRect ? (zoneId.startsWith("opponent-") ? -18 : 18) : 0;
  const menuX = rect.left + rect.width / 2 - menu.offsetWidth / 2 + mirrorOffset;
  const menuY = zoneId.startsWith("opponent-")
    ? rect.bottom + 8
    : rect.top - menu.offsetHeight - 8;
  menu.style.left = `${Math.max(8, menuX)}px`;
  menu.style.top = `${Math.max(8, menuY)}px`;
}

async function executeDeckAction(action, deckZoneId) {
  const owner = getZoneOwner(deckZoneId);
  if (owner === "neutral") {
    return;
  }
  if (runtime.deckActionInProgress && action !== "view-library") {
    return;
  }

  if (action === "shuffle") {
    const shuffled = fisherYatesShuffle(getCardsInZone(getOwnerDeckZone(owner)));
    reorderDeck(owner, shuffled);
    renderBoard();
    triggerShuffleAnimation(deckZoneId);
    appendGameLog(`${owner === "player1" ? "我方" : "對手"}牌組已洗牌`);
    sendPeerAction({
      type: ACTION_TYPES.SHUFFLE,
      owner,
      order: shuffled.map((c) => c.syncId)
    });
    return;
  }

  if (action === "view-library") {
    hideDeckMenu();
    openOverlay("library", owner);
    return;
  }

  const topCard = drawCardFromDeck(owner, false);

  if (action === "draw" && topCard) {
    runtime.deckActionInProgress = true;
    const beforeMap = snapshotCardZones();
    clearLatestHighlights();
    await animateMoveSingleCard(topCard, getOwnerHandZone(owner), { faceUp: true, delayMs: 150 });
    appendGameLog(`${owner === "player1" ? "我方" : "對手"}抽 1 張手牌`);
    broadcastMoveSync([topCard.id], beforeMap);
    runtime.deckActionInProgress = false;
    return;
  }

  if (action === "to-prize" && topCard) {
    const prizeZone = getOwnerPrizeZone(owner);
    const prizeCount = getCardsInZone(prizeZone).length;
    if (prizeCount >= 6) {
      showToast("獎勵卡最多放置六張", "warn", 1800);
      return;
    }
    runtime.deckActionInProgress = true;
    const beforeMap = snapshotCardZones();
    clearLatestHighlights();
    await animateMoveSingleCard(topCard, prizeZone, { faceDown: true, delayMs: 150 });
    appendGameLog(`${owner === "player1" ? "我方" : "對手"}抽 1 張獎勵卡`);
    broadcastMoveSync([topCard.id], beforeMap);
    runtime.deckActionInProgress = false;
    return;
  }

  if (action === "setup-prize-six") {
    const prizeZone = getOwnerPrizeZone(owner);
    const prizeCount = getCardsInZone(prizeZone).length;
    const slotsLeft = Math.max(0, 6 - prizeCount);
    if (slotsLeft <= 0) {
      showToast("獎勵卡最多放置六張", "warn", 1800);
      return;
    }
    const drawCards = getCardsInZone(getOwnerDeckZone(owner)).slice(0, slotsLeft);
    if (drawCards.length === 0) {
      return;
    }
    runtime.deckActionInProgress = true;
    const beforeMap = snapshotCardZones();
    clearLatestHighlights();
    for (const card of drawCards) {
      await animateMoveSingleCard(card, prizeZone, { faceDown: true, delayMs: 150 });
    }
    appendGameLog(`${owner === "player1" ? "我方" : "對手"}放置 ${drawCards.length} 張獎勵卡`);
    broadcastMoveSync(drawCards.map((card) => card.id), beforeMap);
    runtime.deckActionInProgress = false;
    return;
  }

  if (action === "to-temp" && topCard) {
    runtime.deckActionInProgress = true;
    const beforeMap = snapshotCardZones();
    clearLatestHighlights();
    await animateMoveSingleCard(topCard, getOwnerTempZone(owner), { faceUp: true, delayMs: 150 });
    broadcastMoveSync([topCard.id], beforeMap);
    runtime.deckActionInProgress = false;
    return;
  }

  if (action === "to-reveal" && topCard) {
    runtime.deckActionInProgress = true;
    const beforeMap = snapshotCardZones();
    clearLatestHighlights();
    await animateMoveSingleCard(topCard, getOwnerRevealZone(owner), { faceUp: true, delayMs: 150 });
    broadcastMoveSync([topCard.id], beforeMap);
    runtime.deckActionInProgress = false;
    return;
  }

}

function setupDropzones() {
  BOARD_ZONE_IDS.forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone || zone.dataset.dropReady === "true") {
      return;
    }

    zone.dataset.dropReady = "true";
    zone.dataset.dragDepth = "0";

    zone.addEventListener("dragenter", (event) => {
      const dragCards = normalizeIncomingCardIds(state.draggingCardIds);
      const hasAllowed = dragCards.some((card) => isCardMovableByViewer(card) && isDropAllowedForCard(card, zoneId));
      if (!hasAllowed) {
        return;
      }
      event.preventDefault();
      const depth = Number(zone.dataset.dragDepth || "0") + 1;
      zone.dataset.dragDepth = String(depth);
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragover", (event) => {
      const dragCards = normalizeIncomingCardIds(state.draggingCardIds);
      const hasAllowed = dragCards.some((card) => isCardMovableByViewer(card) && isDropAllowedForCard(card, zoneId));
      if (!hasAllowed) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      const depth = Math.max(0, Number(zone.dataset.dragDepth || "0") - 1);
      zone.dataset.dragDepth = String(depth);
      if (depth === 0) {
        zone.classList.remove("drag-over");
      }
    });

    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.dataset.dragDepth = "0";
      zone.classList.remove("drag-over");

      let payloadIds = [];
      const rawPayload = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");

      if (rawPayload) {
        try {
          payloadIds = JSON.parse(rawPayload);
        } catch {
          payloadIds = rawPayload.split(",");
        }
      }

      if (!Array.isArray(payloadIds) || payloadIds.length === 0) {
        payloadIds = state.draggingCardIds;
      }

      state.draggingCardIds = [];
      handleDrop(zoneId, payloadIds);
      updateDraggingUi();
      setDragCursorIndicatorVisible(false);
      // 補回拖曳期間延遲的 overlay 重新渲染
      if (runtime.overlayRenderPending) {
        runtime.overlayRenderPending = false;
        requestAnimationFrame(() => renderOverlayView());
      }
    });
  });

  const overlayZone = document.getElementById("overlay-zone");
  if (!overlayZone || overlayZone.dataset.dropReady === "true") {
    return;
  }

  overlayZone.dataset.dropReady = "true";
  overlayZone.dataset.dragDepth = "0";

  overlayZone.addEventListener("dragenter", (event) => {
    if (!state.overlay.isOpen || !state.overlay.zoneId) {
      return;
    }

    const dragCards = normalizeIncomingCardIds(state.draggingCardIds);
    const hasAllowed = dragCards.some((card) => isCardMovableByViewer(card) && isDropAllowedForCard(card, state.overlay.zoneId));
    if (!hasAllowed) {
      return;
    }

    event.preventDefault();
    const depth = Number(overlayZone.dataset.dragDepth || "0") + 1;
    overlayZone.dataset.dragDepth = String(depth);
    overlayZone.classList.add("drag-over");
  });

  overlayZone.addEventListener("dragover", (event) => {
    if (!state.overlay.isOpen || !state.overlay.zoneId) {
      return;
    }

    const dragCards = normalizeIncomingCardIds(state.draggingCardIds);
    const hasAllowed = dragCards.some((card) => isCardMovableByViewer(card) && isDropAllowedForCard(card, state.overlay.zoneId));
    if (!hasAllowed) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    overlayZone.classList.add("drag-over");
  });

  overlayZone.addEventListener("dragleave", () => {
    const depth = Math.max(0, Number(overlayZone.dataset.dragDepth || "0") - 1);
    overlayZone.dataset.dragDepth = String(depth);
    if (depth === 0) {
      overlayZone.classList.remove("drag-over");
    }
  });

  overlayZone.addEventListener("drop", (event) => {
    event.preventDefault();
    overlayZone.dataset.dragDepth = "0";
    overlayZone.classList.remove("drag-over");

    if (!state.overlay.isOpen || !state.overlay.zoneId) {
      return;
    }

    let payloadIds = [];
    const rawPayload = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");

    if (rawPayload) {
      try {
        payloadIds = JSON.parse(rawPayload);
      } catch {
        payloadIds = rawPayload.split(",");
      }
    }

    if (!Array.isArray(payloadIds) || payloadIds.length === 0) {
      payloadIds = state.draggingCardIds;
    }

    state.draggingCardIds = [];
    handleDrop(state.overlay.zoneId, payloadIds);
    updateDraggingUi();
    setDragCursorIndicatorVisible(false);
    // 補回拖曳期間延遲的 overlay 重新渲染
    if (runtime.overlayRenderPending) {
      runtime.overlayRenderPending = false;
      requestAnimationFrame(() => renderOverlayView());
    }
  });
}

function setupDeckMenu() {
  const deckZones = ["player1-deck", "opponent-deck"];
  const menu = document.getElementById("deck-context-menu");
  if (!menu) {
    return;
  }

  deckZones.forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone) {
      return;
    }

    const openFromEvent = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (state.selectedCardIds.size > 0) {
        clearSelections({ refresh: true });
      }

      const owner = getZoneOwner(zoneId);
      if (!state.singlePlayer && owner !== state.currentViewer) {
        return;
      }

      hideStatusMenu();
      showDeckMenu(zoneId);
    };

    zone.addEventListener("contextmenu", openFromEvent);
    zone.addEventListener("click", openFromEvent);
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
    const button = event.target.closest("button[data-action]");
    if (!button || !state.deckMenu.zoneId) {
      return;
    }

    void executeDeckAction(button.dataset.action, state.deckMenu.zoneId);
  });
}

function setupStatusMenu() {
  const menu = document.getElementById("status-context-menu");
  if (!menu) {
    return;
  }

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
    const btn = event.target.closest("button[data-action]");
    if (!btn || !state.statusMenu.cardId) {
      return;
    }

    const card = getCardById(state.statusMenu.cardId);
    if (!card) {
      return;
    }

    const action = btn.dataset.action;
    if (action === "damage-plus-10") {
      adjustCardDamage(card, 10, state.statusMenu.zoneId || card.zoneId);
      renderBoard({ zoneIds: [state.statusMenu.zoneId || card.zoneId], overlay: false });
      return;
    }
    if (action === "damage-minus-10") {
      adjustCardDamage(card, -10, state.statusMenu.zoneId || card.zoneId);
      renderBoard({ zoneIds: [state.statusMenu.zoneId || card.zoneId], overlay: false });
      return;
    }
    if (action === "damage-plus-100") {
      adjustCardDamage(card, 100, state.statusMenu.zoneId || card.zoneId);
      renderBoard({ zoneIds: [state.statusMenu.zoneId || card.zoneId], overlay: false });
      return;
    }
    if (action === "damage-minus-100") {
      adjustCardDamage(card, -100, state.statusMenu.zoneId || card.zoneId);
      renderBoard({ zoneIds: [state.statusMenu.zoneId || card.zoneId], overlay: false });
      return;
    }
    if (action === "quick-discard") {
      discardMainCardWithAttach(card);
      hideStatusMenu();
      return;
    }

    applyStatusAction(card, action);
    hideStatusMenu();
  });
}

function setupOverlayActions() {
  const closeBtn = document.getElementById("overlay-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideCardZoom();
      closeOverlay();
    });
  }

  ["player1-discard", "opponent-discard"].forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone) {
      return;
    }

    const openDiscard = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openOverlay("discard", getZoneOwner(zoneId));
    };

    zone.addEventListener("click", openDiscard);
    zone.addEventListener("contextmenu", openDiscard);
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") {
      return;
    }

    if (event.key.toLowerCase() === "z") {
      event.preventDefault();
      const targetCard = (state.hoveredCardId && getCardById(state.hoveredCardId))
        || (state.selectedCardIds.size > 0 && getCardById([...state.selectedCardIds][0]))
        || getActiveCard(state.currentViewer);
      if (!targetCard) {
        return;
      }
      state.zoomPinned = !state.zoomPinned;
      if (state.zoomPinned) {
        showCardZoom(targetCard);
      } else {
        hideCardZoom();
      }
      return;
    }

    let card = null;
    if (state.statusMenu.isOpen && state.statusMenu.cardId) {
      card = getCardById(state.statusMenu.cardId);
    }
    if (!card) {
      card = getActiveCard(state.currentViewer);
    }
    if (!card) {
      return;
    }

    const key = event.key.toLowerCase();
    const keyMap = {
      "1": "poison",
      "2": "burn",
      "3": "confused",
      "4": "paralyzed",
      "5": "asleep",
      "0": "recover"
    };

    const action = keyMap[key];
    if (!action) {
      return;
    }

    event.preventDefault();
    applyStatusAction(card, action);
  });
}

function setupGlobalInteractions() {
  document.addEventListener("dragstart", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(".card img, .card-label")) {
      event.preventDefault();
    }
  }, true);

  document.addEventListener("dragover", (event) => {
    if (state.draggingCardIds.length === 0) {
      return;
    }
    updateDragCursorIndicatorPosition(event.clientX, event.clientY);
    setDragCursorIndicatorVisible(true);
  });

  document.addEventListener("drop", () => {
    setDragCursorIndicatorVisible(false);
  });

  document.addEventListener("dragend", () => {
    setDragCursorIndicatorVisible(false);
  });

  window.addEventListener("error", (event) => {
    logRendererDiagnostic("window-error", {
      message: event.message || "",
      filename: event.filename || "",
      lineno: Number(event.lineno) || 0,
      colno: Number(event.colno) || 0
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event && "reason" in event ? event.reason : "";
    logRendererDiagnostic("unhandledrejection", {
      reason: reason instanceof Error ? (reason.stack || reason.message || String(reason)) : String(reason || "")
    });
  });

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (state.deckBuilder.importModalOpen) {
      return;
    }

    // Ignore global interaction reset logic when operating import/save UI.
    if (
      target.closest("#deck-import-panel") ||
      target.closest("#deck-import-toggle-btn") ||
      target.closest("#deck-builder-modal") ||
      target.closest("#deck-builder-import-modal") ||
      target.closest("#deck-builder-image-preview-modal") ||
      target.closest("#deck-builder-toggle-btn") ||
      target.closest("#deck-save-modal") ||
      target.closest("#deck-rename-modal") ||
      target.closest("#chat-modal") ||
      target.closest("#chat-toggle-btn") ||
      target.closest("#settings-modal") ||
      target.closest("#settings-btn") ||
      target.closest("#reset-confirm-modal")
    ) {
      return;
    }

    if (isDeckSaveModalOpen() || isDeckRenameModalOpen() || isSettingsModalOpen() || isResetConfirmModalOpen() || state.chat.isOpen || state.deckBuilder.isOpen) {
      if (!target.closest("#deck-save-modal")) {
        const modal = document.getElementById("deck-save-modal");
        if (modal) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
        setImagePreloadPaused(false);
      }
      if (!target.closest("#deck-rename-modal")) {
        closeDeckRenameModal();
      }
      if (!target.closest("#settings-modal")) {
        const modal = document.getElementById("settings-modal");
        if (modal) {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      }
      if (state.chat.isOpen && !target.closest("#chat-modal")) {
        closeChatModal();
      }
      if (state.deckBuilder.isOpen && !target.closest("#deck-builder-modal")) {
        closeDeckBuilderModal();
      }
      if (!target.closest("#reset-confirm-modal")) {
        resolveResetConfirm(false);
      }
      return;
    }

    if (!target.closest("#deck-context-menu") && !target.closest(".deck-zone")) {
      hideDeckMenu();
    }

    if (!target.closest("#status-context-menu") && !target.closest(".card")) {
      hideStatusMenu();
    }

    if (state.selectedCardIds.size > 0) {
      const isCard = !!target.closest(".card");
      const inDeckZone = !!target.closest(".deck-zone");
      const inMenu = !!target.closest("#deck-context-menu") || !!target.closest("#status-context-menu");
      if ((!isCard || inDeckZone) && !inMenu) {
        clearSelections({ refresh: true });
      }
    }

    if (state.overlay.isOpen) {
      const inOverlay = !!target.closest("#overlay-root");
      if (!inOverlay) {
        hideCardZoom();
        closeOverlay();
      }
    }
  }, true);

  let mouseMoveRafPending = false;
  document.addEventListener("mousemove", (event) => {
    if (mouseMoveRafPending) {
      return;
    }
    mouseMoveRafPending = true;
    requestAnimationFrame(() => {
      mouseMoveRafPending = false;
      if (state.zoomPinned) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        hideCardZoom();
        return;
      }
      if (!target.closest(".card") && !target.closest("#card-zoom")) {
        hideCardZoom();
      }
    });
  }, true);
}

function seedDemoState() {
  state.latestCardByZone = {};
  cards.length = 0;
  state.zoneDamage = {};
  state.typeHintByZone["player1-active"] = null;
  state.typeHintByZone["opponent-active"] = null;
  state.prizeCountSnapshot.player1 = null;
  state.prizeCountSnapshot.opponent = null;
}

async function applyDeckBuilderPayloadFromExternal(payload = {}) {
  const owner = payload && payload.owner === "opponent" ? "opponent" : "player1";
  const entries = normalizeDeckEntries(Array.isArray(payload.entries) ? payload.entries : []);
  const rawText = String(payload && payload.rawText ? payload.rawText : "").trim();
  await applyDeckEntriesForOwner(entries, owner, {
    broadcastImport: state.peer.multiplayerEnabled && owner === "player1",
    sourceText: rawText
  });
  const input = document.getElementById(owner === "player1" ? "deck-import-input-player1" : "deck-import-input-opponent");
  if (input) {
    input.value = rawText;
  }
  return { ok: true };
}

function initializeDeckBuilderWindowMode() {
  document.body.classList.add("deck-builder-window");
  document.title = "PTCG 牌組編輯器";
  setupDeckBuilder();
  initDeckLibrary();
  initModalAnimations();
  void openDeckBuilderModal();
}

/* ── 視窗動畫系統 ─────────────────────────────
   開啟：MutationObserver 偵測 hidden 移除
   關閉：各關閉函數直接呼叫 hideWithAnimation()
   ─────────────────────────────────────────── */
const _ANIM_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const _ANIM_SMOOTH = "cubic-bezier(0.22, 1, 0.36, 1)";
const _modalAnimConfigs = new Map(); // el → { panelSel, type }

function _clearAnims(el) { if (el) el.getAnimations().forEach(a => a.cancel()); }

const _OPEN_FX = {
  pop:     (p) => p.animate([{ opacity: 0, transform: "scale(0.85) translateY(24px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }],   { duration: 340, easing: _ANIM_SPRING, fill: "forwards" }),
  slide:   (p) => p.animate([{ opacity: 0, transform: "translateX(36px) translateY(-14px)" }, { opacity: 1, transform: "none" }],                { duration: 300, easing: _ANIM_SMOOTH, fill: "forwards" }),
  zoom:    (p) => p.animate([{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "scale(1)" }],                                   { duration: 320, easing: _ANIM_SPRING, fill: "forwards" }),
  gate:    (p) => p.animate([{ opacity: 0, transform: "scale(0.88) translateY(30px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }],    { duration: 380, easing: _ANIM_SPRING, fill: "forwards" }),
  overlay: (p) => p.animate([{ opacity: 0, transform: "scale(0.92) translateY(16px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }],   { duration: 280, easing: _ANIM_SPRING, fill: "forwards" }),
  panel:   (p) => p.animate([{ opacity: 0, transform: "translateY(-18px)" }, { opacity: 1, transform: "none" }],                                 { duration: 260, easing: _ANIM_SMOOTH, fill: "forwards" }),
};
const _CLOSE_FX = {
  pop:     (p) => p.animate([{ opacity: 1, transform: "scale(1) translateY(0)" }, { opacity: 0, transform: "scale(0.90) translateY(14px)" }],   { duration: 180, easing: "ease-in", fill: "forwards" }),
  slide:   (p) => p.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(32px) translateY(-10px)" }],                { duration: 160, easing: "ease-in", fill: "forwards" }),
  zoom:    (p) => p.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.80)" }],                                  { duration: 160, easing: "ease-in", fill: "forwards" }),
  overlay: (p) => p.animate([{ opacity: 1, transform: "scale(1) translateY(0)" }, { opacity: 0, transform: "scale(0.94) translateY(10px)" }],   { duration: 160, easing: "ease-in", fill: "forwards" }),
  panel:   (p) => p.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14px)" }],                                 { duration: 150, easing: "ease-in", fill: "forwards" }),
};

function _animateOpen(el, panelSel, type) {
  _clearAnims(el);
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease", fill: "forwards" });
  const panel = panelSel ? el.querySelector(panelSel) : null;
  if (panel && _OPEN_FX[type]) { _clearAnims(panel); _OPEN_FX[type](panel); }
}

/**
 * 帶關閉動畫的隱藏。取代 el.classList.add("hidden")。
 * 先播動畫，播完才真正 hidden。
 */
function hideWithAnimation(el) {
  if (!el || el.classList.contains("hidden")) { if (el) el.classList.add("hidden"); return; }
  const config = _modalAnimConfigs.get(el);
  if (!config) { el.classList.add("hidden"); return; }
  const { panelSel, type } = config;
  _clearAnims(el);
  const bAnim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" });
  const panel = panelSel ? el.querySelector(panelSel) : null;
  let pAnim = null;
  if (panel && _CLOSE_FX[type]) { _clearAnims(panel); pAnim = _CLOSE_FX[type](panel); }
  const onDone = () => {
    el.classList.add("hidden");   // 先隱藏（display:none）
    _clearAnims(el);              // 再清動畫（已 hidden，不會閃回）
    if (panel) _clearAnims(panel);
  };
  (pAnim || bAnim).onfinish = onDone;
}

/* ═══ 自訂下拉選單 (Custom Dropdown) ═══ */
function upgradeSelectToCustomDropdown(select) {
  if (!select || select.dataset.upgraded === "true") return;
  select.dataset.upgraded = "true";
  select.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "custom-dropdown";
  // 繼承原 select 的 flex/size 屬性
  if (select.style.flex) wrapper.style.flex = select.style.flex;
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-dropdown-trigger";
  wrapper.insertBefore(trigger, select);

  const list = document.createElement("div");
  list.className = "custom-dropdown-list";
  wrapper.appendChild(list);

  function getLabel() {
    const opt = select.options[select.selectedIndex];
    return opt ? opt.textContent : "";
  }

  function renderTrigger() {
    trigger.innerHTML = "";
    const span = document.createElement("span");
    span.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;";
    const labelText = getLabel() || "請選擇";
    span.textContent = labelText;
    trigger.title = labelText;
    trigger.appendChild(span);
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    trigger.appendChild(arrow);
    trigger.classList.toggle("filter-disabled", select.disabled);
  }

  function renderList() {
    list.innerHTML = "";
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dd-item";
      if (opt.value === select.value) item.classList.add("active");
      item.textContent = opt.textContent;
      item.title = opt.textContent;
      item.dataset.value = opt.value;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeList();
        renderTrigger();
      });
      list.appendChild(item);
    }
  }

  function closeList() {
    list.classList.remove("visible");
    trigger.classList.remove("open");
  }

  function toggleList() {
    if (select.disabled) return;
    const isOpen = list.classList.contains("visible");
    // 關閉其他所有 dropdown
    document.querySelectorAll(".custom-dropdown-list.visible").forEach((el) => {
      el.classList.remove("visible");
      const t = el.parentElement?.querySelector(".custom-dropdown-trigger");
      if (t) t.classList.remove("open");
    });
    if (!isOpen) {
      renderList();
      list.classList.add("visible");
      trigger.classList.add("open");
      // 確保列表不超出視窗
      requestAnimationFrame(() => {
        const rect = list.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom > vh - 8) {
          list.style.top = "auto";
          list.style.bottom = "calc(100% + 4px)";
        } else {
          list.style.top = "";
          list.style.bottom = "";
        }
      });
    }
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleList();
  });

  // 點擊外部關閉
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeList();
  });

  // 監聽原 select 的程式化 value 改變
  const origDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  let currentVal = select.value;
  const checkValueChange = () => {
    if (select.value !== currentVal) {
      currentVal = select.value;
      renderTrigger();
    }
  };
  // 用 MutationObserver 監聽 options 數量變化
  const observer = new MutationObserver(() => {
    renderTrigger();
  });
  observer.observe(select, { childList: true, subtree: true, attributes: true });
  // 定期同步（因為 .value 直接賦值沒有事件）
  setInterval(checkValueChange, 300);

  // disabled 監控
  const disabledObserver = new MutationObserver(() => {
    trigger.classList.toggle("filter-disabled", select.disabled);
    if (select.disabled) closeList();
  });
  disabledObserver.observe(select, { attributes: true, attributeFilter: ["disabled"] });

  renderTrigger();
  return wrapper;
}

function upgradeAllSelectsInContainer(container) {
  if (!container) return;
  container.querySelectorAll("select:not([data-upgraded])").forEach((sel) => {
    upgradeSelectToCustomDropdown(sel);
  });
}

function initModalAnimations() {
  const CONFIGS = [
    { id: "deck-save-modal",                    panelSel: ".deck-save-modal-panel",              type: "pop"     },
    { id: "deck-rename-modal",                  panelSel: ".deck-save-modal-panel",              type: "pop"     },
    { id: "settings-modal",                     panelSel: ".deck-save-modal-panel",              type: "pop"     },
    { id: "reset-confirm-modal",                panelSel: ".deck-save-modal-panel",              type: "pop"     },
    { id: "chat-modal",                         panelSel: ".deck-save-modal-panel",              type: "slide"   },
    { id: "deck-builder-modal",                 panelSel: ".deck-builder-modal-panel",           type: "pop"     },
    { id: "deck-builder-image-preview-modal",   panelSel: ".deck-builder-image-preview-panel",   type: "zoom"    },
    { id: "deck-builder-import-modal",          panelSel: ".deck-builder-import-panel",          type: "pop"     },
    { id: "overlay-root",                       panelSel: ".overlay-panel",                      type: "overlay" },
    { id: "mode-gate",                          panelSel: "#mode-gate-panel",                    type: "gate"    },
    { id: "deck-import-panel",                  panelSel: null,                                  type: "panel",  skipObserver: true },
  ];

  CONFIGS.forEach(({ id, panelSel, type, skipObserver }) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === "deck-builder-modal" && document.body.classList.contains("deck-builder-window")) return;

    // 註冊關閉動畫配置
    _modalAnimConfigs.set(el, { panelSel, type });

    // skipObserver 的元素只註冊關閉配置，不設 MutationObserver
    if (skipObserver) return;

    // 開啟動畫：偵測 hidden 被移除
    let wasHidden = el.classList.contains("hidden");
    new MutationObserver(() => {
      const isHidden = el.classList.contains("hidden");
      if (wasHidden && !isHidden) _animateOpen(el, panelSel, type);
      wasHidden = isHidden;
    }).observe(el, { attributes: true, attributeFilter: ["class"] });

    // mode-gate 一開始就是可見的，手動觸發開啟動畫
    if (id === "mode-gate" && !wasHidden) _animateOpen(el, panelSel, type);
  });

  // 右鍵選單（只有開啟動畫，關閉太快不需要）
  document.querySelectorAll(".context-menu").forEach(el => {
    let wasHidden = el.classList.contains("hidden");
    new MutationObserver(() => {
      const isHidden = el.classList.contains("hidden");
      if (wasHidden && !isHidden) {
        _clearAnims(el);
        el.animate(
          [{ opacity: 0, transform: "scale(0.8) translateY(-10px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }],
          { duration: 220, easing: _ANIM_SPRING, fill: "forwards" }
        );
      }
      wasHidden = isHidden;
    }).observe(el, { attributes: true, attributeFilter: ["class"] });
  });
}

function loadResolutionSetting() {
  if (!runtime.ipcRenderer) return;
  try {
    const saved = localStorage.getItem("ptcg.resolution");
    if (!saved || saved === "1600x960") return; // 預設值不需要調整
    let payload;
    if (saved === "fullscreen") {
      payload = { fullscreen: true };
    } else {
      const parts = saved.split("x");
      payload = { width: Number(parts[0]) || 1600, height: Number(parts[1]) || 960 };
    }
    runtime.ipcRenderer.invoke("set-resolution", payload).catch(() => {});
  } catch {}
}

function initializeMainApp() {
  loadBackgroundImageSetting();
  loadResolutionSetting();
  setupDropzones();
  setupDeckMenu();
  setupStatusMenu();
  setupOverlayActions();
  setupKeyboardShortcuts();
  setupImageImportActions();
  setupSettingsModal();
  setupImageRootSetting();
  setupChatModal();
  setupCoinTossControl();
  setupDeckImportPanel();
  setupDeckBuilder();
  setupAutoSetupControls();
  setupGreatVoidToggle();
  setupHandVisibilityToggle();
  setupReadyButton();
  initDeckLibrary();
  setGamePhase("準備中");
  setupMatchModeGate();
  void setupPeerNetworking(true);
  setupZoneBlankDrag();
  setupGlobalInteractions();
  updateAutoSetupButtonUi();
  updatePeerUiVisibility();
  renderBoard();
  initModalAnimations();
  // 升級主畫面的原生 select 為自訂下拉
  upgradeAllSelectsInContainer(document.getElementById("deck-import-panel"));
  upgradeAllSelectsInContainer(document.getElementById("mode-gate"));
}

seedDemoState();
if (IS_DECK_BUILDER_WINDOW) {
  initializeDeckBuilderWindowMode();
} else {
  initializeMainApp();
}

window.boardState = {
  cards,
  state,
  handleDrop,
  renderBoard,
  getCardImageUrl,
  preloadImages,
  getMemoryStats,
  importDeckFromInput,
  importDeckForOwner,
  applyDeckBuilderPayloadFromExternal,
  openDeckBuilderModal,
  openOverlay,
  closeOverlay,
  setViewer(viewer) {
    state.currentViewer = viewer;
    clearSelections();
    renderBoard();
  }
};
window.__applyDeckBuilderPayload = applyDeckBuilderPayloadFromExternal;
