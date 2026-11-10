import {EventEmitter} from 'node:events';
const key=Symbol.for('trilha.support.events');
if(!globalThis[key]){globalThis[key]=new EventEmitter();globalThis[key].setMaxListeners(1000)}
export const supportEvents=globalThis[key];
