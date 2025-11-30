// Простейшая функция объединения классов без внешних библиотек
export function cn(
  ...inputs: Array<string | number | null | undefined | false>
): string {
  return inputs.filter(Boolean).join(" ");
}