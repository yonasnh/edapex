import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export interface DocViewerWrapperProps {
  fileUrl: string;
  annotatable?: boolean;
  onAnnotationSave?: (annotations: any[]) => void;
}

export default function DocViewerWrapper({
  fileUrl,
  annotatable,
  onAnnotationSave,
}: DocViewerWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeSrc = useMemo(() => {
    try {
      const url = new URL(fileUrl, window.location.origin);
      if (annotatable) {
        url.searchParams.set('annotatable', '1');
      }
      return url.toString();
    } catch {
      return fileUrl;
    }
  }, [fileUrl, annotatable]);

  const downloadUrl = useMemo(() => {
    try {
      const url = new URL(fileUrl, window.location.origin);
      url.pathname = url.pathname.replace(/\/preview$/, '/download');
      url.searchParams.set('download_frd', '1');
      return url.toString();
    } catch {
      return fileUrl;
    }
  }, [fileUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      setLoading(false);
      setError('This file cannot be previewed.');
    }, 15000);
    timeoutRef.current = t;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fileUrl, annotatable]);

  const handleLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
    setError('Failed to load document preview.');
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (
        e.source === iframeRef.current?.contentWindow &&
        Array.isArray(e.data) &&
        onAnnotationSave
      ) {
        onAnnotationSave(e.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onAnnotationSave]);

  return (
    <div
      className={clsx('doc-viewer-wrapper')}
      style={{ width: '100%', position: 'relative' }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-03)',
            background: 'var(--cx-bg-surface)',
            zIndex: 2,
            minHeight: 400,
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="cx-spinner" />
          <span style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>
            Loading preview...
          </span>
        </div>
      )}

      {error ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-04)',
            minHeight: 400,
            padding: 'var(--spacing-06)',
            background: 'var(--cx-bg-surface)',
            border: '1px solid var(--cx-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: 'var(--cx-text-tertiary)' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
          <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {error}
          </p>
          <a
            href={downloadUrl}
            download
            className="cx-btn cx-btn--primary"
            style={{ textDecoration: 'none' }}
          >
            Download File
          </a>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Document preview"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: 'clamp(400px, 60vh, 80vh)',
            border: '1px solid var(--cx-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--cx-bg-surface)',
          }}
        />
      )}
    </div>
  );
}
