"use client";

import { useTelegramMock } from "@/lib/hooks/useTelegramMock";
import {
  TelegramUserDb,
  upsertTelegramUser,
} from "@/lib/supabase/upsert-telegram-user";
import { isTelegramApp } from "@/lib/telegram";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
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
  useTelegramMock();

  const miniApp = useMiniApp(true);
  const themeParams = useThemeParams(true);
  const viewport = useViewport(true);
  const initDataRaw = useLaunchParams(true)?.initDataRaw;
  const debug = useLaunchParams(true)?.startParam === "debug";

  const { account } = useWallet();

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
    if (!initDataRaw || !isTelegramApp()) return;

    const authCheck = async () => {
      try {
        const response = await fetch("/api/telegram/auth", {
          method: "POST",
          headers: {
            Authorization: `tma ${initDataRaw}`,
          },
        });
        if (!response.ok) {
          miniApp?.close();
        }

        const user = await response.json();

        const update: TelegramUserDb = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium,
          walletAddresses: account ? [account.address] : [],
        };

        upsertTelegramUser(update);
      } catch {
        miniApp?.close();
      }
    };
    authCheck();
  }, [initDataRaw]);

  return <Fragment {...props}>{children}</Fragment>;
}
