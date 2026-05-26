const imageInput = document.querySelector("#imageInput");
const dropZone = document.querySelector("#dropZone");
const uploadState = document.querySelector("#uploadState");
const canvasWrap = document.querySelector("#canvasWrap");
const canvas = document.querySelector("#imageCanvas");
const resultCanvas = document.querySelector("#resultCanvas");
const faceLayer = document.querySelector("#faceLayer");
const statusText = document.querySelector("#statusText");
const typingText = document.querySelector("#typingText");
const coverButton = document.querySelector("#coverButton");
const uploadNewButton = document.querySelector("#uploadNewButton");
const addFaceButton = document.querySelector("#addFaceButton");
const previewAddFaceButton = document.querySelector("#previewAddFaceButton");
const originalPanel = document.querySelector(".original-panel");
const regenerateButton = document.querySelector("#regenerateButton");
const reselectButton = document.querySelector("#reselectButton");
const shareButton = document.querySelector("#shareButton");
const downloadButton = document.querySelector("#downloadButton");
const emojiGrid = document.querySelector("#emojiGrid");
const addEmojiButton = document.querySelector("#addEmojiButton");
const emojiPicker = document.querySelector("#emojiPicker");
const emojiSearch = document.querySelector("#emojiSearch");
const emojiCategoryTabs = document.querySelector("#emojiCategoryTabs");
const emojiSelectorGrid = document.querySelector("#emojiSelectorGrid");
const imageWorkspace = document.querySelector("#imageWorkspace");
const resultArea = document.querySelector("#resultArea");
const resultPanel = document.querySelector("#resultPanel");
const previewModal = document.querySelector("#previewModal");
const previewImageWrap = document.querySelector("#previewImageWrap");
const previewImage = document.querySelector("#previewImage");
const previewFaceLayer = document.querySelector("#previewFaceLayer");
const previewBackdrop = document.querySelector("#previewBackdrop");
const previewClose = document.querySelector("#previewClose");
const previewButtons = document.querySelectorAll("[data-preview-source]");
const themeButtons = document.querySelectorAll("[data-theme-button]");

const ctx = canvas.getContext("2d");
const resultCtx = resultCanvas.getContext("2d");
const FACE_TOOL_RAIL_WIDTH = 38;
const DRAG_THRESHOLD = 4;

const messages = {
  noFaces: "No faces were detected. Please try another image.",
  chooseEmoji: "Please select at least one emoji.",
  genericError: "Something went wrong. Please try again.",
  ready: "Your image is ready.",
};

const typingPhrases = [
  "cover anonymous faces with emojis.",
  "automatically find faces in crowded photos and add emojis.",
  "add emojis to your photos.",
  "add emojis in a cute, cool way.",
];

let selectedEmojis = new Set();
let currentObjectUrl = null;
let currentImage = null;
let detectedFaces = [];
let selectedFaceIds = new Set();
let imageCovered = false;
let addFaceMode = false;
let nextFaceId = 0;
let activePreviewSource = null;
let activeFaceDrag = null;
let faceRenderFrame = null;
let resizeFrame = null;

