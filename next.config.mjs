import MillionLint from "@million/lint";
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["grammy", "@grammyjs/menu", "aptos", "got", "cacheable-request", "keyv", "@aptos-labs/ts-sdk", "@aptos-labs/aptos-client"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/markets",
        permanent: true,
      },
    ];
  },
};

export default MillionLint.next({
  rsc: true
})(nextConfig);
