import type { DragEvent } from 'react';
import { useCallback } from 'react';

import { store } from './store';
import type { Handle } from './types';

interface FileItemProps {
    handle: FileSystemFileHandle;
    parentHandle: FileSystemDirectoryHandle;
    onClick?: (handle: FileSystemFileHandle) => void;
    onClickItem: (Handle: Handle) => void;
    onMoved: (from: Handle, to: Handle) => void;
}

export default function FileItem({ handle, onClick, onClickItem, onMoved }: FileItemProps) {
    const handleClick = useCallback(() => {
        onClick?.(handle);
        onClickItem?.(handle);
    }, [handle, onClick, onClickItem]);

    const handleDragStart = useCallback(
        (e: DragEvent) => {
            e.stopPropagation();

            store.draggingHandle = handle;
            store.subscribeDropped((to) => {
                onMoved(handle, to);
            });
        },
        [handle, onMoved],
    );

    return (
        <div className="file-item" draggable onClick={handleClick} onDragStart={handleDragStart}>
            {handle.name}
        </div>
    );
}