const emojiGroups = [
  {
    id: "smileys",
    label: "Smileys",
    items: [
      ["😀", "grinning smile happy face"],
      ["😃", "smiley happy face"],
      ["😄", "smile laugh happy"],
      ["😁", "beaming grin happy"],
      ["😆", "laugh squint face"],
      ["😅", "sweat smile relief"],
      ["🤣", "rolling floor laugh"],
      ["😂", "joy tears laugh"],
      ["🙂", "slight smile face"],
      ["🙃", "upside down face"],
      ["😉", "wink face"],
      ["😊", "blush smile happy"],
      ["😇", "halo angel face"],
      ["🥰", "hearts smiling love"],
      ["😍", "heart eyes love face"],
      ["🤩", "star eyes excited face"],
      ["😘", "kiss face"],
      ["😗", "kissing face"],
      ["😚", "closed eyes kiss"],
      ["😙", "smiling kiss"],
      ["😋", "yum tongue tasty"],
      ["😛", "tongue face"],
      ["😜", "wink tongue playful"],
      ["🤪", "zany silly face"],
      ["😝", "squint tongue face"],
      ["🤑", "money face"],
      ["🤗", "hugging face"],
      ["🤭", "hand over mouth"],
      ["🫢", "open eyes hand mouth"],
      ["🫣", "peeking face"],
      ["🤫", "shushing face"],
      ["🤔", "thinking face"],
      ["🫡", "salute face"],
      ["🤐", "zipper mouth face"],
      ["🤨", "raised eyebrow face"],
      ["😐", "neutral face"],
      ["😑", "expressionless face"],
      ["😶", "no mouth face"],
      ["🫠", "melting face"],
      ["😶‍🌫️", "face clouds hidden"],
      ["😏", "smirk face"],
      ["😒", "unamused face"],
      ["🙄", "rolling eyes face"],
      ["😬", "grimacing face"],
      ["😮‍💨", "exhale face"],
      ["🤥", "lying face"],
      ["😌", "relieved face"],
      ["😔", "pensive face"],
      ["😪", "sleepy face"],
      ["🤤", "drooling face"],
      ["😴", "sleeping face"],
      ["😷", "mask face"],
      ["🤒", "thermometer sick"],
      ["🤕", "bandage hurt"],
      ["🤢", "nauseated sick"],
      ["🤮", "vomit sick"],
      ["🤧", "sneeze sick"],
      ["🥵", "hot face"],
      ["🥶", "cold face"],
      ["🥴", "woozy face"],
      ["😵", "dizzy face"],
      ["😵‍💫", "spiral eyes dizzy"],
      ["🤯", "exploding head"],
      ["🥳", "party face"],
      ["🥸", "disguise glasses face"],
      ["😎", "sunglasses cool face"],
      ["🤓", "nerd glasses face"],
      ["🧐", "monocle face"],
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      ["👶", "baby person"],
      ["🧒", "child person"],
      ["👦", "boy person"],
      ["👧", "girl person"],
      ["🧑", "person"],
      ["👱", "blond person"],
      ["👨", "man person"],
      ["🧔", "beard person"],
      ["👩", "woman person"],
      ["🧓", "older person"],
      ["👴", "old man"],
      ["👵", "old woman"],
      ["🙍", "frowning person"],
      ["🙎", "pouting person"],
      ["🙅", "no gesture person"],
      ["🙆", "ok gesture person"],
      ["💁", "information desk person"],
      ["🙋", "raising hand person"],
      ["🧏", "deaf person"],
      ["🙇", "bowing person"],
      ["🤦", "facepalm person"],
      ["🤷", "shrug person"],
      ["🧑‍🎨", "artist person"],
      ["🧑‍🚀", "astronaut person"],
      ["🧑‍💻", "technologist person"],
      ["🧑‍🍳", "cook person"],
      ["🧑‍🎤", "singer person"],
      ["🧑‍🏫", "teacher person"],
      ["🧑‍⚕️", "health worker person"],
      ["🧑‍🔬", "scientist person"],
      ["🧑‍✈️", "pilot person"],
      ["🦸", "superhero person"],
      ["🦹", "supervillain person"],
      ["🧙", "mage wizard person"],
      ["🧚", "fairy person"],
      ["🧛", "vampire person"],
      ["🧜", "merperson"],
      ["🧞", "genie person"],
      ["🧟", "zombie person"],
      ["💃", "dancer woman"],
      ["🕺", "dancer man"],
      ["👯", "people bunny ears"],
      ["🧖", "sauna person"],
      ["🧘", "lotus yoga person"],
    ],
  },
  {
    id: "nature",
    label: "Nature",
    items: [
      ["🐶", "dog face animal"],
      ["🐱", "cat face animal"],
      ["🐭", "mouse face animal"],
      ["🐹", "hamster face animal"],
      ["🐰", "rabbit face animal"],
      ["🦊", "fox face animal"],
      ["🐻", "bear face animal"],
      ["🐼", "panda face animal"],
      ["🐻‍❄️", "polar bear face animal"],
      ["🐨", "koala face animal"],
      ["🐯", "tiger face animal"],
      ["🦁", "lion face animal"],
      ["🐮", "cow face animal"],
      ["🐷", "pig face animal"],
      ["🐸", "frog face animal"],
      ["🐵", "monkey face animal"],
      ["🙈", "see no evil monkey"],
      ["🙉", "hear no evil monkey"],
      ["🙊", "speak no evil monkey"],
      ["🐔", "chicken animal"],
      ["🐧", "penguin animal"],
      ["🐦", "bird animal"],
      ["🐤", "chick animal"],
      ["🦄", "unicorn animal"],
      ["🐝", "bee insect"],
      ["🦋", "butterfly insect"],
      ["🐢", "turtle animal"],
      ["🐙", "octopus animal"],
      ["🦀", "crab animal"],
      ["🐠", "fish animal"],
      ["🌵", "cactus plant"],
      ["🎄", "christmas tree"],
      ["🌲", "evergreen tree"],
      ["🌳", "tree plant"],
      ["🌴", "palm tree"],
      ["🌱", "seedling plant"],
      ["🌿", "herb plant"],
      ["☘️", "shamrock clover"],
      ["🍀", "clover luck"],
      ["🌸", "flower blossom"],
      ["🌼", "flower"],
      ["🌻", "sunflower"],
      ["🌹", "rose flower"],
      ["🌷", "tulip flower"],
      ["🌈", "rainbow weather"],
      ["☀️", "sun weather"],
      ["🌙", "moon night"],
      ["⭐", "star"],
      ["🌟", "glowing star"],
      ["✨", "sparkles"],
      ["⚡", "lightning"],
      ["🔥", "fire"],
      ["❄️", "snowflake"],
      ["☁️", "cloud"],
      ["💧", "drop water"],
    ],
  },
  {
    id: "food",
    label: "Food",
    items: [
      ["🍏", "green apple fruit"],
      ["🍎", "red apple fruit"],
      ["🍐", "pear fruit"],
      ["🍊", "orange fruit"],
      ["🍋", "lemon fruit"],
      ["🍌", "banana fruit"],
      ["🍉", "watermelon fruit"],
      ["🍇", "grapes fruit"],
      ["🍓", "strawberry fruit"],
      ["🫐", "blueberries fruit"],
      ["🍈", "melon fruit"],
      ["🍒", "cherries fruit"],
      ["🍑", "peach fruit"],
      ["🥭", "mango fruit"],
      ["🍍", "pineapple fruit"],
      ["🥥", "coconut fruit"],
      ["🥝", "kiwi fruit"],
      ["🍅", "tomato vegetable"],
      ["🥑", "avocado food"],
      ["🍆", "eggplant vegetable"],
      ["🥕", "carrot vegetable"],
      ["🌽", "corn vegetable"],
      ["🌶️", "pepper hot vegetable"],
      ["🥒", "cucumber vegetable"],
      ["🥬", "leafy green vegetable"],
      ["🥦", "broccoli vegetable"],
      ["🧄", "garlic food"],
      ["🧅", "onion food"],
      ["🍄", "mushroom food"],
      ["🥜", "peanuts food"],
      ["🍞", "bread food"],
      ["🥐", "croissant food"],
      ["🥨", "pretzel food"],
      ["🧀", "cheese food"],
      ["🥚", "egg food"],
      ["🍳", "cooking egg food"],
      ["🥞", "pancakes food"],
      ["🧇", "waffle food"],
      ["🥓", "bacon food"],
      ["🍔", "burger food"],
      ["🍟", "fries food"],
      ["🍕", "pizza food"],
      ["🌭", "hot dog food"],
      ["🥪", "sandwich food"],
      ["🌮", "taco food"],
      ["🌯", "burrito food"],
      ["🥗", "salad food"],
      ["🍿", "popcorn food"],
      ["🍩", "donut dessert"],
      ["🍪", "cookie dessert"],
      ["🎂", "cake birthday"],
      ["🧁", "cupcake dessert"],
      ["🍫", "chocolate dessert"],
      ["🍭", "lollipop candy"],
      ["🍬", "candy sweet"],
      ["🍯", "honey food"],
      ["☕", "coffee drink"],
      ["🧋", "bubble tea drink"],
    ],
  },
  {
    id: "places",
    label: "Places",
    items: [
      ["🚗", "car vehicle"],
      ["🚕", "taxi vehicle"],
      ["🚙", "suv vehicle"],
      ["🚌", "bus vehicle"],
      ["🚎", "trolleybus vehicle"],
      ["🏎️", "race car vehicle"],
      ["🚓", "police car vehicle"],
      ["🚑", "ambulance vehicle"],
      ["🚒", "fire engine vehicle"],
      ["🚚", "delivery truck vehicle"],
      ["🚲", "bicycle vehicle"],
      ["🛴", "scooter vehicle"],
      ["🏍️", "motorcycle vehicle"],
      ["🚂", "train vehicle"],
      ["🚆", "train vehicle"],
      ["🚇", "metro subway vehicle"],
      ["🚀", "rocket space"],
      ["🛸", "flying saucer space"],
      ["✈️", "airplane travel"],
      ["⛵", "sailboat travel"],
      ["🚢", "ship travel"],
      ["🏠", "house building"],
      ["🏡", "house garden building"],
      ["🏢", "office building"],
      ["🏫", "school building"],
      ["🏰", "castle building"],
      ["⛺", "tent camping"],
      ["🌋", "volcano place"],
      ["🗻", "mount fuji place"],
      ["🏕️", "camping place"],
      ["🏖️", "beach place"],
      ["🏜️", "desert place"],
      ["🏝️", "island place"],
      ["🏞️", "park place"],
      ["🌃", "night city"],
      ["🌉", "bridge night"],
      ["🎡", "ferris wheel place"],
      ["🎢", "roller coaster place"],
      ["🎠", "carousel place"],
    ],
  },
  {
    id: "activity",
    label: "Activity",
    items: [
      ["⚽", "soccer ball sport"],
      ["🏀", "basketball sport"],
      ["🏈", "football sport"],
      ["⚾", "baseball sport"],
      ["🥎", "softball sport"],
      ["🎾", "tennis sport"],
      ["🏐", "volleyball sport"],
      ["🏉", "rugby sport"],
      ["🥏", "frisbee sport"],
      ["🎱", "pool billiards game"],
      ["🪀", "yo yo toy"],
      ["🏓", "ping pong sport"],
      ["🏸", "badminton sport"],
      ["🥅", "goal net sport"],
      ["🏒", "hockey sport"],
      ["🥍", "lacrosse sport"],
      ["🏏", "cricket sport"],
      ["🪃", "boomerang"],
      ["🥊", "boxing glove sport"],
      ["🥋", "martial arts sport"],
      ["🎽", "running shirt sport"],
      ["🛹", "skateboard sport"],
      ["🛼", "roller skate sport"],
      ["🛷", "sled sport"],
      ["⛸️", "ice skate sport"],
      ["🎿", "ski sport"],
      ["⛷️", "skier sport"],
      ["🏂", "snowboarder sport"],
      ["🏆", "trophy award"],
      ["🥇", "gold medal award"],
      ["🥈", "silver medal award"],
      ["🥉", "bronze medal award"],
      ["🎯", "dart target game"],
      ["🎮", "video game"],
      ["🎲", "game die"],
      ["🧩", "puzzle game"],
      ["🎨", "palette art"],
      ["🎭", "theater masks"],
      ["🎪", "circus tent"],
      ["🎤", "microphone music"],
      ["🎧", "headphones music"],
      ["🎼", "music score"],
      ["🎹", "piano music"],
      ["🥁", "drum music"],
      ["🎷", "saxophone music"],
      ["🎸", "guitar music"],
      ["🎺", "trumpet music"],
    ],
  },
  {
    id: "objects",
    label: "Objects",
    items: [
      ["⌚", "watch object"],
      ["📱", "phone mobile object"],
      ["💻", "laptop computer object"],
      ["⌨️", "keyboard object"],
      ["🖥️", "desktop computer object"],
      ["🖨️", "printer object"],
      ["🕹️", "joystick object"],
      ["🗜️", "clamp tool object"],
      ["💽", "disk object"],
      ["💾", "floppy disk save object"],
      ["💿", "cd disk object"],
      ["📷", "camera object"],
      ["📸", "camera flash object"],
      ["📹", "video camera object"],
      ["🎥", "movie camera object"],
      ["📞", "telephone object"],
      ["☎️", "phone object"],
      ["📺", "tv object"],
      ["📻", "radio object"],
      ["🎙️", "studio microphone object"],
      ["⏰", "alarm clock object"],
      ["⏳", "hourglass object"],
      ["🔋", "battery object"],
      ["💡", "light bulb object"],
      ["🔦", "flashlight object"],
      ["🕯️", "candle object"],
      ["🧯", "fire extinguisher object"],
      ["🛒", "shopping cart object"],
      ["🎁", "gift object"],
      ["🎈", "balloon object"],
      ["🎀", "ribbon object"],
      ["🪄", "magic wand object"],
      ["🧸", "teddy bear toy"],
      ["🪅", "pinata object"],
      ["🪩", "mirror ball object"],
      ["💌", "love letter object"],
      ["📦", "package box object"],
      ["📚", "books object"],
      ["📌", "pin object"],
      ["✂️", "scissors object"],
      ["🔒", "lock object"],
      ["🔑", "key object"],
      ["🔨", "hammer tool"],
      ["🧲", "magnet object"],
      ["🧪", "test tube science"],
      ["💊", "pill medicine"],
      ["🩹", "bandage object"],
      ["🧼", "soap object"],
      ["🧽", "sponge object"],
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    items: [
      ["❤️", "heart red love"],
      ["🧡", "orange heart love"],
      ["💛", "yellow heart love"],
      ["💚", "green heart love"],
      ["💙", "blue heart love"],
      ["💜", "purple heart love"],
      ["🖤", "black heart love"],
      ["🤍", "white heart love"],
      ["🤎", "brown heart love"],
      ["💔", "broken heart"],
      ["❣️", "heart exclamation"],
      ["💕", "two hearts"],
      ["💞", "revolving hearts"],
      ["💓", "beating heart"],
      ["💗", "growing heart"],
      ["💖", "sparkling heart"],
      ["💘", "cupid heart"],
      ["💝", "heart gift"],
      ["💟", "heart decoration"],
      ["☮️", "peace symbol"],
      ["✝️", "cross symbol"],
      ["☪️", "star crescent symbol"],
      ["🕉️", "om symbol"],
      ["☸️", "wheel dharma symbol"],
      ["✡️", "star david symbol"],
      ["🔯", "six pointed star symbol"],
      ["🪯", "khanda symbol"],
      ["☯️", "yin yang symbol"],
      ["☦️", "orthodox cross symbol"],
      ["🛐", "place worship symbol"],
      ["⛎", "ophiuchus zodiac"],
      ["♈", "aries zodiac"],
      ["♉", "taurus zodiac"],
      ["♊", "gemini zodiac"],
      ["♋", "cancer zodiac"],
      ["♌", "leo zodiac"],
      ["♍", "virgo zodiac"],
      ["♎", "libra zodiac"],
      ["♏", "scorpio zodiac"],
      ["♐", "sagittarius zodiac"],
      ["♑", "capricorn zodiac"],
      ["♒", "aquarius zodiac"],
      ["♓", "pisces zodiac"],
      ["🆔", "id button"],
      ["⚛️", "atom symbol"],
      ["☢️", "radioactive symbol"],
      ["☣️", "biohazard symbol"],
      ["📴", "mobile phone off"],
      ["📳", "vibration mode"],
      ["🈶", "japanese button"],
      ["🈚", "japanese button"],
      ["🈯", "japanese button"],
      ["✅", "check mark"],
      ["☑️", "check box"],
      ["✔️", "check mark"],
      ["❌", "cross mark"],
      ["❎", "cross mark button"],
      ["➕", "plus symbol"],
      ["➖", "minus symbol"],
      ["➗", "divide symbol"],
      ["💯", "hundred score"],
    ],
  },
];

const emojiCategoryOrder = [
  "smileys",
  "people",
  "symbols",
  "nature",
  "food",
  "places",
  "activity",
  "objects",
];

emojiGroups.sort((first, second) => {
  return emojiCategoryOrder.indexOf(first.id) - emojiCategoryOrder.indexOf(second.id);
});

let activeEmojiCategory = emojiGroups[0].id;

function getStoredTheme() {
  return localStorage.getItem("theme") || "system";
}

function getResolvedTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

function applyTheme(theme) {
  const resolvedTheme = getResolvedTheme(theme);
  document.documentElement.dataset.theme = resolvedTheme;

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.themeButton === theme);
  });
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function setDownloadStatus() {
  statusText.classList.remove("error");
  statusText.textContent = messages.ready;
}

