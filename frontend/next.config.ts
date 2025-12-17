import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable external access for WSL development
  // The -H 0.0.0.0 flag is set in package.json scripts
  // This ensures the dev server binds to all interfaces
  
  headers() {
    // Required by FHEVM 
    return Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  },

  // Webpack configuration for better compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
};

export default nextConfig;
