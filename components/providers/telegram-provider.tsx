"use client";

import { useTelegramMock } from "@/lib/hooks/useTelegramMock";
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from "@telegram-apps/sdk-react";
import { Fragment, PropsWithChildren, useEffect } from "react";

export function TelegramProvider({ children, ...props }: PropsWithChildren) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  const miniApp = useMiniApp(true);
  const themeParams = useThemeParams(true);
  const viewport = useViewport(true);
  const initDataRaw = useLaunchParams(true)?.initDataRaw;
  const debug = useLaunchParams(true)?.startParam === "debug";

  useEffect(() => {
    if (debug) {
      import("eruda").then((lib) => lib.default.init());
    }
  }, [debug]);

  useEffect(() => {
    if (!miniApp) return;

    miniApp.ready();
    miniApp.setHeaderColor("#ffc80a");
    miniApp.setBgColor("#ffc80a");
    //   miniApp.setBottomBarColor("#ffc80a");
    console.log(miniApp);
  }, [miniApp]);

  useEffect(() => {
    if (!viewport) return;

    if (!viewport.isExpanded) {
      viewport.expand();
    }

    bindViewportCSSVars(viewport);
  }, [viewport]);

  useEffect(() => {
    if (!miniApp || !themeParams) return;

    bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    if (!themeParams) return;

    bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    if (!initDataRaw) return;

    fetch("/api/telegram/auth", {
      method: "POST",
      headers: {
        Authorization: `tma ${initDataRaw}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [initDataRaw]);

  return <Fragment {...props}>{children}</Fragment>;
}
