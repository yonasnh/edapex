import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import LogoLoader from '../components/LogoLoader'

export default function LtiPlayer() {
  const { courseId, accountId } = useParams();
  const [searchParams] = useSearchParams();
  const toolId = searchParams.get('tool_id');
  const assignmentId = searchParams.get('assignment_id');
  const navigate = useNavigate();

  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function getLaunchUrl() {
      if (!courseId && !accountId) {
        setError('No course ID or account ID provided.');
        setLoading(false);
        return;
      }
      
      try {
        let endpoint = courseId 
          ? `/api/v1/courses/${courseId}/external_tools/sessionless_launch?launch_type=course_navigation`
          : `/api/v1/accounts/${accountId}/external_tools/sessionless_launch?launch_type=global_navigation`;
          
        if (toolId) {
          endpoint += `&id=${toolId}`;
        }
        if (assignmentId && courseId) {
          endpoint = `/api/v1/courses/${courseId}/assignments/${assignmentId}/external_tools/sessionless_launch`;
        }
        
        const response = await canvasFetch(endpoint);
        setLaunchUrl(response.url);
      } catch (err: any) {
        console.error('Failed to get LTI launch URL', err);
        setError(err.message || 'Failed to initialize LTI tool.');
      } finally {
        setLoading(false);
      }
    }
    
    getLaunchUrl();
  }, [courseId, accountId, toolId, assignmentId]);

  // Handle postMessage from LTI tool for resizing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // For security, you would verify event.origin here if known
      
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        
        if (data && data.subject === 'lti.frameResize' && iframeRef.current) {
          if (data.height) {
            iframeRef.current.style.height = `${data.height}px`;
          }
        }
      } catch (e) {
        // Not JSON or missing fields, ignore
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <LogoLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cx-page" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ background: 'var(--cx-color-danger-subtle)', color: 'var(--cx-color-danger-text)', padding: 24, borderRadius: 8, display: 'inline-block' }}>
          <h2 style={{ margin: '0 0 12px' }}>Tool Launch Failed</h2>
          <p style={{ margin: 0 }}>{error}</p>
          <button className="cx-btn cx-btn--primary" style={{ marginTop: 24 }} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-page cx-page--full" style={{ padding: 0, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={launchUrl || ''}
        style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
        allow="microphone *; camera *; midi *; geolocation *; encrypted-media *; fullscreen *; display-capture *; sync-xhr *"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
        title="LTI Tool"
      />
    </div>
  );
}
