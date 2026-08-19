import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile testing via local IP
  allowedDevOrigins: ['192.168.1.4', '192.168.1.6'],
};

export default nextConfig;
