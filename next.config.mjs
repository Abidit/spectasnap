/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // avoid double-init of MediaPipe
  webpack: (config) => {
    // Ignore MediaPipe WASM binary warnings
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
