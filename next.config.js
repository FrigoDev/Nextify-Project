/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "dailymix-images.scdn.co",
      "daily-mix.scdn.co",
      "lineup-images.scdn.co",
      "mosaic.scdn.co",
      "i.scdn.co",
      "t.scdn.co",
      "platform-lookaside.fbsbx.com",
      "platform-lookaside.fbsbx.com",
    ],
  },
};

module.exports = nextConfig;
