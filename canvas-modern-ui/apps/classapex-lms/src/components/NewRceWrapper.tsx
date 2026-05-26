import React, { useRef, useState } from 'react';
import RichEditor, { Props as RichEditorProps } from './RichEditor';

export type NewRceWrapperProps = RichEditorProps;

export default function NewRceWrapper(props: NewRceWrapperProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [showEquation, setShowEquation] = useState(false);
  const [equationLatex, setEquationLatex] = useState('');
  const [showMediaEmbed, setShowMediaEmbed] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const insertHtml = (html: string) => {
    restoreSelection();
    document.execCommand('insertHTML', false, html);
  };

  const handleEquationOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    setShowEquation(true);
  };

  const handleEquationInsert = () => {
    if (!equationLatex.trim()) return;
    const encoded = encodeURIComponent(equationLatex);
    const imgUrl = `https://latex.codecogs.com/svg.latex?${encoded}`;
    insertHtml(`<img src="${imgUrl}" alt="${equationLatex.replace(/"/g, '&quot;')}" class="equation" />`);
    setEquationLatex('');
    setShowEquation(false);
  };

  const handleTableInsert = (e: React.MouseEvent) => {
    e.preventDefault();
    const rowsStr = window.prompt('Number of rows:', '3');
    const colsStr = window.prompt('Number of columns:', '3');
    const rows = parseInt(rowsStr || '3', 10);
    const cols = parseInt(colsStr || '3', 10);
    if (Number.isNaN(rows) || Number.isNaN(cols) || rows < 1 || cols < 1) return;
    let html = '<table style="width:100%;border-collapse:collapse;border:1px solid var(--cx-border-subtle);"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid var(--cx-border-subtle);padding:8px;">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    insertHtml(html);
  };

  const handleMediaEmbedOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    setShowMediaEmbed(true);
  };

  const handleMediaEmbedInsert = () => {
    const url = mediaUrl.trim();
    if (!url) return;
    let embedHtml = '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen style="max-width:100%"></iframe>`;
    } else {
      const vmMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vmMatch) {
        embedHtml = `<iframe src="https://player.vimeo.com/video/${vmMatch[1]}" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%"></iframe>`;
      } else {
        embedHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
    }
    insertHtml(embedHtml);
    setMediaUrl('');
    setShowMediaEmbed(false);
  };

  const handleStudioEmbed = (e: React.MouseEvent) => {
    e.preventDefault();
    insertHtml(
      '<div class="studio-embed" contenteditable="false" style="background:var(--cx-bg-surface-raised);border:1px dashed var(--cx-border-subtle);padding:16px;text-align:center;color:var(--cx-text-secondary);border-radius:var(--radius-md);">[Studio video will appear here]</div><p><br></p>'
    );
  };

  return (
    <div className="new-rce-wrapper" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          padding: '8px 10px',
          background: 'var(--cx-bg-surface-raised, #f8fafc)',
          border: '1px solid var(--cx-border-subtle)',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <button
          type="button"
          className="cx-btn cx-btn--sm"
          onMouseDown={handleEquationOpen}
          title="Insert Equation"
        >
          ƒ(x)
        </button>
        <button
          type="button"
          className="cx-btn cx-btn--sm"
          onMouseDown={handleTableInsert}
          title="Insert Table"
        >
          ▦
        </button>
        <button
          type="button"
          className="cx-btn cx-btn--sm"
          onMouseDown={handleMediaEmbedOpen}
          title="Embed Media"
        >
          ▶
        </button>
        <button
          type="button"
          className="cx-btn cx-btn--sm"
          onMouseDown={handleStudioEmbed}
          title="Insert Studio Embed"
        >
          🎬
        </button>
      </div>

      {showEquation && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 10,
            zIndex: 10,
            background: 'var(--cx-bg-surface-raised)',
            border: '1px solid var(--cx-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-04)',
            boxShadow: 'var(--shadow-03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-03)',
            minWidth: 280,
          }}
        >
          <label style={{ fontSize: '0.8rem', color: 'var(--cx-text-secondary)', fontWeight: 600 }}>
            LaTeX Equation
          </label>
          <input
            type="text"
            value={equationLatex}
            onChange={(e) => setEquationLatex(e.target.value)}
            placeholder="e.g. \\sum_{i=1}^{n} x_i"
            autoFocus
            style={{
              padding: '6px 10px',
              background: 'var(--cx-bg-surface)',
              border: '1px solid var(--cx-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--cx-text-primary)',
              fontSize: '0.875rem',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-03)', justifyContent: 'flex-end' }}>
            <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setShowEquation(false)}>
              Cancel
            </button>
            <button type="button" className="cx-btn cx-btn--primary" onClick={handleEquationInsert}>
              Insert
            </button>
          </div>
        </div>
      )}

      {showMediaEmbed && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 80,
            zIndex: 10,
            background: 'var(--cx-bg-surface-raised)',
            border: '1px solid var(--cx-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-04)',
            boxShadow: 'var(--shadow-03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-03)',
            minWidth: 320,
          }}
        >
          <label style={{ fontSize: '0.8rem', color: 'var(--cx-text-secondary)', fontWeight: 600 }}>
            Media URL (YouTube, Vimeo, etc.)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
            autoFocus
            style={{
              padding: '6px 10px',
              background: 'var(--cx-bg-surface)',
              border: '1px solid var(--cx-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--cx-text-primary)',
              fontSize: '0.875rem',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-03)', justifyContent: 'flex-end' }}>
            <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setShowMediaEmbed(false)}>
              Cancel
            </button>
            <button type="button" className="cx-btn cx-btn--primary" onClick={handleMediaEmbedInsert}>
              Embed
            </button>
          </div>
        </div>
      )}

      <RichEditor ref={editorRef} {...props} />
    </div>
  );
}
