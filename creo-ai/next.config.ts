import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    turbopack: {
        // Tell Turbopack to use creo-ai/ as the root, not the parent CREO-AI/ directory.
        // This prevents it from getting confused by the root package.json/lockfile.
        root: path.resolve(__dirname),
    },
};

export default nextConfig;