function startTypewriter() {
  if (!typingText) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typingText.textContent = typingPhrases[0];
    return;
  }

  let phraseIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;

  function tick() {
    const phrase = typingPhrases[phraseIndex];
    characterIndex += isDeleting ? -1 : 1;
    typingText.textContent = phrase.slice(0, characterIndex);
    fitTypingText();

    let delay = isDeleting ? 24 : 42;

    if (!isDeleting && characterIndex === phrase.length) {
      isDeleting = true;
      delay = 1500;
    } else if (isDeleting && characterIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      delay = 360;
    }

    window.setTimeout(tick, delay);
  }

  window.setTimeout(tick, 420);
}

function fitTypingText() {
  if (!typingText) {
    return;
  }

  const title = typingText.closest(".hero-title");
  const availableWidth = document.documentElement.clientWidth - 32;

  if (!title || availableWidth <= 0) {
    return;
  }

  title.style.fontSize = "";

  if (window.matchMedia("(max-width: 760px)").matches) {
    return;
  }

  let currentSize = parseFloat(getComputedStyle(title).fontSize);

  while (title.scrollWidth > availableWidth && currentSize > 12) {
    currentSize -= 0.5;
    title.style.fontSize = `${currentSize}px`;
  }
}

function getEmojiButtons() {
  return [...emojiGrid.querySelectorAll(".emoji-option")];
}

