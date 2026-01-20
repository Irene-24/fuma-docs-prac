import fs from "node:fs";
import path from "node:path";
import { detectLatestVersionName, isDirectory } from "../lib/versioning.mjs";

// use shared utilities

function writeRootMeta(root, latest) {
  const metaPath = path.join(root, "meta.json");
  const data = {
    pages: latest ? [`...${latest}`] : [],
  };
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return metaPath;
}

function main() {
  const contentRoot = path.join(process.cwd(), "content", "docs");
  if (!isDirectory(contentRoot)) {
    console.error("No content/docs directory found:", contentRoot);
    process.exit(1);
  }
  const latest =
    detectLatestVersionName(contentRoot) ??
    `v${process.env.NEXT_PUBLIC_LATEST_VERSION}`;
  if (!latest) {
    console.error("No version directories (vN) found under content/docs");
    process.exit(1);
  }
  const metaPath = writeRootMeta(contentRoot, latest);
  console.log(
    `Updated ${path.relative(process.cwd(), metaPath)} to extract from ${latest}`,
  );
}

main();
