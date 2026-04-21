const PROFANITY_STEMS = [
  "arse",
  "asshole",
  "bastard",
  "bitch",
  "beaner",
  "chink",
  "bullshit",
  "cabron",
  "coon",
  "chingada",
  "chingado",
  "chingar",
  "chingon",
  "crap",
  "cunt",
  "damn",
  "dick",
  "douche",
  "douchebag",
  "dyke",
  "fag",
  "faggot",
  "fuck",
  "fucker",
  "fucking",
  "goddamn",
  "gook",
  "goon",
  "gooner",
  "jackass", 
  "joder",
  "kike",
  "mierda",
  "nigger",
  "nigga",
  "paki",
  "motherfucker",
  "pendeja",
  "pendejo",
  "pinche",
  "piss",
  "puta",
  "puta madre",
  "puto",
  "raghead",
  "spic",
  "shit",
  "skank",
  "suck",
  "sucker",
  "tranny",
  "slut",
  "verga",
  "wetback",
  "whore",
];

const LEET_CHAR_MAP = {
  "@": "a",
  "$": "s",
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeProfanityInput = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[@$013457]/g, (char) => LEET_CHAR_MAP[char] || char);

const wordBoundaryPatterns = PROFANITY_STEMS.map((stem) => ({
  stem,
  pattern: new RegExp(`\\b${escapeRegex(stem)}\\b`, "i"),
}));

const condensedPatterns = PROFANITY_STEMS.map((stem) => ({
  stem,
  pattern: new RegExp(escapeRegex(stem), "i"),
}));

export function containsProfanity(value) {
  const normalizedValue = normalizeProfanityInput(value);
  if (!normalizedValue.trim()) {
    return false;
  }

  if (wordBoundaryPatterns.some(({ pattern }) => pattern.test(normalizedValue))) {
    return true;
  }

  const condensedValue = normalizedValue.replace(/[^a-z]/g, "");
  return condensedPatterns.some(({ pattern }) => pattern.test(condensedValue));
}

export function sanitizeProfanity(value, replacement = "[removed]") {
  const rawValue = String(value ?? "");
  if (!rawValue.trim()) {
    return rawValue;
  }

  let sanitizedValue = rawValue;

  for (const { stem } of wordBoundaryPatterns) {
    const maskPattern = new RegExp(`\\b${escapeRegex(stem)}\\b`, "gi");
    sanitizedValue = sanitizedValue.replace(maskPattern, replacement);
  }

  return sanitizedValue;
}

export function firstProfanityField(fields = []) {
  return fields.find(({ value }) => containsProfanity(value)) || null;
}

export function validateNoProfanity(fields = [], fallbackMessage = "Please remove profanity and try again.") {
  const offendingField = firstProfanityField(fields);

  if (!offendingField) {
    return { valid: true };
  }

  return {
    valid: false,
    error:
      offendingField.message ||
      `${offendingField.label || "This field"} contains profanity. ${fallbackMessage}`,
  };
}
