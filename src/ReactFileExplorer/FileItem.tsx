import type { DragEvent } from 'react';
import { useCallback } from 'react';

import type { FsFile, FsNode } from './model';
import { store } from './store';

interface FileItemProps {
    file: FsFile;
    onClick?: (handle: FsFile) => void;
    onMoved: (from: FsNode, to: FsNode) => void;
}

export default function FileItem({ file, onClick, onMoved }: FileItemProps) {
    const handleClick = useCallback(() => {
        onClick?.(file);
    }, [file, onClick]);

    const handleDragStart = useCallback(
        (e: DragEvent) => {
            e.stopPropagation();

            store.draggingNode = file;
            store.onDropped = (to: FsNode) => onMoved(file, to);
        },
        [file, onMoved],
    );

    const handleDragEnd = useCallback((e: DragEvent) => {
        e.stopPropagation();

        store.draggingNode = undefined;
        store.onDropped = undefined;
    }, []);

    return (
        <div
            className="file-item"
            draggable
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {file.name}
        </div>
    );
}
