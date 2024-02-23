import type { FsFile } from '../ReactFileExplorer/model';

interface BreadcrumbsProps {
    file?: FsFile;
}

export default function Breadcrumbs({ file }: BreadcrumbsProps) {
    if (!file?.path) return;
    return <p className="breadcrumbs">{file?.path.slice(1).replaceAll('/', ' > ')}</p>;
}