function getListedEmojis() {
  return new Set(getEmojiButtons().map((button) => button.textContent.trim()));
}

function createEmojiChip(emoji) {
  const chip = document.createElement("div");
  chip.className = "emoji-chip";

  const emojiButton = document.createElement("button");
  emojiButton.className = "emoji-option active";
  emojiButton.type = "button";
  emojiButton.setAttribute("aria-pressed", "true");
  emojiButton.textContent = emoji;

  const removeButton = document.createElement("button");
  removeButton.className = "remove-emoji-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${emoji}`);

  chip.append(emojiButton, removeButton);
  return chip;
}

function toggleEmoji(button) {
  const emoji = button.textContent.trim();

  if (selectedEmojis.has(emoji)) {
    selectedEmojis.delete(emoji);
  } else {
    selectedEmojis.add(emoji);
  }

  getEmojiButtons().forEach((emojiButton) => {
    const isActive = selectedEmojis.has(emojiButton.textContent.trim());
    emojiButton.classList.toggle("active", isActive);
    emojiButton.setAttribute("aria-pressed", String(isActive));
  });
}

function addEmojiToList(emoji) {
  const existingButton = getEmojiButtons().find(
    (button) => button.textContent.trim() === emoji
  );

  if (existingButton) {
    selectedEmojis.add(emoji);
    existingButton.classList.add("active");
    existingButton.setAttribute("aria-pressed", "true");
    return;
  }

  emojiGrid.insertBefore(createEmojiChip(emoji), addEmojiButton);
  selectedEmojis.add(emoji);
}

