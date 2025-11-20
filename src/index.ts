#!/usr/bin/env node
import { input, confirm, select } from '@inquirer/prompts';
import { resolve, join, basename } from "node:path";
import fs from 'node:fs';
import { createPackage } from './createPackage.js';
import chalk from 'chalk';
import { canImportTs, packageManager } from './env.js';

process.on('uncaughtException', (error) => {
    if(error instanceof Error && error.name === "ExitPromptError") return;
});

init();

async function init() {
    let directory = await input({
        message: "Where would you like to create your project? (Leave blank for current directory)"
    });
    
    let path = resolve(directory);

    // if the path exists make sure it's empty
    if(fs.existsSync(path)) {
        if(fs.readdirSync(path).length > 0) {
            let conf = await confirm({
                message: "That folder is non-empty, do you wish to proceed?",
                default: false
            });
            if(!conf) return;
        }
    }

    let type = await select({
        message: "Would you like to make a single script or a workspace?",
        choices: [
            { name: "Single Script", value: "single" },
            { name: "Workspace", value: "workspace" }
        ]
    });

    if(type === "single") {
        await createSingle(path);
    } else {
        await createWorkspace(path);
    }

    // create .gitignore
    fs.writeFileSync(join(path, ".gitignore"), "node_modules");

    console.log(`Done! Run ${chalk.italic(`${packageManager} run build`)} or ${chalk.italic(`${packageManager} run serve`)} to get started.`);
}

async function createWorkspace(path: string) {
    const srcPath = join(path, "plugins");
    if(!fs.existsSync(srcPath)) {
        fs.mkdirSync(srcPath, { recursive: true });
    }

    const useTs = await confirm({
        message: "Would you like to use typescript?"
    });

    // Create the workspace config
    const config =
`import { workspaceConfig } from "@gimloader/build";

export default workspaceConfig({
    outdir: "./build",
    alias: {
        "Hello": "./plugins/hello"
    }
});`;

    let configFile = useTs && canImportTs ? 'gimloader.config.ts' : 'gimloader.config.js';
    fs.writeFileSync(join(path, configFile), config);

    // Create a sample plugin
    const pluginPath = join(srcPath, "hello");
    fs.mkdirSync(pluginPath, { recursive: true });

    const file = "api.net.onLoad(() => console.log('Hello world!'));";
    const inputFile = useTs ? 'index.ts' : 'index.js';
    fs.writeFileSync(join(pluginPath, inputFile), file);

    // Create the plugin's config
    const singleConfig =
`import { singleConfig } from "@gimloader/build";

export default singleConfig({
    input: "./${inputFile}",
    name: "HelloWorld",
    description: "An example Gimloader plugin",
    author: "Gimloader",
    version: "1.0.0"
});`;

    const singleConfigFile = useTs && canImportTs ? 'gimloader.config.ts' : 'gimloader.config.js';
    fs.writeFileSync(join(pluginPath, singleConfigFile), singleConfig);

    createPackage(path, basename(path));
}

async function createSingle(path: string) {
    const type = await select({
        message: "Would you like to make a plugin or a library?",
        choices: [
            { name: "Plugin", value: "plugin" },
            { name: "Library", value: "library" }
        ]
    });
    const capitalized = type[0].toUpperCase() + type.slice(1);
    
    const name = await input({
        message: `${capitalized} name:`,
        validate: (v) => v != ""
    });
    
    const description = await input({
        message: `${capitalized} description:`,
        validate: (v) => v != ""
    });

    const author = await input({
        message: `${capitalized} author:`,
        validate: (v) => v != ""
    });

    const useTs = await confirm({
        message: "Would you like to use typescript?"
    });

    const srcPath = join(path, "src");
    if(!fs.existsSync(srcPath)) {
        fs.mkdirSync(srcPath, { recursive: true });
    }

    // create the input file
    const file = "api.net.onLoad(() => console.log('Hello world!'));";

    const inputFile = useTs ? 'index.ts' : 'index.js';
    fs.writeFileSync(join(path, "src", inputFile), file);

    // create gimloader.config.js
    const config =
`import fs from 'fs';
import { singleConfig } from "@gimloader/build";

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default singleConfig({
    input: "./src/${inputFile}",
    name: "${name}",
    description: "${description}",
    author: "${author}",
    version: pkg.version
});`;

    const configFile = useTs && canImportTs ? 'gimloader.config.ts' : 'gimloader.config.js';
    fs.writeFileSync(join(path, configFile), config);

    createPackage(path, name, description, author);
}