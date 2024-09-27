import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

export const isTelegramApp = (): boolean => {
  let isMocked = false;
  try {
    const launchParams = retrieveLaunchParams();
    isMocked = launchParams.platform === "mock";
  } catch (error) {
    isMocked = true;
  }

  return !isMocked;
};
