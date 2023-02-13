import * as Gluon from '@gluon-framework/gluon';
import { SlippiEventEmitter } from './slippi.js';

const isDev: boolean = process.env.NODE_ENV === "development";
const window = await Gluon.open(isDev ? 'http://127.0.0.1:1420' : '../dist/index.html', {
  allowHTTP: isDev,
  // TODO set this to min size
  windowSize: [ 400, 600 ]
});

// Close wrapper to ensure that closing the browser also stops the nodejs process
var _close = window.close;
window.close = () => {
  _close();
  process.exit();
};

// Start Slippi background procedure
const slippi = new SlippiEventEmitter();
slippi.on("audio_pos", (audioPos) => {
  window.ipc.send("audio_pos", audioPos);
});
slippi.on("connection_status", (status) => {
  window.ipc.send("connection_status", status);
});