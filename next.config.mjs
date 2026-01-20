import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/docs",
        destination: `/docs/v${process.env.NEXT_PUBLIC_LATEST_VERSION}`,
      },
      {
        source: "/docs/",
        destination: `/docs/v${process.env.NEXT_PUBLIC_LATEST_VERSION}`,
      },
    ];
  },
};

export default withMDX(config);
