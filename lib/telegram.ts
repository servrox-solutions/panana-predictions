import { retrieveLaunchParams } from '@telegram-apps/sdk-react';



export const isTelegramApp = () => {
    const launchParams = retrieveLaunchParams();
    return launchParams.platform !== "mock";
};