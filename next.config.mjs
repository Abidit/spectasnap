/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // avoid double-init of MediaPipe
  turbopack: {},          // opt-in to Turbopack, silence warning
  async headers() {
    return [
      {
        source: '/embed/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        source: '/((?!embed).*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
