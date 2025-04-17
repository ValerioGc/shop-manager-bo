#!/usr/bin/env node
import { execSync } from 'child_process';
import os from 'os';

const mode: string = process.argv[2] || 'production';
const isWindows = os.platform() === 'win32';

// Determine the script name based on OS
const scriptName = isWindows ? 'frontend_production.cmd' : 'frontend_production.sh';
const scriptPath = `./.docker/scripts/${scriptName}`;

console.log(`Running ${scriptPath} on ${isWindows ? 'Windows' : 'Unix-like OS'} in ${mode} mode`);

try {
    execSync(`${scriptPath} ${mode}`, { stdio: 'inherit' });
} catch (error: unknown) {
    console.error('Deployment failed:', error);
    process.exit(1);
}
