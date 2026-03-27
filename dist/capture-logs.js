"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const logFile = 'server-debug.log';
const server = (0, child_process_1.spawn)('npm', ['run', 'start:dev'], {
    cwd: 'd:/VentureQueue/PostPilot/server',
    shell: true
});
const logStream = fs_1.default.createWriteStream(logFile, { flags: 'a' });
server.stdout.pipe(logStream);
server.stderr.pipe(logStream);
console.log('Server started for debugging. Logs being written to server-debug.log');
setTimeout(() => {
    console.log('Stopping debug server...');
    server.kill();
    process.exit(0);
}, 60000);
//# sourceMappingURL=capture-logs.js.map