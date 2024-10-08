import { CoinGeckoClient } from 'coingecko-api-v3';

const cgClient = new CoinGeckoClient({
    autoRetry: true
});

export const fetchPriceUSD = async (asset: string): Promise<number> => {
    return (await cgClient.simplePrice({
        ids: asset,
        vs_currencies: 'usd',
    })).aptos.usd;
}