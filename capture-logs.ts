import fs from 'fs';
import { spawn } from 'child_process';

const logFile = 'server-debug.log';
const server = spawn('npm', ['run', 'start:dev'], {
    cwd: 'd:/VentureQueue/PostPilot/server',
    shell: true
});

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

server.stdout.pipe(logStream);
server.stderr.pipe(logStream);

console.log('Server started for debugging. Logs being written to server-debug.log');

setTimeout(() => {
    console.log('Stopping debug server...');
    server.kill();
    process.exit(0);
}, 60000); // Wait 60 seconds
