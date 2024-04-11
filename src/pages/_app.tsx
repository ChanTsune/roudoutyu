import type { AppProps } from "next/app";
import Link from "next/link";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/shell";
import { ask, message } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";

import "../style.css";
import "../App.css";
import { Theme } from "@radix-ui/themes";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Theme appearance="dark">
        <Component {...pageProps} />
      </Theme>
    </RecoilRoot>
  );
}
