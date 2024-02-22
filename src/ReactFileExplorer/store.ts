import type { FsNode } from './model';

export const store = {
    draggingNode: undefined as FsNode | undefined,
    onDropped: undefined as ((to: FsNode) => void) | undefined,
};
