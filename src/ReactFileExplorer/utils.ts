export function sortHandles<T extends Pick<FileSystemHandle, 'kind' | 'name'>>(handles: T[]): T[] {
    return [...handles].sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? 1 : -1;
    });
}

export async function loadChildHandles(handle: FileSystemDirectoryHandle) {
    const children: FileSystemHandle[] = [];
    for await (const [_, childHandle] of handle.entries()) {
        children.push(childHandle);
    }
    return sortHandles(children);
}