function getVisibleEmojiChoices(query) {
  if (query) {
    return emojiGroups
      .flatMap((group) => group.items)
      .filter(([emoji, keywords]) => {
        return emoji.includes(query) || keywords.includes(query);
      });
  }

  return emojiGroups.find((group) => group.id === activeEmojiCategory)?.items || [];
}

function renderEmojiCategories() {
  const fragment = document.createDocumentFragment();

  emojiGroups.forEach((group) => {
    const button = document.createElement("button");
    button.className = "emoji-category-tab";
    button.type = "button";
    button.dataset.category = group.id;
    button.textContent = group.label;
    button.classList.toggle("active", group.id === activeEmojiCategory);
    button.setAttribute("aria-pressed", String(group.id === activeEmojiCategory));
    fragment.appendChild(button);
  });

  emojiCategoryTabs.replaceChildren(fragment);
}

function renderEmojiSelector(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const choices = getVisibleEmojiChoices(normalizedQuery);
  const listedEmojis = getListedEmojis();
  const fragment = document.createDocumentFragment();

  if (choices.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "emoji-selector-empty";
    emptyState.textContent = "No emoji found.";
    emojiSelectorGrid.replaceChildren(emptyState);
    return;
  }

  choices.forEach(([emoji]) => {
    const button = document.createElement("button");
    button.className = "emoji-selector-option";
    button.type = "button";
    button.dataset.emoji = emoji;
    button.textContent = emoji;
    button.classList.toggle("is-added", listedEmojis.has(emoji));
    button.setAttribute("aria-pressed", String(selectedEmojis.has(emoji)));
    button.setAttribute("aria-label", `Add ${emoji}`);
    fragment.appendChild(button);
  });

  emojiSelectorGrid.replaceChildren(fragment);
}

function openEmojiPicker() {
  renderEmojiCategories();
  renderEmojiSelector(emojiSearch.value);
  emojiPicker.hidden = false;
  emojiSearch.focus();
}

function closeEmojiPicker() {
  emojiPicker.hidden = true;
  emojiSearch.value = "";
}

function toggleEmojiPicker() {
  if (emojiPicker.hidden) {
    openEmojiPicker();
    return;
  }

  closeEmojiPicker();
}

