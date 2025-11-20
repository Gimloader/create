const executable = process.argv[0].replaceAll('\\', '/').split("/").pop();
export const packageManager = executable.includes("bun") ? "bun" : executable.includes("deno") ? "deno" : "npm";
export const canImportTs = packageManager === "deno" || process.versions.node >= "22.18.0";