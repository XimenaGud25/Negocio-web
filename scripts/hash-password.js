#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const readline = require('readline');

const ROUNDS = 10;
const arg = process.argv[2];

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.stdoutMuted = true;

    rl.question(query, (answer) => {
      rl.close();
      console.log();
      resolve(answer);
    });

    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) rl.output.write('*');
      else rl.output.write(stringToWrite);
    };
  });
}

async function main() {
  try {
    const password = arg || await askHidden('Contraseña: ');
    if (!password) {
      console.error('No se proporcionó contraseña');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, ROUNDS);
    console.log('Hashed (bcrypt):', hash);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
