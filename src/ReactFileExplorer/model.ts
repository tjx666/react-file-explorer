import { loadChildHandles, sortHandles } from './utils';

export class FsNode {
    public name: string;
    public handle: FileSystemHandle;
    public kind: FileSystemHandleKind;
    // eslint-disable-next-line no-use-before-define
    public parent?: FsDir | undefined;

    public get path(): string {
        return this.parent ? `${this.parent.path}/${this.name}` : `/${this.name}`;
    }

    constructor(handle: FileSystemHandle, parent?: FsDir) {
        this.parent = parent;
        this.handle = handle;
        this.name = handle.name;
        this.kind = handle.kind;
    }
}

export class FsFile extends FsNode {
    public kind = 'file' as const;
    public declare handle: FileSystemFileHandle;

    constructor(handle: FileSystemFileHandle, parent: FsDir) {
        super(handle, parent);
    }
}

export class FsDir extends FsNode {
    public kind = 'directory' as const;
    public declare handle: FileSystemDirectoryHandle;

    private _files: FsNode[] | undefined;

    constructor(handle: FileSystemDirectoryHandle, parent?: FsDir) {
        super(handle, parent);
    }

    public async getFiles(): Promise<FsNode[]> {
        if (this._files === undefined) {
            const handles = await loadChildHandles(this.handle);
            const files = handles.map((handle) => {
                return handle.kind === 'file'
                    ? new FsFile(handle as FileSystemFileHandle, this)
                    : new FsDir(handle as FileSystemDirectoryHandle, this);
            });
            this._files = sortHandles(files);
        }
        return this._files;
    }

    public removeChild(child: FsNode) {
        if (!this._files) return;

        child.parent = undefined;
        this._files.splice(this._files.indexOf(child), 1);
    }

    public add(child: FsNode) {
        if (!this._files) return;

        child.parent = this;
        this._files.push(child);
        this._files = sortHandles(this._files);
    }
}
