import { useCallback } from 'react';

import type { Handle } from './types';

interface FileItemProps {
    handle: FileSystemFileHandle;
    onClick?: (handle: FileSystemFileHandle) => void;
    onClickItem?: (Handle: Handle) => void;
}

export default function FileItem({ handle, onClick, onClickItem }: FileItemProps) {
    const handleClick = useCallback(() => {
        onClick?.(handle);
        onClickItem?.(handle);
    }, [handle, onClick, onClickItem]);

    return (
        <div className="file-item" onClick={handleClick}>
            {handle.name}
        </div>
    );
}