function removeEmoji(removeButton) {
  const chip = removeButton.closest(".emoji-chip");
  const emojiButton = chip?.querySelector(".emoji-option");

  if (!chip || !emojiButton) {
    return;
  }

  selectedEmojis.delete(emojiButton.textContent.trim());
  chip.remove();

  if (!emojiPicker.hidden) {
    renderEmojiSelector(emojiSearch.value);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setAddFaceMode(isEnabled) {
  const canAddFromPreview = !previewModal.hidden && activePreviewSource === "original";
  addFaceMode =
    isEnabled &&
    Boolean(currentImage) &&
    !imageCovered &&
    (canAddFromPreview || !canvasWrap.hidden);

  [addFaceButton, previewAddFaceButton].forEach((button) => {
    button.classList.toggle("active", addFaceMode);
    button.setAttribute("aria-pressed", String(addFaceMode));
  });

  canvasWrap.classList.toggle("adding-face", addFaceMode);
  previewImageWrap.classList.toggle("adding-face", addFaceMode);
}

function updateFaceActionState() {
  const canEditFaces = Boolean(currentImage) && !imageCovered;
  const canEditPreview = canEditFaces && !previewModal.hidden && activePreviewSource === "original";

  addFaceButton.hidden = !canEditFaces;
  previewAddFaceButton.hidden = !canEditPreview;
  document.querySelector(".original-panel")?.classList.toggle("face-tools-visible", canEditFaces);
  previewImageWrap.classList.toggle("has-face-tools", canEditPreview);

  if (!canEditFaces) {
    setAddFaceMode(false);
  }

  coverButton.disabled = detectedFaces.length === 0;
}

function getAverageFaceSize() {
  if (!currentImage) {
    return 80;
  }

  const autoFaces = detectedFaces.filter((face) => !face.manual);
  const sizeSource = autoFaces.length > 0 ? autoFaces : detectedFaces;

  if (sizeSource.length > 0) {
    const averageSize =
      sizeSource.reduce((sum, face) => {
        return sum + Math.max(face.right - face.left, face.bottom - face.top);
      }, 0) / sizeSource.length;

    return clamp(averageSize, 32, Math.min(currentImage.naturalWidth, currentImage.naturalHeight) * 0.42);
  }

  return clamp(
    Math.min(currentImage.naturalWidth, currentImage.naturalHeight) * 0.16,
    48,
    132
  );
}

function createFaceFromCenter(centerX, centerY, size) {
  const halfSize = size / 2;

  return {
    id: nextFaceId++,
    top: Math.round(clamp(centerY - halfSize, 0, currentImage.naturalHeight)),
    right: Math.round(clamp(centerX + halfSize, 0, currentImage.naturalWidth)),
    bottom: Math.round(clamp(centerY + halfSize, 0, currentImage.naturalHeight)),
    left: Math.round(clamp(centerX - halfSize, 0, currentImage.naturalWidth)),
    manual: true,
  };
}

function moveFaceToCenter(face, centerX, centerY) {
  const width = face.right - face.left;
  const height = face.bottom - face.top;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const clampedCenterX = clamp(centerX, halfWidth, currentImage.naturalWidth - halfWidth);
  const clampedCenterY = clamp(centerY, halfHeight, currentImage.naturalHeight - halfHeight);

  face.left = Math.round(clampedCenterX - halfWidth);
  face.right = Math.round(clampedCenterX + halfWidth);
  face.top = Math.round(clampedCenterY - halfHeight);
  face.bottom = Math.round(clampedCenterY + halfHeight);
}

function getLayerMetrics(imageElement, layerElement) {
  if (!currentImage) {
    return { scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 };
  }

  const imageBox = imageElement.getBoundingClientRect();
  const layerBox = layerElement.getBoundingClientRect();
  const scale = imageBox.width / currentImage.naturalWidth;

  return {
    scale,
    offsetX: imageBox.left - layerBox.left,
    offsetY: imageBox.top - layerBox.top,
    width: imageBox.width,
    height: imageBox.height,
  };
}

function getPreviewSize() {
  if (!currentImage) {
    return { width: 0, height: 0 };
  }

  const workspaceWidth = imageWorkspace.getBoundingClientRect().width || 320;
  const isStacked = window.matchMedia("(max-width: 760px)").matches;
  const isComparing = imageWorkspace.classList.contains("has-result") && !isStacked;
  const faceToolsWidth = imageCovered ? 0 : FACE_TOOL_RAIL_WIDTH;
  const availableWidth = Math.max(120, workspaceWidth - faceToolsWidth);
  const maxWidth = isComparing
    ? Math.min((workspaceWidth - 13 - faceToolsWidth) / 2, 256)
    : Math.min(availableWidth, 336);
  const maxHeight = isStacked ? 336 : 368;
  const scale = Math.min(maxWidth / currentImage.naturalWidth, maxHeight / currentImage.naturalHeight, 1.35);

  return {
    width: Math.max(120, Math.round(currentImage.naturalWidth * scale)),
    height: Math.max(120, Math.round(currentImage.naturalHeight * scale)),
  };
}

function getCanvasMetrics() {
  return getLayerMetrics(canvas, faceLayer);
}

function applyImageDimensions() {
  if (!currentImage) {
    return;
  }

  const size = getPreviewSize();
  const width = `${size.width}px`;
  const height = `${size.height}px`;

  dropZone.classList.add("loaded");
  originalPanel.style.setProperty("--image-width", width);
  dropZone.style.width = width;
  dropZone.style.height = height;
  canvasWrap.style.width = width;
  canvasWrap.style.height = height;
  resultArea.style.width = width;
  resultArea.style.height = height;
}

function drawOriginalImage() {
  if (!currentImage) {
    return;
  }

  canvas.width = currentImage.naturalWidth;
  canvas.height = currentImage.naturalHeight;
  applyImageDimensions();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImage, 0, 0);
}

function drawOriginalToResult() {
  resultCanvas.width = currentImage.naturalWidth;
  resultCanvas.height = currentImage.naturalHeight;
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  resultCtx.drawImage(currentImage, 0, 0);
}

function toggleFaceSelection(faceId) {
  if (selectedFaceIds.has(faceId)) {
    selectedFaceIds.delete(faceId);
  } else {
    selectedFaceIds.add(faceId);
  }

  setStatus(
    `${selectedFaceIds.size} ${selectedFaceIds.size === 1 ? "face" : "faces"} will stay visible.`
  );
  renderFaceLayers();
}

function removeFace(faceId) {
  detectedFaces = detectedFaces.filter((face) => face.id !== faceId);
  selectedFaceIds.delete(faceId);
  updateFaceActionState();
  renderFaceLayers();

  if (detectedFaces.length === 0) {
    setStatus("Add a face area or try another image.", true);
    return;
  }

  setStatus("Face area removed.");
}

function startFaceDrag(face, event, marker, imageElement, layerElement) {
  if (event.button !== 0 && event.pointerType === "mouse") {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const width = face.right - face.left;
  const height = face.bottom - face.top;

  activeFaceDrag = {
    face,
    imageElement,
    layerElement,
    marker,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startCenterX: face.left + width / 2,
    startCenterY: face.top + height / 2,
    moved: false,
  };

  marker.classList.add("dragging");
  marker.setPointerCapture?.(event.pointerId);
}

function updateFaceDrag(event) {
  if (!activeFaceDrag || !currentImage) {
    return;
  }

  const deltaX = event.clientX - activeFaceDrag.startClientX;
  const deltaY = event.clientY - activeFaceDrag.startClientY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance < DRAG_THRESHOLD && !activeFaceDrag.moved) {
    return;
  }

  activeFaceDrag.moved = true;

  const metrics = getLayerMetrics(
    activeFaceDrag.imageElement,
    activeFaceDrag.layerElement
  );

  moveFaceToCenter(
    activeFaceDrag.face,
    activeFaceDrag.startCenterX + deltaX / metrics.scale,
    activeFaceDrag.startCenterY + deltaY / metrics.scale
  );

  scheduleFaceLayersRender();
}

function endFaceDrag() {
  if (!activeFaceDrag) {
    return;
  }

  const { face, moved } = activeFaceDrag;
  activeFaceDrag.marker.classList.remove("dragging");
  activeFaceDrag = null;

  if (moved) {
    setStatus("Face area moved.");
    renderFaceLayers();
    return;
  }

  toggleFaceSelection(face.id);
}

function createFaceMarker(face, metrics, options = {}) {
  const { isInteractive = false, imageElement = canvas, layerElement = faceLayer } = options;
  const width = face.right - face.left;
  const height = face.bottom - face.top;
  const centerX = face.left + width / 2;
  const centerY = face.top + height / 2;
  const diameter = Math.max(24, Math.max(width, height) * metrics.scale * 1.04);
  const marker = document.createElement("div");
  const toggleButton = document.createElement("button");
  const removeButton = document.createElement("button");

  marker.className = "face-marker";
  marker.style.left = `${metrics.offsetX + centerX * metrics.scale}px`;
  marker.style.top = `${metrics.offsetY + centerY * metrics.scale}px`;
  marker.style.width = `${diameter}px`;
  marker.style.height = `${diameter}px`;

  toggleButton.type = "button";
  toggleButton.className = "face-toggle";
  toggleButton.setAttribute("aria-pressed", String(selectedFaceIds.has(face.id)));
  toggleButton.setAttribute("aria-label", `Keep face ${face.id + 1} visible`);
  toggleButton.classList.toggle("selected", selectedFaceIds.has(face.id));

  removeButton.type = "button";
  removeButton.className = "remove-face-button";
  removeButton.setAttribute("aria-label", `Remove face area ${face.id + 1}`);

  if (isInteractive) {
    toggleButton.addEventListener("pointerdown", (event) => {
      startFaceDrag(face, event, marker, imageElement, layerElement);
    });

    removeButton.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });

    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeFace(face.id);
    });
  } else {
    toggleButton.tabIndex = -1;
    removeButton.hidden = true;
  }

  marker.append(toggleButton, removeButton);
  return marker;
}

