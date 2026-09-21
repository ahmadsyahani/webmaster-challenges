// src/lib/piston-config.ts

export const SUPPORTED_LANGUAGES = [
  { language: "javascript", id: 63 }, // Node.js
  { language: "python", id: 71 },
  { language: "php", id: 68 },
  { language: "go", id: 60 }
];

export const getLanguageId = (lang: string) => {
  const found = SUPPORTED_LANGUAGES.find(l => l.language === lang);
  return found ? found.id : null;
};