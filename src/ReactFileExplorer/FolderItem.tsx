import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import FileItem from './FileItem';
import type { Handle } from './types';

interface FolderItemProps {
    handle: FileSystemDirectoryHandle;
    onClick?: (handle: FileSystemDirectoryHandle) => void;
    onClickItem?: (Handle: Handle) => void;
}

async function loadChildHandles(handle: FileSystemDirectoryHandle) {
    const children: Handle[] = [];

    // 使用异步迭代器遍历目录
    for await (const [_, childHandle] of handle.entries()) {
        // 将每个子句柄添加到数组中
        children.push(childHandle);
    }
    return children.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? 1 : -1;
    });
}

export default function FolderItem({ handle, onClick, onClickItem }: FolderItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [childrenHandles, setChildrenHandles] = useState<Handle[] | undefined>();

    const expandFolder = useCallback(async () => {
        if (childrenHandles === undefined) {
            setChildrenHandles(await loadChildHandles(handle));
        }
        setExpanded(true);
    }, [childrenHandles, handle]);

    const handleClickFolder = useCallback(async () => {
        onClick?.(handle);
        onClickItem?.(handle);

        if (expanded) {
            setExpanded(false);
            return;
        }
        await expandFolder();
    }, [expandFolder, expanded, handle, onClick, onClickItem]);

    const handleClickItem = useCallback(
        (handle: Handle) => {
            onClickItem?.(handle);
        },
        [onClickItem],
    );

    const renderFiles = useCallback(() => {
        if (childrenHandles === undefined) return;

        return (
            <ul className="folder-item__list">
                {childrenHandles.map((handle) => {
                    return handle.kind === 'directory' ? (
                        <FolderItem
                            key={handle.name}
                            handle={handle}
                            onClickItem={handleClickItem}
                        />
                    ) : (
                        <FileItem key={handle.name} handle={handle} onClickItem={handleClickItem} />
                    );
                })}
            </ul>
        );
    }, [childrenHandles, handleClickItem]);

    const arrowClassName = useMemo(() => {
        const prefix = `folder-item__name__arrow`;
        return clsx(prefix, { [`${prefix}--expanded`]: expanded });
    }, [expanded]);

    return (
        <div className="folder-item">
            <div className="folder-item__name" onClick={handleClickFolder}>
                <span className={arrowClassName}>&gt;</span>
                &nbsp;{handle.name}
            </div>
            {expanded ? renderFiles() : null}
        </div>
    );
}
