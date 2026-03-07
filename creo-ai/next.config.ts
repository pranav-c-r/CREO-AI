import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Turbopack disabled to reduce RAM usage and fix tailwindcss resolution issues
    // Use standard webpack dev server instead
};

export default nextConfig;
