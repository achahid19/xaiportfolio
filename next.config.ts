import path from "path";
import type { NextConfig } from "next";

// When running from a git worktree inside .claude/worktrees/*, resolve
// node_modules from the real project root three levels up.
const projectRoot = path.resolve(__dirname, "../../..");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  turbopack: {
    root: projectRoot
  }
};

export default nextConfig;
