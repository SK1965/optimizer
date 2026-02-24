const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running tsc...');
  const tscOut = execSync('npx tsc', { encoding: 'utf8' });
  fs.writeFileSync('test_run_out.log', 'TSC SUCCESS:\n' + tscOut);
} catch (e) {
  fs.writeFileSync('test_run_out.log', 'TSC ERROR:\n' + e.stdout + '\n' + e.stderr);
}

try {
  console.log('Running node...');
  const nodeOut = execSync('node --env-file=.env dist/src/index.js', { encoding: 'utf8', timeout: 5000 });
  fs.appendFileSync('test_run_out.log', '\nNODE SUCCESS:\n' + nodeOut);
} catch (e) {
  fs.appendFileSync('test_run_out.log', '\nNODE ERROR:\n' + e.stdout + '\n' + e.stderr);
}
