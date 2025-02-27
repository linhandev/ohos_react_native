#!/usr/bin/env -S npx tsx

import WebSocket from 'ws';
import {HdcRunner} from './HdcRunner';
import {Command} from 'commander';

const program = new Command();
program
  .name('HdcServer')
  .description(
    'Server that executes commands received via WebSocket using the "hdc shell ..." command.',
  )
  .option('--port <value>', 'Optional port argument for the server', '8083')
  .option(
    '--target <value>',
    'Optional Device ID argument for running the hdc shell command, to be specified only when multiple devices are connected',
    '',
  )
  .parse(process.argv);

const port = program.opts().port;
const target = program.opts().target;
const wss = new WebSocket.Server({port: port});
const runner = new HdcRunner(target);

console.log('Waiting on connection...');

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  ws.on('message', (data: string) => {
    const {id, cmd} = JSON.parse(data);
    const result = runner.run(cmd);
    ws.send(JSON.stringify({id, result}));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
