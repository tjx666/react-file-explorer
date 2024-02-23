import { useCallback, useState } from 'react';

import Resizer from './components/Resizer';
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

    const handleResize = useCallback(
        (offsetX: number) => {
            setExplorerWidth(explorerWidth + offsetX);
        },
        [explorerWidth],
    );

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
            <Resizer onResize={handleResize} />
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
