import type { MouseEvent as ReactMouseEvent } from 'react';
import { useRef, useCallback, useEffect } from 'react';

const getExplorerDom = () => document.querySelector('.explorer') as HTMLDivElement;

interface ResizerProps {
    onResize: (offsetX: number) => void;
}

export default function Resizer({ onResize }: ResizerProps) {
    const isResizingRef = useRef(false);
    const lastXRef = useRef(0);

    const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        isResizingRef.current = true;
        lastXRef.current = e.pageX;
        document.body.style.setProperty('cursor', 'ew-resize', 'important');

        getExplorerDom().style.setProperty('cursor', 'ew-resize');
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingRef.current) {
                console.log(e.pageX, lastXRef.current);
                const offsetX = e.pageX - lastXRef.current;
                lastXRef.current = e.pageX;
                onResize(offsetX);
            }
        };

        const handleMouseUp = () => {
            if (isResizingRef.current) {
                isResizingRef.current = false;
                document.body.style.removeProperty('cursor');
                getExplorerDom().style.removeProperty('cursor');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onResize]);

    return <div className="resizer" onMouseDown={handleMouseDown}></div>;
}
