import React, { useState, useCallback } from 'react'
import canvasApi from '../services/canvasApi'

type SubmissionType = 'online_text_entry' | 'online_upload' | 'online_url'

interface SubmissionFormProps {
  assignmentId: number
  submissionTypes?: SubmissionType[]
  courseId?: number | string
  onProgress?: (pct: number) => void
  onSubmit?: (data: { type: SubmissionType; body?: string; url?: string; files?: File[]; fileIds?: (string | number)[] }) => void
}

export function SubmissionForm({ assignmentId, submissionTypes = ['online_text_entry'], courseId, onProgress, onSubmit }: SubmissionFormProps) {
  const [subType, setSubType] = useState<SubmissionType>(submissionTypes[0])
  const [textBody, setTextBody] = useState('')
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (subType === 'online_upload' && files.length > 0) {
      try {
        const fileIds: (string | number)[] = []
        for (const file of files) {
          const result = await canvasApi.uploadFile(file, courseId as any)
          fileIds.push(result.id)
          const pct = Math.round((fileIds.length / files.length) * 100)
          setUploadProgress(pct)
          onProgress?.(pct)
        }
        onSubmit?.({ type: subType, files, fileIds })
      } catch (err) {
        console.error('Upload failed:', err)
      }
    } else {
      onSubmit?.({ type: subType, body: textBody, url, files })
    }
    setIsSubmitting(false)
    setUploadProgress(null)
  }, [subType, textBody, url, files, courseId, onSubmit, onProgress])

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
            onChange={e => setSubType(e.target.value as SubmissionType)}
          >
            {submissionTypes.map(t => (
              <option key={t} value={t}>
                {t === 'online_text_entry' ? 'Text Entry' : t === 'online_upload' ? 'File Upload' : 'Website URL'}
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
          {uploadProgress !== null && (
            <div className="cx-progress-bar" style={{ marginTop: 8 }}>
              <div className="cx-progress-bar__track">
                <div className="cx-progress-bar__fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span style={{ fontSize: '0.75rem', marginLeft: 8 }}>{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="cx-sub-form__submit"
        disabled={isSubmitting || (subType === 'online_text_entry' && !textBody.trim()) || (subType === 'online_url' && !url.trim())}
      >
        {isSubmitting ? 'Uploading...' : 'Submit Assignment'}
      </button>
    </form>
  )
}
