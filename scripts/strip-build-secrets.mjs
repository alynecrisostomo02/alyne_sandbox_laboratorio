import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const buildRoot = path.resolve("dist");
const secretFilePattern = /^(?:\.dev\.vars|\.env)(?:\..+)?$/;
let removed = 0;

async function removeCopiedSecrets(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await removeCopiedSecrets(target);
      continue;
    }

    if (secretFilePattern.test(entry.name)) {
      await rm(target, { force: true });
      removed += 1;
    }
  }
}

await removeCopiedSecrets(buildRoot);
console.log(`Artefatos secretos removidos do build: ${removed}.`);
