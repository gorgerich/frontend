const RU_WIDOW_WORDS = [
  "\u0430",
  "\u0438",
  "\u043d\u043e",
  "\u0434\u0430",
  "\u0438\u043b\u0438",
  "\u043b\u0438\u0431\u043e",
  "\u0432",
  "\u0432\u043e",
  "\u043d\u0430",
  "\u043a",
  "\u043a\u043e",
  "\u0441",
  "\u0441\u043e",
  "\u0443",
  "\u043e",
  "\u043e\u0431",
  "\u043e\u0431\u043e",
  "\u043e\u0442",
  "\u0434\u043e",
  "\u0437\u0430",
  "\u0438\u0437",
  "\u0438\u0437\u043e",
  "\u043f\u043e",
  "\u043f\u043e\u0434",
  "\u043f\u0440\u0438",
  "\u0434\u043b\u044f",
  "\u0431\u0435\u0437",
  "\u043d\u0435",
  "\u043d\u0438",
];

const RU_WIDOW_PATTERN = new RegExp(
  `(^|[\\s(\\["'])(${RU_WIDOW_WORDS.join("|")})\\s+`,
  "giu",
);

export function widontRu(text: string): string {
  if (!text) return text;
  return text.replace(RU_WIDOW_PATTERN, (_, prefix: string, word: string) => {
    return `${prefix}${word}\u00A0`;
  });
}
