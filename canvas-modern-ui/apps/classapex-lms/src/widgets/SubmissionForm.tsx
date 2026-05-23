import React, { useState, useCallback, useRef, useEffect } from 'react'
import canvasApi from '../services/canvasApi'

type SubmissionType = 'online_text_entry' | 'online_upload' | 'online_url' | 'media_recording'

interface SubmissionFormProps {
  assignmentId: number
  submissionTypes?: SubmissionType[]
  courseId?: number | string
  onProgress?: (pct: number) => void
  onSubmit?: (data: { type: SubmissionType; body?: string; url?: string; files?: File[]; fileIds?: (string | number)[] }) => void
  onSuccess?: () => void
}

async function postSubmissionToCanvas(
  courseId: number | string,
  assignmentId: number,
  payload: {
    submission_type: string
    body?: string
    url?: string
    file_ids?: (string | number)[]
  }
): Promise<boolean> {
  const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
  const res = await fetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': decodeURIComponent(token),
    },
    body: JSON.stringify({ submission: payload }),
  })
  return res.ok
}

export function SubmissionForm({ assignmentId, submissionTypes = ['online_text_entry'], courseId, onProgress, onSubmit, onSuccess }: SubmissionFormProps) {
  const [subType, setSubType] = useState<SubmissionType>(submissionTypes[0])
  const [textBody, setTextBody] = useState('')
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Webcam/Microphone Recording states
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Clean up media streams and URLs on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [stream, previewUrl])

  // Request camera and microphone permissions
  const requestMediaAccess = useCallback(async () => {
    setPermissionError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      })
      setStream(mediaStream)
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      console.error('Media permission request failed:', err)
      setPermissionError('Unable to access camera or microphone. Please verify permission settings in your browser.')
    }
  }, [])

  // Start webcam recording
  const startRecording = useCallback(() => {
    if (!stream) return
    recordedChunksRef.current = []
    setRecordedBlob(null)
    setPreviewUrl(null)

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    }

    recorder.start(100) // chunk every 100ms
    setIsRecording(true)
    setIsPaused(false)
  }, [stream])

  // Pause webcam recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }, [isRecording])

  // Resume webcam recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }, [isRecording])

  // Stop webcam recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }, [isRecording])

  // Reset/Clear recording
  const clearRecording = useCallback(() => {
    setRecordedBlob(null)
    setPreviewUrl(null)
    if (stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream
    }
  }, [stream])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) { setErrorMessage('Missing course ID'); return }
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage(null)

    try {
      if (subType === 'online_upload' && files.length > 0) {
        const fileIds: (string | number)[] = []
        for (const file of files) {
          const result = await canvasApi.uploadFile(file, courseId as any)
          fileIds.push(result.id)
          const pct = Math.round((fileIds.length / files.length) * 100)
          setUploadProgress(pct)
          onProgress?.(pct)
        }
        const ok = await postSubmissionToCanvas(courseId, assignmentId, {
          submission_type: 'online_upload',
          file_ids: fileIds,
        })
        if (!ok) throw new Error('Submission failed after upload')
        onSubmit?.({ type: subType, files, fileIds })
      } else if (subType === 'media_recording' && recordedBlob) {
        // Step 1: Upload the recorded video blob as a File
        const file = new File([recordedBlob], 'submission-webcam-recording.webm', { type: 'video/webm' })
        setUploadProgress(10)
        
        const result = await canvasApi.uploadFile(file, courseId as any)
        setUploadProgress(100)
        
        // Step 2: Submit the assignment with the uploaded media file
        const ok = await postSubmissionToCanvas(courseId, assignmentId, {
          submission_type: 'media_recording',
          file_ids: [result.id],
        })
        if (!ok) throw new Error('Submission failed after video upload')
        onSubmit?.({ type: subType, fileIds: [result.id] })
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
          setStream(null)
        }
      } else if (subType === 'online_text_entry') {
        const ok = await postSubmissionToCanvas(courseId, assignmentId, {
          submission_type: 'online_text_entry',
          body: textBody,
        })
        if (!ok) throw new Error('Submission failed')
        onSubmit?.({ type: subType, body: textBody })
      } else if (subType === 'online_url') {
        const ok = await postSubmissionToCanvas(courseId, assignmentId, {
          submission_type: 'online_url',
          url,
        })
        if (!ok) throw new Error('Submission failed')
        onSubmit?.({ type: subType, url })
      }

      setSubmitStatus('success')
      setTextBody('')
      setUrl('')
      setFiles([])
      setRecordedBlob(null)
      setPreviewUrl(null)
      onSuccess?.()
    } catch (err: any) {
      console.error('Submission error:', err)
      setSubmitStatus('error')
      setErrorMessage(err?.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }, [subType, textBody, url, files, recordedBlob, courseId, assignmentId, stream, onSubmit, onProgress, onSuccess])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }, [])

  if (submissionTypes.length === 0) {
    return <p className="cx-sub-form__empty">No submission types available for this assignment.</p>
  }

  return (
    <form className="cx-sub-form" onSubmit={handleSubmit}>
      <h3 className="cx-sub-form__title">Submit Assignment</h3>

      {submissionTypes.length > 1 && (
        <div className="cx-sub-form__type-select">
          <label className="cx-sub-form__label">Submission Type</label>
          <select
            className="cx-sub-form__select"
            value={subType}
            onChange={e => {
              const nextType = e.target.value as SubmissionType
              setSubType(nextType)
              if (nextType === 'media_recording' && !stream) {
                requestMediaAccess()
              }
            }}
          >
            {submissionTypes.map(t => (
              <option key={t} value={t}>
                {t === 'online_text_entry' ? 'Text Entry' : t === 'online_upload' ? 'File Upload' : t === 'online_url' ? 'Website URL' : 'Webcam Video Recording 🎥'}
              </option>
            ))}
          </select>
        </div>
      )}

      {subType === 'online_text_entry' && (
        <div className="cx-sub-form__field">
          <label className="cx-sub-form__label">Your Response</label>
          <textarea
            className="cx-sub-form__textarea"
            rows={8}
            placeholder="Type your submission here..."
            value={textBody}
            onChange={e => setTextBody(e.target.value)}
          />
        </div>
      )}

      {subType === 'online_url' && (
        <div className="cx-sub-form__field">
          <label className="cx-sub-form__label">Website URL</label>
          <input
            type="url"
            className="cx-sub-form__input"
            placeholder="https://example.com/my-work"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
      )}

      {subType === 'online_upload' && (
        <div className="cx-sub-form__field">
          <label className="cx-sub-form__label">Upload Files</label>
          <input
            type="file"
            className="cx-sub-form__file-input"
            multiple
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <ul className="cx-sub-form__file-list">
              {files.map((f, i) => (
                <li key={i} className="cx-sub-form__file-item">{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {subType === 'media_recording' && (
        <div className="cx-sub-form__field" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="cx-sub-form__label">Webcam Submission</label>
          
          {permissionError && (
            <div className="cx-notification cx-notification--warning" style={{ margin: 0, padding: 8, borderRadius: 8 }}>
              <span className="cx-notification__subtitle" style={{ fontSize: '0.78rem' }}>{permissionError}</span>
            </div>
          )}

          {!stream && !previewUrl && (
            <button 
              type="button" 
              className="cx-btn cx-btn--primary cx-btn--sm" 
              onClick={requestMediaAccess}
              style={{ alignSelf: 'flex-start' }}
            >
              📹 Grant Camera & Mic Access
            </button>
          )}

          {/* Recording panel */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            height: 360,
            background: '#020617',
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--cx-shadow-sm)'
          }}>
            {/* Live Video element for recording */}
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: previewUrl ? 'none' : 'block'
              }}
            />

            {/* Playback video element for review */}
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}

            {/* Red Recording Dot Overlay */}
            {isRecording && (
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 10px',
                borderRadius: 20,
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600
              }}>
                <span className="cx-pulse-dot" style={{
                  width: 8,
                  height: 8,
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite'
                }} />
                {isPaused ? 'PAUSED' : 'LIVE RECORDING'}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stream && !previewUrl && !isRecording && (
              <button type="button" className="cx-btn cx-btn--primary cx-btn--sm" onClick={startRecording}>
                🔴 Start Recording
              </button>
            )}

            {isRecording && (
              <>
                {!isPaused ? (
                  <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={pauseRecording}>
                    ⏸️ Pause
                  </button>
                ) : (
                  <button type="button" className="cx-btn cx-btn--primary cx-btn--sm" onClick={resumeRecording}>
                    ▶️ Resume
                  </button>
                )}
                <button type="button" className="cx-btn cx-btn--sm" onClick={stopRecording} style={{ background: '#ef4444', color: '#fff', border: 'none' }}>
                  ⏹️ Stop & Review
                </button>
              </>
            )}

            {previewUrl && (
              <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={clearRecording}>
                🔄 Re-record Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress & Statuses */}
      {uploadProgress !== null && (
        <div className="cx-progress-bar" style={{ marginTop: 8 }}>
          <div className="cx-progress-bar__track">
            <div className="cx-progress-bar__fill" style={{ width: `${uploadProgress}%`, background: 'var(--cx-color-primary)' }} />
          </div>
          <span style={{ fontSize: '0.75rem', marginLeft: 8 }}>{uploadProgress}% Uploaded</span>
        </div>
      )}

      {errorMessage && (
        <div className="cx-notification cx-notification--warning" style={{ marginTop: 12 }} role="alert">
          <span className="cx-notification__subtitle" style={{ fontSize: '0.8rem' }}>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        className="cx-sub-form__submit"
        disabled={
          isSubmitting || 
          (subType === 'online_text_entry' && !textBody.trim()) || 
          (subType === 'online_url' && !url.trim()) ||
          (subType === 'media_recording' && !recordedBlob) ||
          (subType === 'online_upload' && files.length === 0)
        }
        style={{
          marginTop: 16
        }}
      >
        {isSubmitting ? 'Uploading Submission...' : 'Submit Assignment'}
      </button>
    </form>
  )
}
