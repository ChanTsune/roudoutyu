import { useRecoilState, useRecoilValue } from "recoil";
import { languageAtom, languageSelector } from "../atoms/language";

export default function SettingsPage() {
  const [language, setLanguage] = useRecoilState(languageAtom);
  const desc = useRecoilValue(languageSelector);
  return (
    <div className="container">
      <div className="row">
        <div>
          <p>
            <h1>{desc.language}</h1>
          </p>
          <p>
            <button type="button" onClick={() => setLanguage("en")}>
              English
            </button>
            <button type="button" onClick={() => setLanguage("ja")}>
              日本語
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
