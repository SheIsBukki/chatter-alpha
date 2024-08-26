// import removeImports from "next-remove-imports";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// await import("./src/env.js");
import { env } from "./src/env.js";
// await import("next-remove-imports");
// module.exports = removeImports({});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  // experimental: { esmExternals: true },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["geist"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        // pathname: "/account123/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
  env: {
    DATABASE_URL: env.DATABASE_URL,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_PUBLIC_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: env.NODE_ENV,
    SUPABASE_PUBLIC_KEY: env.SUPABASE_PUBLIC_KEY,
    SUPABASE_URL: env.SUPABASE_URL,
    UNSPLASH_ACCESS_KEY: env.UNSPLASH_API_ACCESS_KEY,
    UNSPLASH_SECRET_KEY: env.UNSPLASH_API_SECRET_KEY,
  },
};

export default config;
