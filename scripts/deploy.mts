#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, statSync, unlinkSync } from 'fs';
import { readFileSync } from 'fs';

const logo = readFileSync('./.docker/logo.txt', 'utf8');

function runCommand(command: string, log?: boolean): void {
    if (log == null || log != false) console.log(`\n⚗️  Running: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
}
const mode: string = process.argv[2];

/**
 * Main function to deploy the project in the specified mode.
 *
 * @param mode - The mode in which to deploy the project. Can be 'test' or 'prod'.
 */
try {
    if (mode == null || (mode !== 'test' && mode !== 'prod')) {
        console.error('\n❌ Error: must specify the type of deploy (test or prod).\n');
        process.exit(1);
    }

    console.log(`\n🚀 Starting the deployment process for ${mode}.\n`);

    console.log('\n' + logo);

    // --- Step 2: Stash verify ---
    runCommand('git stash list > stash.txt');
    if (existsSync('stash.txt')) {
        const size = statSync('stash.txt').size;
        if (size !== 0) {
            console.error(
                '\n❌ Error: there are changes in the stash. Please clean the stash before proceeding.\n',
            );
            unlinkSync('stash.txt');
            process.exit(1);
        }
        unlinkSync('stash.txt');
    }

    // --- Step 3: Branch change, pull e merge ---
    console.log(`\n⚙️  Branch change to deploy_${mode}`);
    runCommand(`git checkout deploy_${mode}`);

    runCommand('git pull');

    console.log(`\n⚙️  Merge branch origin/dev into deploy_${mode}`);
    runCommand(`git merge origin/dev --no-ff -X theirs -m "Deploy ${mode}"`);

    // --- Step 4: Commit e Push ---
    runCommand('git push');

    console.log(`\n❎  Pipeline deploy di ${mode} avviata, deploy completato con successo.\n`);

    // --- Step 5: Change back to dev branch ---
    runCommand('git checkout dev', false);
} catch (error) {
    console.error('\n❌ Deployment failed: ', error + '\n');
    process.exit(1);
}
