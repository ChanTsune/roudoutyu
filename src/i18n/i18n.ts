import { Descritption, initDescription } from "./description";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

const Languages = new Map([
  ["en", en],
  ["ja", ja],
]);

export function getLangDescription(language: string): Descritption {
  return Languages.get(language) || initDescription();
}
