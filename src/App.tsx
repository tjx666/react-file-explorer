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
        if (handle.kind !== 'file') return;

        const file = await handle.getFile();
        console.log(file);
        if (file.type.startsWith('text/')) {
            setOpenedFileContent(await file.text());
        }
    }, []);

    return (
        <div className="app">
            {rootDir ? (
                <ReactFileExplorer directory={rootDir} onClickItem={handleClickItem} />
            ) : null}
            <main>
                {rootDir ? openedFileContent : <button onClick={openDir}>打开本地文件夹</button>}
            </main>
        </div>
    );
}
