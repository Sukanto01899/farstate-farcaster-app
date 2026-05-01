/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "docs.monad.xyz" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "basescan.org" },
      { protocol: "https", hostname: "arweave.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:asset(icon.png|splash.png|feed.png|gift.gif|offer.gif|discount.gif|Inter.ttf|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
