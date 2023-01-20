import { atom, selector } from "recoil";
import { getLangDescription } from "../i18n/i18n";

export const languageAtom = atom({
  key: "languageAtom",
  default: "ja",
});

export const languageSelector = selector({
  key: "languageSelector",
  get: ({ get }) => getLangDescription(get(languageAtom)),
});
