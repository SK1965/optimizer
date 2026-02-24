const fs = require('fs');
const { execSync } = require('child_process');

let results = [];
results.push('Node Version: ' + process.version);
try {
  const tscVersion = execSync('npx tsc -v', {encoding: 'utf8', stdio: 'pipe'}).trim();
  results.push('TSC Version: ' + tscVersion);
} catch (e) {
  results.push('TSC execution failed: ' + e.message);
}

try {
  require('cors');
  results.push('cors module: installed');
} catch (e) {
  results.push('cors module: missing');
}

fs.writeFileSync('diag_results.txt', results.join('\n'));
