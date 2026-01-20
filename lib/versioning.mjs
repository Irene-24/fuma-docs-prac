import fs from "node:fs";
import path from "node:path";

export function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function readVersionDirs(root) {
  if (!isDirectory(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries
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
}

export function detectLatestVersionNumber(root) {
  const versions = readVersionDirs(root);
  return versions.at(-1)?.num ?? null;
}

export function detectLatestVersionName(root) {
  const versions = readVersionDirs(root);
  return versions.at(-1)?.name ?? null;
}

export function collectVersionRoutes({
  contentRoot,
  baseUrl = "/docs",
  versionName,
  isLatest = false,
}) {
  const urls = new Set();
  const versionUrl = `${baseUrl}/${versionName.toLowerCase()}`;
  const versionDir = path.join(contentRoot, versionName);
  const mdExts = new Set([".mdx", ".md"]);

  // root paths
  urls.add(versionUrl);
  if (isLatest) urls.add(baseUrl);

  const walk = (dir, relParts = []) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full, [...relParts, e.name]);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (!mdExts.has(ext)) continue;
        const baseName = path.basename(e.name, ext);

        const segs = baseName === "index" ? relParts : [...relParts, baseName];
        const versionRoute = [versionUrl, ...segs]
          .join("/")
          .replace(/\/+$/, "");
        urls.add(versionRoute);
        if (isLatest) {
          const baseRoute = [baseUrl, ...segs].join("/").replace(/\/+$/, "");
          urls.add(baseRoute || baseUrl);
        }
      }
    }
  };

  walk(versionDir);
  return urls;
}
