import fs from "node:fs";
import path from "node:path";

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function getLatestVersionDir(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const versions = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .map((name) => {
      const m = /^v(\d+)$/i.exec(name);
      if (!m) return null;
      const num = Number(m[1]);
      if (!Number.isFinite(num)) return null;
      return { name, num };
    })
    .filter(Boolean)
    .sort((a, b) => a.num - b.num);
  return versions.at(-1)?.name ?? `v${process.env.NEXT_PUBLIC_LATEST_VERSION}`;
}

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
  if (!isDir(contentRoot)) {
    console.error("No content/docs directory found:", contentRoot);
    process.exit(1);
  }
  const latest = getLatestVersionDir(contentRoot);
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
