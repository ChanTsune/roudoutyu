import { Descritption, initDescription } from "./description";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

const Languages = [
    'en',
    'ja',
]

const Descriptions = {
    en,
    ja,
}

export function getLangDescription(language: string): Descritption {
    let desc:Descritption=initDescription();

    Languages.map((lang) => {
        desc = Object.hasOwn(Descriptions, lang)
        ? Descriptions[language as keyof typeof Descriptions]
        : Descriptions.en;//console.log(`${lang} is not supported`);
    })
    return desc;
}
