import * as Gluon from '@gluon-framework/gluon';
import { SlippiEventEmitter } from './slippi.js';

const window = await Gluon.open('../../test.html', {
  // @ts-ignore
  windowSize: [ 800, 500 ]
});

// Start Slippi background procedure
const slippi = new SlippiEventEmitter();
slippi.on("audio_pos", (audioPos) => {
  window.ipc.send("audio_pos", audioPos);
})