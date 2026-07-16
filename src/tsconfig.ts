import fs from "node:fs";
import { join } from "node:path";

export function createTsConfig(path: string, useTs: boolean, workspace: boolean) {
    const tsconfig = {
        compilerOptions: {
            target: "ESNext",
            moduleResolution: "bundler",
            jsx: "react",
            verbatimModuleSyntax: true,
            noEmit: true,
            skipLibCheck: true,
            types: ["@gimloader/types"]
        },
        include: [
            workspace ? "./plugins/**/*" : "./src/**/*"
        ]
    };

    const name = useTs ? "tsconfig.json" : "jsconfig.json";
    fs.writeFileSync(join(path, name), JSON.stringify(tsconfig, null, 4));
}