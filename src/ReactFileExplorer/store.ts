import type { Handle } from './types';

type DroppedCallback = (to: Handle) => void;
export const store = {
    draggingHandle: undefined as undefined | Handle,
    droppedCallbacks: [] as DroppedCallback[],
    publishDropped(to: Handle) {
        this.droppedCallbacks.forEach((cb) => cb(to));
        this.draggingHandle = undefined;
        this.droppedCallbacks = [];
    },
    subscribeDropped(cb: DroppedCallback) {
        this.droppedCallbacks.push(cb);
    },
    unsubscribeDropped(cb: DroppedCallback) {
        this.droppedCallbacks.splice(this.droppedCallbacks.indexOf(cb), 1);
    },
};
