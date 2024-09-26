/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["grammy", "@grammyjs/menu"],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/markets',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
