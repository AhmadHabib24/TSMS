import type { NextConfig } from "next";
// @ts-expect-error - next-pwa does not provide typescript definitions
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  turbopack: {}
};

export default withPWA(nextConfig);
