import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Config options here. */
  async headers() {
    return [
      {
        /* Matching all paths. */
        source: '/:path',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://trello.com',
          },
        ]
      }
    ]
  }
}

export default nextConfig;