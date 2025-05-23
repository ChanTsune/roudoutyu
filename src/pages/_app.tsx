import type { AppProps } from "next/app";
import Link from "next/link";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";

import "../style.css";
import "../App.css";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  useEffect(() => {
    const unlisten = (async () =>
      await listen("check-update", (event) => {
        void (async (event) => {
          if (event.payload as boolean) {
            void message("This is latest version of 労働中");
          } else {
            const result = await ask(
              "Open download page?",
              "New version of 労働中 are available!"
            );
            if (result) {
              void open(
                "https://github.com/ChanTsune/roudoutyu/releases/latest"
              );
            }
          }
        })(event);
      }))();
    return () => {
      void (async () => (await unlisten)())();
    };
  }, []);

  const menuItems = [
    {
      name: "Timer",
      href: "/",
    },
  ];
  return (
    <RecoilRoot>
      <div
        style={{
          display: "flex",
          height: "100vh",
        }}
      >
        <aside
          className={openSideMenu ? "sidebar" : "sidebar closed"}
          style={{
            flexGrow: openSideMenu ? 1 : 0,
          }}
          onClick={() => setOpenSideMenu((v) => !v)}
        >
          {openSideMenu &&
            menuItems.map((item) => {
              return (
                <Link className="item" href={item.href} key={item.name}>
                  {item.name}
                </Link>
              );
            })}
        </aside>
        <main style={{ flexGrow: 4 }}>
          <Component {...pageProps} />
        </main>
      </div>
    </RecoilRoot>
  );
}
