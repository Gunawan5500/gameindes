import { spawnSync } from "node:child_process";

const candidates = process.platform === "win32"
  ? ["python", "py", "python3"]
  : ["python3", "python"];

for (const cmd of candidates) {
  const probe = spawnSync(cmd, ["--version"], { stdio: "ignore" });
  if (probe.status === 0) {
    const res = spawnSync(cmd, ["tools/import_itch_assets.py"], { stdio: "inherit" });
    process.exit(res.status ?? 0);
  }
}

console.error("ERROR: Python tidak ditemukan. Pasang Python 3 lalu jalankan: pip install Pillow");
process.exit(1);
