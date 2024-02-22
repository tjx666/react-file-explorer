import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';

import FileItem from './FileItem';
import type { FsDir, FsFile, FsNode } from './model';
import { store } from './store';
import { getIndentWidth } from './utils';

interface FolderItemProps {
    folder: FsDir;
    onClick?: (folder: FsDir) => void;
    /** 点击自身以及子节点 */
    onClickItem?: (fsNode: FsNode) => void;
    onMoved?: (from: FsNode, to: FsNode) => void;
}

export default function FolderItem({ folder, onClick, onClickItem, onMoved }: FolderItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [childFiles, setChildFiles] = useState<FsNode[] | undefined>();
    const dragOverStartRef = useRef(0);

    if (folder.parent === undefined) {
        // @ts-expect-error ...
        window.rootFolder = folder;
    }

    const expandFolder = useCallback(async () => {
        if (childFiles === undefined) {
            setChildFiles(await folder.getFiles());
        }
        setExpanded(true);
    }, [childFiles, folder]);

    const handleClickFolder = useCallback(async () => {
        onClick?.(folder);
        onClickItem?.(folder);

        if (expanded) {
            setExpanded(false);
            return;
        }
        await expandFolder();
    }, [expandFolder, expanded, folder, onClick, onClickItem]);

    const handleClickItem = useCallback(
        (handle: FsNode) => {
            onClickItem?.(handle);
        },
        [onClickItem],
    );

    const handleClickFile = useCallback(
        (file: FsFile) => {
            handleClickItem(file);
        },
        [handleClickItem],
    );

    const handleDragStart = useCallback(
        (e: DragEvent) => {
            e.stopPropagation();

            store.draggingNode = folder;
            store.onDropped = (to) => {
                onMoved?.(folder, to);
            };
        },
        [folder, onMoved],
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
        async (e: DragEvent) => {
            e.stopPropagation();

            if (store.draggingNode) {
                const from = store.draggingNode;
                const toDir = folder;

                console.log(`拖拽 ${from.name} 到 ${toDir.name}`);

                // 文件名已存在
                const isSameName = childFiles!.some((h) => h.name === store.draggingNode!.name);

                // 父文件夹移动到子文件夹
                let isMoveToChild = false;
                if (toDir.kind === 'directory') {
                    let currentNode: FsDir | undefined = toDir as FsDir;
                    while (currentNode !== undefined) {
                        if (currentNode === from) {
                            isMoveToChild = true;
                            break;
                        }
                        currentNode = currentNode.parent;
                    }
                }

                // 移动自己所在的文件夹
                const isMoveToSelfDir = toDir === from.parent;

                const shouldNotMove = isSameName || isMoveToChild || isMoveToSelfDir;
                if (!shouldNotMove) {
                    // 先删除
                    store.onDropped!(folder);

                    // 后添加
                    toDir.add(from);
                    setChildFiles(await toDir.getFiles());
                }
            }
        },
        [childFiles, folder],
    );

    const handledMoved = useCallback(
        async (from: FsNode, to: FsNode) => {
            if (from === to) return;

            // eslint-disable-next-line unicorn/prefer-dom-node-remove
            await from.parent?.removeChild(from);
            setChildFiles([...(await folder.getFiles())]);
        },
        [folder],
    );

    const indentWidth = getIndentWidth(folder.level);
    const renderFiles = useCallback(() => {
        if (childFiles === undefined) return;

        return (
            <div className="folder-item__list">
                <div
                    className="folder-item__list__guide"
                    style={{
                        left: indentWidth,
                    }}
                ></div>
                {childFiles.map((childFsNode) => {
                    return childFsNode.kind === 'directory' ? (
                        <FolderItem
                            key={childFsNode.name}
                            folder={childFsNode as FsDir}
                            onClickItem={handleClickItem}
                            onMoved={handledMoved}
                        />
                    ) : (
                        <FileItem
                            key={childFsNode.name}
                            file={childFsNode as FsFile}
                            onClick={handleClickFile}
                            onMoved={handledMoved}
                        />
                    );
                })}
            </div>
        );
    }, [childFiles, handleClickFile, handleClickItem, handledMoved, indentWidth]);

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
            <div
                className="folder-item__name fs-item__name"
                style={{
                    paddingLeft: indentWidth,
                }}
                onClick={handleClickFolder}
            >
                <span className={arrowClassName}>&gt;</span>
                &nbsp;{folder.name}
            </div>
            {expanded ? renderFiles() : null}
        </div>
    );
}
