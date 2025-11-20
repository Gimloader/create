import fs from 'node:fs';
import { join } from 'node:path';
import { execSync, type ExecSyncOptions } from 'node:child_process';
import chalk from 'chalk';
import { packageManager } from './env.js';

export function createPackage(path: string, name: string, description?: string, author?: string) {
    process.stdout.write('⏳' + chalk.bold(`Installing dependencies with ${packageManager}`));

    let pkg = {
        name: name.toLowerCase().replaceAll(" ", "-"),
        version: "1.0.0",
        author,
        description,
        private: true,
        type: "module",
        scripts: {
            build: "gimloader build",
            serve: "gimloader serve"
        }
    };

    fs.writeFileSync(join(path, 'package.json'), JSON.stringify(pkg, null, 2));

    const execOptions: ExecSyncOptions = { cwd: path, stdio: "ignore" };
    if(packageManager === "bun") {
        execSync('bun add -D @gimloader/build @types/gimloader', execOptions);
    } else if(packageManager === "npm") {
        execSync('npm i -D @gimloader/build @types/gimloader', execOptions);
    } else if(packageManager === "deno") {
        execSync('deno add -D npm:@gimloader/build npm:@types/gimloader', execOptions);
    }

    console.log('\x1b[2K\r' + chalk.green('✔') + chalk.bold(' Installing dependencies'))
}