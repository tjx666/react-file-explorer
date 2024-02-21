import clsx from 'clsx';
import { type CSSProperties, useCallback } from 'react';

import FolderItem from './FolderItem';
import './style.scss';
import type { Handle } from './types';

interface ReactFileExplorerProps {
    className?: string;
    style?: CSSProperties;
    directory: FileSystemDirectoryHandle;
    onClickItem?: (handle: Handle) => void;
}

export default function ReactFileExplorer(props: ReactFileExplorerProps) {
    const handleClickItem = useCallback(
        (handle: Handle) => {
            props.onClickItem?.(handle);
        },
        [props],
    );

    return (
        <nav className={clsx('explorer', props.className)} style={props.style}>
            <FolderItem handle={props.directory} onClickItem={handleClickItem} />
        </nav>
    );
}
