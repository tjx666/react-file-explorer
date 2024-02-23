import { useCallback, useState } from 'react';

import Breadcrumbs from './components/Breadcrumbs';
import Resizer from './components/Resizer';
import ReactFileExplorer from './ReactFileExplorer';
import type { FsFile, FsNode } from './ReactFileExplorer/model';

import './style.scss';

async function readTextFile(fsFile: FsFile) {
    const file = await fsFile.handle.getFile();
    const textFileNameRegexp =
        /.(?:txt|js|cjs|mjs|jsx|ts|cts|mts|tsx|astro|vue|svelte|json|yml|yaml|toml|html|svg|css|less|scss|sass|stylus|md|java|c|c\+\+|go|rs)$/i;
    if (
        file.type.startsWith('text/') ||
        file.name.startsWith('.') ||
        textFileNameRegexp.test(file.name) ||
        new Set(['license', 'readme']).has(file.name.toLowerCase())
    ) {
        return await file.text();
    }
}

export default function App() {
    const [rootDir, setRootDir] = useState<FileSystemDirectoryHandle>();
    const [explorerWidth, setExplorerWidth] = useState(260);

    const [openedFile, setOpenedFile] = useState<FsFile>();
    const [openedFileContent, setOpenedFileContent] = useState('未打开文件');

    const openDir = useCallback(async () => {
        setRootDir(await showDirectoryPicker());
    }, []);

    const handleClickItem = useCallback(async (fsNode: FsNode) => {
        if (fsNode.kind !== 'file') return;

        setOpenedFile(fsNode as FsFile);
        const content = await readTextFile(fsNode as FsFile);
        if (content) {
            setOpenedFileContent(content);
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
                <Breadcrumbs file={openedFile} />
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
