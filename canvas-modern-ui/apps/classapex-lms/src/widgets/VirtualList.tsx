import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualListProps<T> {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
}

function VirtualList<T>({ items, children, itemHeight, overscan = 5, className, style }: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems: { item: T; index: number }[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push({ item: items[i], index: i });
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflowY: 'auto', ...style }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {children(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
