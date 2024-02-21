import { useCallback, useState } from 'react';

import ReactFileExplorer from './ReactFileExplorer';
import './style.css';
import type { Handle } from './ReactFileExplorer/types';

export default function App() {
    const [rootDir, setRootDir] = useState<FileSystemDirectoryHandle>();
    const [openedFileContent, setOpenedFileContent] = useState<string>('未打开文件');

    const openDir = useCallback(async () => {
        setRootDir(await showDirectoryPicker());
    }, []);

    const handleClickItem = useCallback(async (handle: Handle) => {
        console.log(handle);
        if (handle.kind !== 'file') return;

        const file = await handle.getFile();
        console.log(file);
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

    return (
        <div className="app">
            {rootDir ? (
                <ReactFileExplorer directory={rootDir} onClickItem={handleClickItem} />
            ) : null}
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
