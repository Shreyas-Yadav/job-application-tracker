/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `http://backend:5000/api/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
