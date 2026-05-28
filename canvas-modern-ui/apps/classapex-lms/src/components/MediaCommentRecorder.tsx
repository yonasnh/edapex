import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import canvasApi from '../services/canvasApi';

export interface MediaCommentRecorderProps {
  mode?: 'audio' | 'video';
  maxDuration?: number;
  onRecordComplete: (url: string, mediaType: 'audio' | 'video', uploaded?: any) => void;
  onCancel?: () => void;
}

type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'preview' | 'uploading' | 'error';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function MediaCommentRecorder({
  mode = 'video',
  maxDuration = 300,
  onRecordComplete,
  onCancel,
}: MediaCommentRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    if (typeof MediaRecorder === 'undefined') {
      setErrorMessage('Your browser does not support media recording.');
      setStatus('error');
      return;
    }

    setErrorMessage('');
    setStatus('requesting');
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mode === 'video' ? { facingMode: 'user' } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }

      const preferredType = mode === 'video' ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus';
      const options: MediaRecorderOptions | undefined = MediaRecorder.isTypeSupported(preferredType)
        ? { mimeType: preferredType }
        : undefined;

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || (mode === 'video' ? 'video/webm' : 'audio/webm'),
        });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setStatus('preview');
        if (mode === 'video' && videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = false;
          videoRef.current.controls = true;
          videoRef.current.play().catch(() => {});
        }
        if (mode === 'audio' && audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {});
        }
      };

      recorder.onerror = () => {
        setErrorMessage('A recording error occurred.');
        setStatus('error');
        cleanup();
      };

      recorder.start(1000);
      setStatus('recording');
      setTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          const next = prev + 1;
          if (next >= maxDuration) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      let msg = 'Unable to access media devices.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = `Permission denied. Please allow access to your ${mode === 'video' ? 'camera and microphone' : 'microphone'}.`;
      } else if (err?.name === 'NotFoundError') {
        msg = `No ${mode === 'video' ? 'camera or microphone' : 'microphone'} found.`;
      } else if (err?.name === 'NotReadableError') {
        msg = 'Your device is already in use by another application.';
      }
      setErrorMessage(msg);
      setStatus('error');
      cleanup();
    }
  };

  const handleRetake = () => {
    cleanup();
    setRecordedBlob(null);
    setTimer(0);
    setUploadProgress(0);
    setStatus('idle');
  };

  const handleSend = async () => {
    if (!recordedBlob) return;
    setStatus('uploading');
    try {
      const ext = mode === 'video' ? 'webm' : 'webm';
      const file = new File([recordedBlob], `recording-${Date.now()}.${ext}`, {
        type: recordedBlob.type || (mode === 'video' ? 'video/webm' : 'audio/webm'),
      });

      const ticket = await canvasApi.requestUpload({
        name: file.name,
        size: file.size,
        contentType: file.type,
      });

      const uploaded = await canvasApi.uploadFileToUrl(
        ticket.upload_url,
        ticket.upload_params,
        file,
        (pct) => setUploadProgress(pct)
      );

      const url = uploaded?.url || uploaded?.preview_url || '';
      onRecordComplete(url, mode, uploaded);
      setStatus('idle');
      cleanup();
      setRecordedBlob(null);
      setTimer(0);
      setUploadProgress(0);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  const isRecording = status === 'recording';
  const isPreview = status === 'preview';
  const isUploading = status === 'uploading';

  return (
    <div
      className={clsx('media-comment-recorder')}
      style={{
        background: 'var(--cx-bg-surface)',
        border: '1px solid var(--cx-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-06)',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: mode === 'video' ? '16/9' : undefined,
          minHeight: mode === 'audio' ? 140 : 260,
          background: 'var(--cx-bg-surface-sunken)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mode === 'video' ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            playsInline
            controls={isPreview}
          />
        ) : (
          <audio
            ref={audioRef}
            style={{ width: '80%', display: isPreview ? 'block' : 'none' }}
            controls={isPreview}
          />
        )}

        {mode === 'audio' && !isPreview && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-03)',
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
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>
              {isRecording ? 'Recording audio...' : 'Ready to record'}
            </span>
          </div>
        )}

        {isRecording && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 10px',
              borderRadius: 4,
            }}
          >
            <span
              className="recording-indicator"
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--classapex-error, #da1e28)',
              }}
            />
            <span
              style={{
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(timer)}
            </span>
          </div>
        )}

        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <div className="cx-spinner" />
            <span style={{ color: '#fff', fontSize: '0.875rem' }}>
              Uploading... {uploadProgress}%
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          className="media-comment-recorder__error"
          style={{
            marginTop: 'var(--spacing-04)',
            padding: 'var(--spacing-03) var(--spacing-04)',
            background: 'rgba(218,30,40,0.1)',
            border: '1px solid rgba(218,30,40,0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--classapex-error, #da1e28)',
            fontSize: '0.875rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--spacing-04)',
          display: 'flex',
          gap: 'var(--spacing-03)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {status === 'idle' && (
          <button type="button" className="cx-btn cx-btn--primary" onClick={startRecording}>
            Start Recording
          </button>
        )}
        {status === 'requesting' && (
          <button type="button" className="cx-btn cx-btn--secondary" disabled>
            Requesting Permission...
          </button>
        )}
        {isRecording && (
          <>
            <button type="button" className="cx-btn cx-btn--danger" onClick={stopRecording}>
              Stop Recording
            </button>
            <button type="button" className="cx-btn cx-btn--ghost" onClick={handleRetake}>
              Cancel
            </button>
          </>
        )}
        {isPreview && (
          <>
            <button type="button" className="cx-btn cx-btn--primary" onClick={handleSend}>
              Send
            </button>
            <button type="button" className="cx-btn cx-btn--secondary" onClick={handleRetake}>
              Retake
            </button>
            {onCancel && (
              <button type="button" className="cx-btn cx-btn--ghost" onClick={onCancel}>
                Cancel
              </button>
            )}
          </>
        )}
        {status === 'error' && (
          <>
            <button type="button" className="cx-btn cx-btn--primary" onClick={startRecording}>
              Try Again
            </button>
            {onCancel && (
              <button type="button" className="cx-btn cx-btn--ghost" onClick={onCancel}>
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .recording-indicator {
          animation: pulse 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
