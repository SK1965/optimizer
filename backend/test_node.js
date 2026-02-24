const fs = require('fs');
const { execSync } = require('child_process');
try {
  const nodeOut = execSync('node --env-file=.env dist/src/index.js', { encoding: 'utf8' });
  fs.writeFileSync('node_crash.log', 'SUCCESS:\n' + nodeOut);
} catch (e) {
  fs.writeFileSync('node_crash.log', 'ERROR:\n' + e.message + '\nSTDERR:\n' + e.stderr + '\nSTDOUT:\n' + e.stdout);
}
