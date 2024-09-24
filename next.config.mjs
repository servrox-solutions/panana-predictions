/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["grammy", "@grammyjs/menu"],
  async headers() {
    return [
      {
        source: "/mizuwallet-connect-manifest.json",
        headers: [
          {
            key: "Access-Control-Allow-Origin", value: "https://proxy.mz.xyz"
          },
        ],
      },
    ]
  },
};

export default nextConfig;
