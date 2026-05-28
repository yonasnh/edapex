import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export interface DocViewerWrapperProps {
  fileUrl: string;
  annotatable?: boolean;
  annotations?: { id: string; x: number; y: number; text: string; type: string }[];
  onAnnotationSave?: (annotations: any[]) => void;
}

export default function DocViewerWrapper({
  fileUrl,
  annotatable,
  annotations: externalAnnotations,
  onAnnotationSave,
}: DocViewerWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<{ id: string; x: number; y: number; text: string; type: string }[]>(externalAnnotations || []);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalAnnotations) setAnnotations(externalAnnotations);
  }, [externalAnnotations]);

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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!annotatable || loading || error) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newAnnotation = { id: `ann-${Date.now()}`, x, y, text: '', type: 'note' };
    const next = [...annotations, newAnnotation];
    setAnnotations(next);
    setActiveAnnotationId(newAnnotation.id);
    setNewAnnotationText('');
    onAnnotationSave?.(next);
  };

  const handleAnnotationTextSave = () => {
    if (!activeAnnotationId) return;
    const next = annotations.map(a =>
      a.id === activeAnnotationId ? { ...a, text: newAnnotationText } : a
    ).filter(a => a.text.trim() !== '');
    setAnnotations(next);
    setActiveAnnotationId(null);
    setNewAnnotationText('');
    onAnnotationSave?.(next);
  };

  const handleDeleteAnnotation = (id: string) => {
    const next = annotations.filter(a => a.id !== id);
    setAnnotations(next);
    if (activeAnnotationId === id) {
      setActiveAnnotationId(null);
      setNewAnnotationText('');
    }
    onAnnotationSave?.(next);
  };

  return (
    <div
      ref={wrapperRef}
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
        <>
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
              pointerEvents: annotatable ? 'none' : 'auto',
            }}
          />
          {annotatable && (
            <div
              onClick={handleOverlayClick}
              style={{
                position: 'absolute',
                inset: 0,
                cursor: 'crosshair',
                borderRadius: 'var(--radius-lg)',
                zIndex: 1,
              }}
            >
              {annotations.map(a => (
                <div
                  key={a.id}
                  style={{
                    position: 'absolute',
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveAnnotationId(a.id);
                    setNewAnnotationText(a.text);
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--cx-color-warning, #f59e0b)',
                      border: '2px solid #fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                    title={a.text || 'New annotation'}
                  >
                    {annotations.indexOf(a) + 1}
                  </div>
                  {activeAnnotationId === a.id && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: 8,
                        background: 'var(--cx-bg-surface)',
                        border: '1px solid var(--cx-border-subtle)',
                        borderRadius: 8,
                        padding: 10,
                        width: 220,
                        boxShadow: 'var(--cx-shadow-md)',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <textarea
                        value={newAnnotationText}
                        onChange={e => setNewAnnotationText(e.target.value)}
                        placeholder="Enter annotation..."
                        style={{ width: '100%', minHeight: 60, fontSize: '0.78rem', border: '1px solid var(--cx-border-subtle)', borderRadius: 4, padding: 6, resize: 'vertical' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteAnnotation(a.id)}>Delete</button>
                        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleAnnotationTextSave}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