function renderFaceButtons() {
  if (!currentImage || imageCovered) {
    faceLayer.replaceChildren();
    return;
  }

  const metrics = getCanvasMetrics();
  const fragment = document.createDocumentFragment();

  detectedFaces.forEach((face) => {
    fragment.appendChild(
      createFaceMarker(face, metrics, {
        isInteractive: true,
        imageElement: canvas,
        layerElement: faceLayer,
      })
    );
  });

  faceLayer.replaceChildren(fragment);
}

function renderFaceLayers() {
  renderFaceButtons();
  renderPreviewFaceButtons();
}

function scheduleFaceLayersRender() {
  if (faceRenderFrame) {
    return;
  }

  faceRenderFrame = requestAnimationFrame(() => {
    faceRenderFrame = null;
    renderFaceLayers();
  });
}

function resetEditor() {
  imageInput.value = "";
  currentImage = null;
  detectedFaces = [];
  selectedFaceIds = new Set();
  imageCovered = false;
  nextFaceId = 0;
  setAddFaceMode(false);
  faceLayer.replaceChildren();
  uploadState.hidden = false;
  canvasWrap.hidden = true;
  resultPanel.hidden = true;
  uploadNewButton.hidden = true;
  addFaceButton.hidden = true;
  regenerateButton.hidden = true;
  reselectButton.hidden = true;
  coverButton.hidden = false;
  coverButton.disabled = true;
  imageWorkspace.classList.remove("has-result");
  dropZone.classList.remove("loaded");
  [dropZone, canvasWrap, resultArea].forEach((element) => {
    element.style.width = "";
    element.style.height = "";
  });
  originalPanel.style.removeProperty("--image-width");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  setStatus("");

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

async function detectFaces(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/detect-faces", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "얼굴 인식에 실패했습니다.");
  }

  return data.faces;
}

function loadImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus(messages.genericError, true);
    return;
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  detectedFaces = [];
  selectedFaceIds = new Set();
  imageCovered = false;
  nextFaceId = 0;
  setAddFaceMode(false);
  coverButton.disabled = true;
  coverButton.hidden = false;
  uploadNewButton.hidden = true;
  addFaceButton.hidden = true;
  regenerateButton.hidden = true;
  reselectButton.hidden = true;
  resultPanel.hidden = true;
  imageWorkspace.classList.remove("has-result");
  dropZone.classList.remove("loaded");
  faceLayer.replaceChildren();
  currentObjectUrl = URL.createObjectURL(file);

  const image = new Image();
  const imageUrl = currentObjectUrl;

  image.onload = async () => {
    if (currentObjectUrl !== imageUrl) {
      return;
    }

    currentImage = image;
    uploadState.hidden = true;
    canvasWrap.hidden = false;
    uploadNewButton.hidden = false;
    addFaceButton.hidden = false;
    drawOriginalImage();
    setStatus("얼굴을 인식하는 중입니다...");

    try {
      const faces = await detectFaces(file);

      if (currentObjectUrl !== imageUrl) {
        return;
      }

      detectedFaces = faces.map((face) => ({
        ...face,
        manual: false,
      }));
      nextFaceId =
        detectedFaces.reduce((maxId, face) => Math.max(maxId, face.id), -1) + 1;
      renderFaceLayers();
      updateFaceActionState();

      if (detectedFaces.length === 0) {
        setStatus(`${messages.noFaces} You can add face areas manually.`, true);
        return;
      }

      setStatus("Select the faces you want to keep visible.");
    } catch (error) {
      updateFaceActionState();
      setStatus(messages.genericError, true);
    }
  };

  image.onerror = () => {
    if (currentObjectUrl !== imageUrl) {
      return;
    }

    setStatus(messages.genericError, true);
  };

  image.src = currentObjectUrl;
}

