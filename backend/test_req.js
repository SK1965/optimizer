const { exec } = require('child_process');
const http = require('http');

console.log('Starting backend...');
const child = exec('npm run dev');

let output = '';
child.stdout.on('data', d => { output += d; process.stdout.write(d); });
child.stderr.on('data', d => { output += d; process.stderr.write(d); });

// Wait 4 seconds for server to start, then send request
setTimeout(() => {
  console.log('Sending GET request to trigger crash...');
  http.get('http://localhost:3000/api/submission/12345', (res) => {
    console.log('Got response: ' + res.statusCode);
  }).on('error', (e) => {
    console.log('Request error: ' + e.message);
  });
}, 4000);

// Wait another 3s to capture crash output, then exit
setTimeout(() => {
  require('fs').writeFileSync('crash_test.log', output);
  child.kill();
  console.log('Finished crash test.');
  process.exit(0);
}, 7000);
