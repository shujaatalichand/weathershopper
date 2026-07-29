#!/usr/bin/env node

const { spawnSync } = require('child_process');

const KNOWN_FLAGS = ['env', 'tag', 'project'];
const options = { env: 'prod' };
const passthrough = [];

for (const arg of process.argv.slice(2)) {
  const match = arg.match(/^--(\w+)=(.*)$/);
  if (match && KNOWN_FLAGS.includes(match[1])) {
    options[match[1]] = match[2];
  } else {
    passthrough.push(arg);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npm', ['run', 'allure:clean']);

process.env.ENV = options.env;

const playwrightArgs = ['playwright', 'test'];
if (options.tag) playwrightArgs.push('--grep', `@${options.tag}`);
if (options.project) playwrightArgs.push(`--project=${options.project}`);
playwrightArgs.push(...passthrough);

run('npx', playwrightArgs);