function coverFaces() {
  if (!currentImage || detectedFaces.length === 0) {
    setStatus(messages.noFaces, true);
    return;
  }

  if (selectedEmojis.size === 0) {
    setStatus(messages.chooseEmoji, true);
    return;
  }

  drawOriginalToResult();
  resultCtx.textAlign = "center";
  resultCtx.textBaseline = "middle";

  const emojis = [...selectedEmojis];

  detectedFaces.forEach((face) => {
    if (selectedFaceIds.has(face.id)) {
      return;
    }

    const width = face.right - face.left;
    const height = face.bottom - face.top;
    const centerX = face.left + width / 2;
    const centerY = face.top + height / 2;
    const faceSize = Math.max(width, height);
    const stampSize = Math.max(26, faceSize * 1.32);
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    resultCtx.save();
    resultCtx.font = `${stampSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    resultCtx.fillText(emoji, centerX, centerY + stampSize * 0.03);
    resultCtx.restore();
  });

  imageCovered = true;
  setAddFaceMode(false);
  faceLayer.replaceChildren();
  resultPanel.hidden = false;
  imageWorkspace.classList.add("has-result");
  applyImageDimensions();
  coverButton.hidden = true;
  regenerateButton.hidden = false;
  reselectButton.hidden = false;
  updateFaceActionState();
  setDownloadStatus();
}

function reselectPeople() {
  if (!currentImage) {
    return;
  }

  imageCovered = false;
  resultPanel.hidden = true;
  imageWorkspace.classList.remove("has-result");
  coverButton.hidden = false;
  regenerateButton.hidden = true;
  reselectButton.hidden = true;
  applyImageDimensions();
  updateFaceActionState();
  renderFaceLayers();
  setStatus("Update the faces you want to keep visible.");
}

function downloadResult() {
  resultCanvas.toBlob((blob) => {
    if (!blob) {
      setStatus(messages.genericError, true);
      return;
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "emoji-cover-face.png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, "image/png");
}

async function shareResult() {
  if (!resultCanvas.width || !resultCanvas.height) {
    return;
  }

  resultCanvas.toBlob(async (blob) => {
    if (!blob) {
      setStatus(messages.genericError, true);
      return;
    }

    const file = new File([blob], "emoji-cover-face.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: "Emoji covered image",
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus(messages.genericError, true);
        }
      }
      return;
    }

    downloadResult();
  }, "image/png");
}

function addManualFace(event, imageElement = canvas) {
  if (!addFaceMode || !currentImage || imageCovered) {
    return;
  }

  const imageBox = imageElement.getBoundingClientRect();
  const centerX =
    ((event.clientX - imageBox.left) / imageBox.width) * currentImage.naturalWidth;
  const centerY =
    ((event.clientY - imageBox.top) / imageBox.height) * currentImage.naturalHeight;
  const faceSize = getAverageFaceSize();

  detectedFaces.push(createFaceFromCenter(centerX, centerY, faceSize));
  setAddFaceMode(false);
  updateFaceActionState();
  renderFaceLayers();
  setStatus("Face area added.");
}

function renderPreviewFaceButtons() {
  if (
    previewModal.hidden ||
    activePreviewSource !== "original" ||
    !currentImage ||
    !previewImage.complete ||
    previewImage.naturalWidth === 0
  ) {
    previewFaceLayer.replaceChildren();
    return;
  }

  const metrics = getLayerMetrics(previewImage, previewFaceLayer);
  const fragment = document.createDocumentFragment();

  detectedFaces.forEach((face) => {
    fragment.appendChild(
      createFaceMarker(face, metrics, {
        isInteractive: true,
        imageElement: previewImage,
        layerElement: previewFaceLayer,
      })
    );
  });

  previewFaceLayer.replaceChildren(fragment);
}

function openPreview(source) {
  const targetCanvas = source === "result" ? resultCanvas : canvas;

  if (!targetCanvas.width || !targetCanvas.height) {
    return;
  }

  activePreviewSource = source;
  previewFaceLayer.hidden = source !== "original";
  previewFaceLayer.replaceChildren();
  previewImage.onload = () => requestAnimationFrame(renderPreviewFaceButtons);
  previewModal.hidden = false;
  updateFaceActionState();
  previewImage.src =
    source === "original" && currentObjectUrl
      ? currentObjectUrl
      : targetCanvas.toDataURL("image/png");

  if (previewImage.complete) {
    requestAnimationFrame(renderPreviewFaceButtons);
  }
}

function closePreview() {
  previewModal.hidden = true;
  activePreviewSource = null;
  setAddFaceMode(false);
  updateFaceActionState();
  previewImage.onload = null;
  previewImage.removeAttribute("src");
  previewFaceLayer.replaceChildren();
}

emojiGrid.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-emoji-button");

  if (removeButton) {
    event.stopPropagation();
    removeEmoji(removeButton);
    return;
  }

  const button = event.target.closest(".emoji-option");

  if (!button) {
    return;
  }

  toggleEmoji(button);
});

emojiSelectorGrid.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest(".emoji-selector-option");

  if (!button) {
    return;
  }

  addEmojiToList(button.dataset.emoji || button.textContent.trim());
  renderEmojiSelector(emojiSearch.value);
  emojiSearch.focus({ preventScroll: true });
});

emojiSearch.addEventListener("input", () => {
  renderEmojiSelector(emojiSearch.value);
});

emojiCategoryTabs.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest(".emoji-category-tab");

  if (!button) {
    return;
  }

  activeEmojiCategory = button.dataset.category;
  emojiSearch.value = "";
  renderEmojiCategories();
  renderEmojiSelector();
});

addEmojiButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleEmojiPicker();
});

addFaceButton.addEventListener("click", () => {
  setAddFaceMode(!addFaceMode);
  setStatus(addFaceMode ? "Click the missing face area." : "");
});

previewAddFaceButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setAddFaceMode(!addFaceMode);
  setStatus(addFaceMode ? "Click the missing face area." : "");
});

uploadNewButton.addEventListener("click", resetEditor);
regenerateButton.addEventListener("click", coverFaces);
reselectButton.addEventListener("click", reselectPeople);
shareButton.addEventListener("click", shareResult);
downloadButton.addEventListener("click", downloadResult);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeButton));
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getStoredTheme() === "system") {
    applyTheme("system");
  }
});

imageInput.addEventListener("change", (event) => {
  loadImage(event.target.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");
  loadImage(event.dataTransfer.files[0]);
});

coverButton.addEventListener("click", coverFaces);

canvasWrap.addEventListener("click", (event) => {
  if (event.target.closest(".face-marker") || event.target.closest(".preview-button")) {
    return;
  }

  addManualFace(event);
});

previewImageWrap.addEventListener("click", (event) => {
  if (
    activePreviewSource !== "original" ||
    event.target.closest(".face-marker") ||
    event.target.closest(".preview-add-face-button")
  ) {
    return;
  }

  addManualFace(event, previewImage);
});

previewButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openPreview(button.dataset.previewSource);
  });
});

previewBackdrop.addEventListener("click", closePreview);
previewClose.addEventListener("click", closePreview);

document.addEventListener("pointermove", (event) => {
  updateFaceDrag(event);
});

document.addEventListener("pointerup", () => {
  endFaceDrag();
});

document.addEventListener("pointercancel", () => {
  endFaceDrag();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !previewModal.hidden) {
    closePreview();
  }

  if (event.key === "Escape" && !emojiPicker.hidden) {
    closeEmojiPicker();
  }
});

document.addEventListener("click", (event) => {
  if (emojiPicker.hidden) {
    return;
  }

  if (event.target.closest(".emoji-section")) {
    return;
  }

  closeEmojiPicker();
});

window.addEventListener("resize", () => {
  if (resizeFrame) {
    return;
  }

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    fitTypingText();
    applyImageDimensions();
    renderFaceLayers();
  });
});

applyTheme(getStoredTheme());
startTypewriter();
