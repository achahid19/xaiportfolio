import path from "path";
import type { NextConfig } from "next";

// Only resolve node_modules from the real project root when running
// from inside a git worktree (.claude/worktrees/*). On Vercel __dirname
// is already the project root so we must not apply this override.
const isWorktree = __dirname.includes(".claude/worktrees");
const projectRoot = isWorktree
  ? path.resolve(__dirname, "../../..")
  : __dirname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  ...(isWorktree && {
    turbopack: {
      root: projectRoot
    }
  })
};

export default nextConfig;
