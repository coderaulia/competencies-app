import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(
  repoRoot,
  "node_modules",
  "@pdftron",
  "webviewer",
  "public"
);
const targetDir = path.join(repoRoot, "public", "webviewer");

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function syncWebViewerAssets() {
  const hasSource = await pathExists(sourceDir);
  if (!hasSource) {
    console.warn(
      "[sync-webviewer] Skipped: node_modules/@pdftron/webviewer/public was not found."
    );
    process.exitCode = 0;
    return;
  }

  await mkdir(path.dirname(targetDir), { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await cp(sourceDir, targetDir, { recursive: true });

  console.log("[sync-webviewer] Synced WebViewer assets to public/webviewer.");
}

await syncWebViewerAssets();
