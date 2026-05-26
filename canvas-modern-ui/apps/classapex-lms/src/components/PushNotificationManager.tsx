import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../hooks/useNotification';

interface PushNotificationManagerProps {
  vapidPublicKey?: string;
}

/**
 * PushNotificationManager
 *
 * Manages Web Push subscription state and renders a permission prompt
 * when notifications are not yet granted. In a full implementation,
 * the subscription would be sent to your backend to store alongside
 * the user's Canvas profile.
 */
export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY,
}) => {
  const { showToast } = useNotification();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    setPermission(Notification.permission);

    // Check existing subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
        if (!sub && Notification.permission === 'default') {
          // Show prompt after a short delay so it doesn't interrupt initial load
          const timer = setTimeout(() => setShowPrompt(true), 5000);
          return () => clearTimeout(timer);
        }
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      showToast({ title: 'Push Not Configured', message: 'VAPID public key is missing.', type: 'warning' });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      setSubscription(sub);
      setPermission('granted');
      setShowPrompt(false);

      // In production, send subscription JSON to your backend:
      // await canvasFetch('/api/v1/users/self/push_subscriptions', { method: 'POST', body: sub.toJSON() });

      showToast({ title: 'Notifications Enabled', message: 'You will receive push notifications for grades and announcements.', type: 'success' });
    } catch (err: any) {
      console.error('[Push] Subscribe failed:', err);
      setPermission(Notification.permission);
      if (Notification.permission === 'denied') {
        setShowPrompt(false);
      }
      showToast({ title: 'Notification Error', message: err?.message || 'Could not enable notifications.', type: 'error' });
    }
  }, [vapidPublicKey, showToast]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      setSubscription(null);
      showToast({ title: 'Notifications Disabled', message: 'Push notifications have been turned off.', type: 'success' });
    } catch (err: any) {
      showToast({ title: 'Error', message: err?.message || 'Failed to disable notifications.', type: 'error' });
    }
  }, [subscription, showToast]);

  // Don't render anything if push is unsupported or already subscribed
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;
  if (permission === 'denied') return null;
  if (subscription) {
    return (
      <button
        className="cx-btn cx-btn--ghost cx-btn--sm"
        onClick={unsubscribe}
        title="Disable push notifications"
        style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50 }}
      >
        <BellSvg /> Push On
      </button>
    );
  }

  return (
    <>
      {showPrompt && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 50,
            background: 'var(--cx-bg-surface-raised)',
            border: '1px solid var(--cx-border-default)',
            borderRadius: 'var(--cx-radius-lg)',
            padding: '12px 16px',
            boxShadow: 'var(--cx-shadow-lg)',
            maxWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>
            Stay in the loop
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
            Get push notifications for grades, announcements, and due dates.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowPrompt(false)}>
              Not now
            </button>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={subscribe}>
              Enable
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function BellSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
      <path d="M7 1.5A4.5 4.5 0 002.5 6c0 2.5-.8 4-1.5 5h12c-.7-1-1.5-2.5-1.5-5A4.5 4.5 0 007 1.5z" />
      <path d="M5.5 11a1.5 1.5 0 003 0" />
    </svg>
  );
}

export default PushNotificationManager;
