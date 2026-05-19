import React, { useState } from 'react';
import { useCanvasMutation } from '../../hooks/useCanvasQuery';

function UploadSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 15V4M5 9l5-5 5 5M4 17h12"/></svg>; }
function FileSvg() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }

export default function SisImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('instructure_csv');
  const [success, setSuccess] = useState(false);

  const { mutate: uploadSis, isLoading, error } = useCanvasMutation<any, FormData>(
    '/api/v1/accounts/1/sis_imports',
    'POST'
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('import_type', importType);
    
    try {
      await uploadSis(formData);
      setSuccess(true);
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">SIS Imports</h1>
          <p className="cx-page__subtitle">Upload SIS data to sync users, courses, and enrollments.</p>
        </div>
      </div>

      {success && (
        <div className="cx-notification cx-notification--success" style={{ marginBottom: 24 }}>
          <CheckSvg />
          <div>
            <div className="cx-notification__title">Import Started</div>
            <div className="cx-notification__subtitle">The SIS import has been successfully queued.</div>
          </div>
        </div>
      )}

      {error && (
        <div className="cx-notification cx-notification--danger" style={{ marginBottom: 24 }}>
          <div>
            <div className="cx-notification__title">Import Failed</div>
            <div className="cx-notification__subtitle">{error.message || 'An error occurred during import.'}</div>
          </div>
        </div>
      )}

      <div className="cx-card" style={{ maxWidth: 600 }}>
        <div className="cx-card__header">
          <h3 className="cx-card__title">New Import</h3>
        </div>
        <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 8, color: 'var(--cx-text-primary)' }}>Import Type</label>
            <select className="cx-select" style={{ width: '100%' }} value={importType} onChange={e => setImportType(e.target.value)}>
              <option value="instructure_csv">Instructure formatted CSV or zipfile of CSVs</option>
              <option value="sif22">SIF 2.2 XML</option>
              <option value="quizzes_next">New Quizzes Bulk Migration</option>
            </select>
          </div>

          <div style={{
            border: '2px dashed var(--cx-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 40,
            textAlign: 'center',
            background: 'var(--cx-bg-surface-raised)'
          }}>
            <FileSvg />
            <h4 style={{ margin: '16px 0 8px', color: 'var(--cx-text-primary)' }}>{file ? file.name : 'Select a file to import'}</h4>
            <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV or ZIP format supported.'}
            </p>
            <label className="cx-btn cx-btn--secondary" style={{ cursor: 'pointer' }}>
              Choose File
              <input type="file" accept=".csv,.zip" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              className="cx-btn cx-btn--primary"
              disabled={!file || isLoading}
              onClick={handleImport}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <UploadSvg />
              {isLoading ? 'Uploading...' : 'Process Import'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
