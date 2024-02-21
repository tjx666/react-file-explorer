import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';

import FileItem from './FileItem';
import { store } from './store';
import type { Handle } from './types';

interface FolderItemProps {
    handle: FileSystemDirectoryHandle;
    parentHandle?: FileSystemDirectoryHandle;
    onClick?: (handle: FileSystemDirectoryHandle) => void;
    onClickItem?: (Handle: Handle) => void;
    onMoved?: (from: Handle, to: Handle) => void;
}

function sortHandles(handles: Handle[]) {
    return [...handles].sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? 1 : -1;
    });
}

async function loadChildHandles(handle: FileSystemDirectoryHandle) {
    const children: Handle[] = [];

    // 使用异步迭代器遍历目录
    for await (const [_, childHandle] of handle.entries()) {
        // 将每个子句柄添加到数组中
        children.push(childHandle);
    }
    return sortHandles(children);
}

export default function FolderItem({ handle, onClick, onClickItem, onMoved }: FolderItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [childrenHandles, setChildrenHandles] = useState<Handle[] | undefined>();
    const dragOverStartRef = useRef(0);

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

    const handleDragStart = useCallback(
        (e: DragEvent) => {
            e.stopPropagation();

            store.draggingHandle = handle;
            console.log(store.draggingHandle);
            store.subscribeDropped((to) => {
                onMoved?.(handle, to);
            });
        },
        [handle, onMoved],
    );

    const handleDragEnter = useCallback(async () => {
        dragOverStartRef.current = Date.now();
    }, []);

    const handleDragOver = useCallback(
        async (e: DragEvent) => {
            // 允许放置
            e.preventDefault();
            e.stopPropagation();

            const stayTime = Date.now() - dragOverStartRef.current;
            if (stayTime > 500 && !expanded) {
                await expandFolder();
            }
        },
        [expandFolder, expanded],
    );

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.stopPropagation();

            if (store.draggingHandle) {
                const isSameName = childrenHandles!.some(
                    (h) => h.name === store.draggingHandle!.name,
                );

                if (!isSameName) {
                    setChildrenHandles(sortHandles([...childrenHandles!, store.draggingHandle]));
                }
                store.publishDropped(handle);
            }
        },
        [childrenHandles, handle],
    );

    const handledMoved = useCallback(
        (from: Handle, to: Handle) => {
            console.log(from, to);
            if (from === to) return;

            // FIXME: 父文件夹移动到子文件夹
            // FIXME: 移动到同级文件上
            const newChildrenHandles = [...childrenHandles!];
            newChildrenHandles.splice(newChildrenHandles.indexOf(from), 1);
            setChildrenHandles(sortHandles(newChildrenHandles));
        },
        [childrenHandles],
    );

    const renderFiles = useCallback(() => {
        if (childrenHandles === undefined) return;

        return (
            <ul className="folder-item__list">
                {childrenHandles.map((childHandle) => {
                    return childHandle.kind === 'directory' ? (
                        <FolderItem
                            key={childHandle.name}
                            handle={childHandle}
                            onClickItem={handleClickItem}
                            onMoved={handledMoved}
                        />
                    ) : (
                        <FileItem
                            key={childHandle.name}
                            handle={childHandle}
                            parentHandle={handle}
                            onClickItem={handleClickItem}
                            onMoved={handledMoved}
                        />
                    );
                })}
            </ul>
        );
    }, [childrenHandles, handle, handleClickItem, handledMoved]);

    const arrowClassName = useMemo(() => {
        const prefix = `folder-item__name__arrow`;
        return clsx(prefix, { [`${prefix}--expanded`]: expanded });
    }, [expanded]);

    return (
        <div
            className="folder-item"
            draggable
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="folder-item__name" onClick={handleClickFolder}>
                <span className={arrowClassName}>&gt;</span>
                &nbsp;{handle.name}
            </div>
            {expanded ? renderFiles() : null}
        </div>
    );
}
