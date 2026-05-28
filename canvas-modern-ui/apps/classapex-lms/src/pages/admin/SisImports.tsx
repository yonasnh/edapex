import React, { useState, useEffect } from 'react';
import { useCanvasMutation, useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';
import clsx from 'clsx';

function UploadSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 15V4M5 9l5-5 5 5M4 17h12"/></svg>; }
function FileSvg() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>; }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg>; }
function ChevronUpSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9l3-3 3 3"/></svg>; }
function ClockSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>; }
function HistorySvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10a7 7 0 1014 0 7 7 0 00-14 0z"/><path d="M10 6v4l3 3"/></svg>; }

interface SisImport {
  id: number;
  progress: number;
  workflow_state: string;
  data?: {
    import_type?: string;
  };
  processing_errors?: string[];
  processing_warnings?: string[];
  statistics?: {
    total_rows?: number;
    successful_rows?: number;
    failed_rows?: number;
  };
  created_at?: string;
  csv_attachments?: Array<{
    id: number;
    display_name: string;
    url: string;
  }>;
}

const terminalStates = ['imported', 'aborted', 'failed'];
const activeStates = ['initializing', 'created', 'importing'];

export default function SisImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('instructure_csv');
  const [success, setSuccess] = useState(false);

  const [pollingImportId, setPollingImportId] = useState<number | null>(null);
  const [activeImport, setActiveImport] = useState<SisImport | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  const { showToast } = useNotification();

  const { mutate: uploadSis, isLoading, error, data: uploadData } = useCanvasMutation<any, FormData>(
    '/api/v1/accounts/1/sis_imports',
    'POST'
  );

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useCanvasQuery<any>(
    '/api/v1/accounts/1/sis_imports',
    { per_page: 20 }
  );

  const historyImports: SisImport[] = React.useMemo(() => {
    if (!historyData) return [];
    if (Array.isArray(historyData)) return historyData;
    if (Array.isArray(historyData.sis_imports)) return historyData.sis_imports;
    return [];
  }, [historyData]);

  // Start polling when a new upload response arrives with an active state
  useEffect(() => {
    if (uploadData?.id && activeStates.includes(uploadData.workflow_state)) {
      setPollingImportId(uploadData.id);
      showToast({
        title: 'Import Started',
        message: `SIS import #${uploadData.id} has been queued.`,
        type: 'success'
      });
    }
  }, [uploadData, showToast]);

  // Poll active import status every 3 seconds
  useEffect(() => {
    if (!pollingImportId) {
      setActiveImport(null);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchStatus = async () => {
      try {
        const data = await canvasFetch(`/api/v1/accounts/1/sis_imports/${pollingImportId}`);
        setActiveImport(data);

        if (data?.workflow_state && terminalStates.includes(data.workflow_state)) {
          if (intervalId) clearInterval(intervalId);
          setPollingImportId(null);

          if (data.workflow_state === 'failed') {
            showToast({
              title: 'Import Failed',
              message: data.processing_errors?.[0] || `SIS import #${data.id} failed.`,
              type: 'error'
            });
          } else if (data.workflow_state === 'imported') {
            showToast({
              title: 'Import Complete',
              message: `SIS import #${data.id} finished successfully.`,
              type: 'success'
            });
          }

          refetchHistory();
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        if (intervalId) clearInterval(intervalId);
        setPollingImportId(null);
        showToast({
          title: 'Polling Error',
          message: err.message || 'Failed to check import status.',
          type: 'error'
        });
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingImportId, showToast, refetchHistory]);

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

  const toggleErrors = (id: number) => {
    setExpandedErrors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'imported': return 'cx-badge--success';
      case 'importing': return 'cx-badge--info';
      case 'failed': return 'cx-badge--danger';
      case 'aborted': return 'cx-badge--danger';
      case 'initializing': return 'cx-badge--warning';
      case 'created': return 'cx-badge--warning';
      default: return 'cx-badge--neutral';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  const isPolling = pollingImportId !== null;

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">SIS Imports</h1>
          <p className="cx-page__subtitle">Upload SIS data to sync users, courses, and enrollments.</p>
        </div>
      </div>

      {success && !isPolling && (
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

      {/* Active Import Progress */}
      {isPolling && activeImport && (
        <div className="cx-card" style={{ maxWidth: 600, marginBottom: 24 }}>
          <div className="cx-card__header">
            <h3 className="cx-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockSvg />
              Import In Progress #{activeImport.id}
            </h3>
          </div>
          <div className="cx-card__body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-primary)', textTransform: 'capitalize' }}>
                {activeImport.workflow_state}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                {activeImport.progress ?? 0}%
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--cx-border-subtle)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${activeImport.progress ?? 0}%`,
                  background: 'var(--cx-color-primary)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            {activeImport.processing_errors && activeImport.processing_errors.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--cx-red-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-accent-error)', marginBottom: 4 }}>
                  Errors
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8125rem', color: 'var(--cx-accent-error)' }}>
                  {activeImport.processing_errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="cx-card" style={{ maxWidth: 600, marginBottom: 24 }}>
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

      {/* Import History */}
      <div className="cx-section">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HistorySvg />
          Import History
        </h2>

        {historyLoading ? (
          <div className="cx-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>Loading import history...</div>
          </div>
        ) : historyImports.length === 0 ? (
          <div className="cx-empty" style={{ padding: 40 }}>
            <FileSvg />
            <h3>No previous imports</h3>
            <p>Upload a file above to start your first SIS import.</p>
          </div>
        ) : (
          <div className="cx-table-container">
            <table className="cx-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                  <th>Statistics</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {historyImports.map((imp) => {
                  const hasErrors = (imp.processing_errors && imp.processing_errors.length > 0) ||
                                    (imp.processing_warnings && imp.processing_warnings.length > 0);
                  const isExpanded = expandedErrors.has(imp.id);

                  return (
                    <React.Fragment key={imp.id}>
                      <tr className="cx-table__row">
                        <td className="cx-table__cell" style={{ fontWeight: 600 }}>#{imp.id}</td>
                        <td className="cx-table__cell cx-table__cell--muted">
                          {imp.data?.import_type || '—'}
                        </td>
                        <td className="cx-table__cell">
                          <span className={clsx('cx-badge', getStatusBadgeClass(imp.workflow_state))} style={{ textTransform: 'capitalize' }}>
                            {imp.workflow_state}
                          </span>
                        </td>
                        <td className="cx-table__cell cx-table__cell--muted">
                          {imp.progress ?? 0}%
                        </td>
                        <td className="cx-table__cell cx-table__cell--muted">
                          {formatDate(imp.created_at)}
                        </td>
                        <td className="cx-table__cell cx-table__cell--muted">
                          {imp.statistics ? (
                            <span style={{ fontSize: '0.75rem' }}>
                              {imp.statistics.successful_rows ?? 0}/{imp.statistics.total_rows ?? 0} rows
                              {imp.statistics.failed_rows ? (
                                <span style={{ color: 'var(--cx-accent-error)', marginLeft: 4 }}>
                                  ({imp.statistics.failed_rows} failed)
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="cx-table__cell cx-table__cell--actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {imp.csv_attachments && imp.csv_attachments.length > 0 && (
                            <a
                              href={imp.csv_attachments[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: 'var(--cx-color-primary)' }}
                            >
                              Error file
                            </a>
                          )}
                          {hasErrors && (
                            <button
                              className="cx-btn cx-btn--ghost cx-btn--sm"
                              onClick={() => toggleErrors(imp.id)}
                              title="View errors"
                            >
                              {isExpanded ? <ChevronUpSvg /> : <ChevronDownSvg />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasErrors && (
                        <tr>
                          <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                            <div style={{ padding: '12px 16px', background: 'var(--cx-bg-canvas)', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                              {/* Diff reporting: compare with previous import */}
                              {(() => {
                                const idx = historyImports.findIndex((h: SisImport) => h.id === imp.id);
                                const prev = idx >= 0 ? historyImports[idx + 1] : null;
                                if (!prev || !prev.statistics || !imp.statistics) return null;
                                const diffTotal = (imp.statistics.total_rows ?? 0) - (prev.statistics.total_rows ?? 0);
                                const diffSuccess = (imp.statistics.successful_rows ?? 0) - (prev.statistics.successful_rows ?? 0);
                                const diffFailed = (imp.statistics.failed_rows ?? 0) - (prev.statistics.failed_rows ?? 0);
                                return (
                                  <div style={{ marginBottom: 12, padding: 10, background: 'var(--cx-bg-surface-raised)', borderRadius: 6, border: '1px solid var(--cx-border-subtle)' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', marginBottom: 6 }}>Diff vs Previous Import (#{prev.id})</div>
                                    <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
                                      <span>Total: <strong>{imp.statistics.total_rows ?? 0}</strong> <span style={{ color: diffTotal > 0 ? 'var(--cx-color-success)' : diffTotal < 0 ? 'var(--cx-color-danger)' : 'var(--cx-text-tertiary)' }}>({diffTotal >= 0 ? '+' : ''}{diffTotal})</span></span>
                                      <span>Success: <strong>{imp.statistics.successful_rows ?? 0}</strong> <span style={{ color: diffSuccess > 0 ? 'var(--cx-color-success)' : diffSuccess < 0 ? 'var(--cx-color-danger)' : 'var(--cx-text-tertiary)' }}>({diffSuccess >= 0 ? '+' : ''}{diffSuccess})</span></span>
                                      <span>Failed: <strong>{imp.statistics.failed_rows ?? 0}</strong> <span style={{ color: diffFailed > 0 ? 'var(--cx-color-danger)' : diffFailed < 0 ? 'var(--cx-color-success)' : 'var(--cx-text-tertiary)' }}>({diffFailed >= 0 ? '+' : ''}{diffFailed})</span></span>
                                    </div>
                                  </div>
                                );
                              })()}
                              {imp.processing_errors && imp.processing_errors.length > 0 && (
                                <div style={{ marginBottom: imp.processing_warnings && imp.processing_warnings.length > 0 ? 12 : 0 }}>
                                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-accent-error)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertSvg />
                                    Errors
                                  </div>
                                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                                    {imp.processing_errors.map((err, i) => (
                                      <li key={i} style={{ marginBottom: 2 }}>{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {imp.processing_warnings && imp.processing_warnings.length > 0 && (
                                <div>
                                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-accent-warning)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertSvg />
                                    Warnings
                                  </div>
                                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                                    {imp.processing_warnings.map((warn, i) => (
                                      <li key={i} style={{ marginBottom: 2 }}>{warn}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
