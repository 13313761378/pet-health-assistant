import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.env.UNI_INPUT_DIR = projectRoot;
process.env.UNI_CLI_CONTEXT = projectRoot;

await import("@dcloudio/vite-plugin-uni/dist/cli/index.js");
