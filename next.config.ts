import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  env: {
    SP_ID:"131910af61fa470ebc05cefd7a238c0d",
    SP_SECRET:"33ab65ffd830480dbad92224ee0d9076",
  },
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default nextConfig;
