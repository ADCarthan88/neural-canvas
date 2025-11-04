const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
