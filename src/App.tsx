import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import ReactFileExplorer from './ReactFileExplorer';
import type { FsFile, FsNode } from './ReactFileExplorer/model';

import './style.scss';

export default function App() {
    const [rootDir, setRootDir] = useState<FileSystemDirectoryHandle>();
    const [openedFileContent, setOpenedFileContent] = useState<string>('未打开文件');
    const [explorerWidth, setExplorerWidth] = useState(260);

    const openDir = useCallback(async () => {
        setRootDir(await showDirectoryPicker());
    }, []);

    const handleClickItem = useCallback(async (fsNode: FsNode) => {
        if (fsNode.kind !== 'file') return;

        const file = await (fsNode as FsFile).handle.getFile();
        const textFileNameRegexp =
            /.(?:txt|js|cjs|mjs|jsx|ts|cts|mts|tsx|astro|vue|svelte|json|yml|yaml|toml|html|svg|css|less|scss|sass|stylus|md|java|c|c\+\+|go|rs)$/i;
        if (
            file.type.startsWith('text/') ||
            file.name.startsWith('.') ||
            textFileNameRegexp.test(file.name) ||
            new Set(['license', 'readme']).has(file.name.toLowerCase())
        ) {
            setOpenedFileContent(await file.text());
        }
    }, []);

    const isResizingRef = useRef(false);
    const lastXRef = useRef(0);
    const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        isResizingRef.current = true;
        lastXRef.current = e.pageX;
        document.body.style.setProperty('cursor', 'ew-resize', 'important');
        const explorer = document.querySelector('.explorer') as HTMLDivElement;
        explorer.style.setProperty('cursor', 'ew-resize');
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingRef.current) {
                console.log(e.pageX, lastXRef.current);
                const offsetX = e.pageX - lastXRef.current;
                lastXRef.current = e.pageX;
                setExplorerWidth(explorerWidth + offsetX);
            }
        };
        const handleMouseUp = () => {
            if (isResizingRef.current) {
                isResizingRef.current = false;
                document.body.style.removeProperty('cursor');
                const explorer = document.querySelector('.explorer') as HTMLDivElement;
                explorer.style.removeProperty('cursor');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [explorerWidth]);

    return (
        <div className="app">
            {rootDir ? (
                <ReactFileExplorer
                    style={{
                        width: `${explorerWidth}px`,
                    }}
                    directory={rootDir}
                    onClickItem={handleClickItem}
                />
            ) : null}
            <div className="resizer" onMouseDown={handleMouseDown}></div>
            <main>
                {rootDir ? (
                    <pre>
                        <code>{openedFileContent}</code>
                    </pre>
                ) : (
                    <button onClick={openDir}>打开本地文件夹</button>
                )}
            </main>
        </div>
    );
}
