const fs = require("fs");
const path = require("path");

const webRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(webRoot, "public", "models", "asset-manifest.json");
const minBytes = 1024;

function readManifest() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing asset manifest: ${manifestPath}`);
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function validateEntry(entry, type) {
  const absolutePath = path.resolve(webRoot, "..", "..", entry.file_path);
  const label = type === "bike"
    ? `${entry.brand} ${entry.name} ${entry.year}`
    : `${entry.category}: ${entry.name}`;

  if (!fs.existsSync(absolutePath)) {
    return [`Missing ${type} asset for ${label}: ${entry.file_path}`];
  }

  const stats = fs.statSync(absolutePath);
  if (!absolutePath.endsWith(".glb")) {
    return [`Invalid extension for ${label}: expected .glb`];
  }
  if (stats.size < minBytes) {
    return [`Asset looks too small for ${label}: ${stats.size} bytes`];
  }

  return [];
}

function main() {
  const manifest = readManifest();
  const failures = [
    ...(manifest.bikes || []).flatMap((entry) => validateEntry(entry, "bike")),
    ...(manifest.parts || []).flatMap((entry) => validateEntry(entry, "part")),
  ];

  if (failures.length) {
    console.error("MotoForge asset validation failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("MotoForge asset validation passed.");
}

main();
