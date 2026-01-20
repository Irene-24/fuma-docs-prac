import { createMDX } from "fumadocs-mdx/next";
import { detectLatestVersionNumber } from "./lib/versioning.mjs";
import path from "node:path";

const latestFromFS = detectLatestVersionNumber(
  path.join(process.cwd(), "content", "docs"),
);
const envVersion = Number(process.env.NEXT_PUBLIC_LATEST_VERSION);
const LATEST_VERSION =
  latestFromFS ?? (Number.isFinite(envVersion) ? envVersion : 1);

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",

  async rewrites() {
    return [
      {
        source: "/docs",
        destination: `/docs/v${LATEST_VERSION}`,
      },
      {
        source: "/docs/",
        destination: `/docs/v${LATEST_VERSION}`,
      },
    ];
  },
};

export default withMDX(config);
