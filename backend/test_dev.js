const fs = require('fs');
const { exec } = require('child_process');

console.log('Starting dev script...');
const child = exec('npm run dev');

let output = '';
child.stdout.on('data', data => { output += data; });
child.stderr.on('data', data => { output += data; });

setTimeout(() => {
  child.kill();
  fs.writeFileSync('dev_output.log', output);
  console.log('Finished capturing.');
  process.exit(0);
}, 5000);
