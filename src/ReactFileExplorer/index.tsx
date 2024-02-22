import clsx from 'clsx';
import { type CSSProperties, useCallback } from 'react';

import FolderItem from './FolderItem';
import './style.scss';
import { FsDir, type FsNode } from './model';

interface ReactFileExplorerProps {
    className?: string;
    style?: CSSProperties;
    directory: FileSystemDirectoryHandle;
    onClickItem?: (handle: FsNode) => void;
}

export default function ReactFileExplorer(props: ReactFileExplorerProps) {
    const handleClickItem = useCallback(
        (fsNode: FsNode) => {
            props.onClickItem?.(fsNode);
        },
        [props],
    );

    return (
        <nav className={clsx('explorer', props.className)} style={props.style}>
            <FolderItem folder={new FsDir(props.directory)} onClickItem={handleClickItem} />
        </nav>
    );
}
