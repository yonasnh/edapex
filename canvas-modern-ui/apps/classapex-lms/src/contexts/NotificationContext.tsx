import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';

// SVG Icons for Toasts & Modals
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M6 10l3 3 5-6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M7 7l6 6M13 7l-6 6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v5M10 14h.01" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 14V9M10 6h.01" />
    </svg>
  );
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration: number; // in ms
  isExiting?: boolean;
}

export type ModalType = 'info' | 'success' | 'warning' | 'danger';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ModalType;
}

export interface NotificationContextType {
  showToast: (options: { title: string; message?: string; type?: ToastType; duration?: number }) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: { title: string; message: string; type?: ToastType }) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const confirmModalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Manage Toasts
  const showToast = useCallback(({ title, message, type = 'info', duration = 4500 }: {
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300); // match exit transition animation duration
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  // Manage Confirmation Modals
  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmConfig({ options, resolve });
    });
  }, []);

  // Alert is just a confirmation modal without a cancel button
  const showAlert = useCallback(({ title, message, type = 'info' }: {
    title: string;
    message: string;
    type?: ToastType;
  }): Promise<void> => {
    return new Promise<void>((resolve) => {
      setConfirmConfig({
        options: {
          title,
          message,
          type: type === 'error' ? 'danger' : type,
          confirmLabel: 'OK',
          cancelLabel: '', // empty cancel label hides the cancel button
        },
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirmResult = useCallback((result: boolean) => {
    if (confirmConfig) {
      confirmConfig.resolve(result);
      setConfirmConfig(null);
    }
  }, [confirmConfig]);

  // Handle Keyboard Trap and Events in Modal
  useEffect(() => {
    if (!confirmConfig) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only if cancel is possible
        if (confirmConfig.options.cancelLabel !== '') {
          handleConfirmResult(false);
        } else {
          handleConfirmResult(true);
        }
      } else if (e.key === 'Enter') {
        handleConfirmResult(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the confirm button
    if (confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmConfig, handleConfirmResult]);

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm, showAlert }}>
      {children}

      {/* Toast Notifications Container */}
      <div className="toast-container toast-container--top-right" style={{ pointerEvents: 'none' }}>
        {toasts.map((toast) => {
          let Icon = InfoIcon;
          if (toast.type === 'success') Icon = CheckIcon;
          if (toast.type === 'error') Icon = ErrorIcon;
          if (toast.type === 'warning') Icon = WarningIcon;

          return (
            <div
              key={toast.id}
              className={clsx(
                'toast',
                `toast--${toast.type}`,
                toast.isExiting && 'toast--exiting'
              )}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="toast__icon">
                <Icon />
              </div>
              <div className="toast__content">
                <div className="toast__title">{toast.title}</div>
                {toast.message && <div className="toast__message">{toast.message}</div>}
              </div>
              <div className="toast__controls">
                <button
                  type="button"
                  className="cx-btn toast__close-button"
                  onClick={() => removeToast(toast.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                    <path d="M3 3l6 6M9 3l-6 6" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
              <div
                className="toast__progress"
                style={{
                  animationDuration: `${toast.duration}ms`,
                  animationName: 'toast-progress',
                  animationTimingFunction: 'linear',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Overlay */}
      {confirmConfig && (
        <div
          className="modal-overlay"
          ref={confirmModalRef}
          onClick={() => {
            // Click backdrop to cancel (if cancel button is present)
            if (confirmConfig.options.cancelLabel !== '') {
              handleConfirmResult(false);
            }
          }}
          style={{
            backdropFilter: 'blur(12px) saturate(180%)',
            backgroundColor: 'rgba(10, 10, 10, 0.6)',
            transition: 'all 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '420px',
              background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)',
              border: `1px solid ${
                confirmConfig.options.type === 'danger'
                  ? '#da1e28'
                  : confirmConfig.options.type === 'warning'
                  ? '#f1c21b'
                  : confirmConfig.options.type === 'success'
                  ? '#24a148'
                  : '#393939'
              }`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#f4f4f4',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'cx-modal-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background:
                    confirmConfig.options.type === 'danger'
                      ? 'rgba(218, 30, 40, 0.15)'
                      : confirmConfig.options.type === 'warning'
                      ? 'rgba(241, 194, 27, 0.15)'
                      : confirmConfig.options.type === 'success'
                      ? 'rgba(36, 161, 72, 0.15)'
                      : 'rgba(15, 98, 254, 0.15)',
                  color:
                    confirmConfig.options.type === 'danger'
                      ? '#ff8389'
                      : confirmConfig.options.type === 'warning'
                      ? '#ffd747'
                      : confirmConfig.options.type === 'success'
                      ? '#4ade80'
                      : '#78a9ff',
                }}
              >
                {confirmConfig.options.type === 'danger' && <ErrorIcon />}
                {confirmConfig.options.type === 'warning' && <WarningIcon />}
                {confirmConfig.options.type === 'success' && <CheckIcon />}
                {(confirmConfig.options.type === 'info' || !confirmConfig.options.type) && <InfoIcon />}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                {confirmConfig.options.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div
              style={{
                fontSize: '0.9rem',
                color: '#cccccc',
                lineHeight: 1.5,
                margin: '0.25rem 0 0.5rem 0',
              }}
            >
              {confirmConfig.options.message}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              {confirmConfig.options.cancelLabel !== '' && (
                <button
                  type="button"
                  className="cx-btn cx-btn--secondary cx-btn--sm"
                  onClick={() => handleConfirmResult(false)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                  }}
                >
                  {confirmConfig.options.cancelLabel || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                className={clsx(
                  'cx-btn cx-btn--sm',
                  confirmConfig.options.type === 'danger' ? 'cx-btn--danger' : 'cx-btn--primary'
                )}
                ref={confirmBtnRef}
                onClick={() => handleConfirmResult(true)}
                style={{
                  backgroundColor:
                    confirmConfig.options.type === 'danger'
                      ? '#da1e28'
                      : confirmConfig.options.type === 'success'
                      ? '#24a148'
                      : '#0f62fe',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  boxShadow:
                    confirmConfig.options.type === 'danger'
                      ? '0 4px 12px rgba(218, 30, 40, 0.3)'
                      : '0 4px 12px rgba(15, 98, 254, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                {confirmConfig.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>

          {/* Inline animations for premium entry */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes cx-modal-fade-in {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}} />
        </div>
      )}
    </NotificationContext.Provider>
  );
};
