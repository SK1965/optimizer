import { app } from './src/app';
import { connectDB } from './src/db';
import http from 'http';

console.log('Starting DB...');
connectDB().then(() => {
  const server = app.listen(3002, () => {
    console.log('Test server up on 3002');
    
    console.log('Sending GET request...');
    http.get('http://localhost:3002/api/submission/12345', (res) => {
        console.log('Status:', res.statusCode);
        res.on('data', d => console.log('Data:', d.toString()));
        setTimeout(() => process.exit(0), 1000);
    }).on('error', e => {
        console.log('Fetch error:', e);
        setTimeout(() => process.exit(1), 1000);
    });
  });
}).catch(err => {
    console.error('DB Init Error:', err);
});
