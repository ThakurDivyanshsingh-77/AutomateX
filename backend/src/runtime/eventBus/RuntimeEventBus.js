import { EventEmitter } from 'events';

class RuntimeEventBusEmitter extends EventEmitter {}

export const RuntimeEventBus = new RuntimeEventBusEmitter();
