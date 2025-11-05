
const nextConfig = { 
  experimental: { 
    serverActions: { 
      allowedOrigins: ['*'] 
    } 
  },
  webpack: (config, { dev, isServer }) => {
    // Enable Sentry webpack integration in production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/node': '@sentry/browser',
      }
    }
    return config
  }
};

export default nextConfig;
