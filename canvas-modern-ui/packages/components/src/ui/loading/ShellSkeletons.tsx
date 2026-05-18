import React from 'react'
import './loading.css'

interface SkeletonBoxProps {
  width?: string
  height?: string
  radius?: string
  className?: string
}

export function SkeletonBox({ width = '100%', height = '1rem', radius = 'var(--cm-radius-xs)', className = '' }: SkeletonBoxProps) {
  return (
    <div
      className={`cm-skel ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}

export function TopBarSkeleton() {
  return (
    <div className="cm-skel-topbar" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', height: 'var(--cm-header-height, 56px)', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
        <SkeletonBox width="120px" height="14px" />
        <SkeletonBox width="160px" height="14px" />
      </div>
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto' }}>
        <SkeletonBox width="100%" height="36px" radius="var(--cm-radius-sm)" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <SkeletonBox width="36px" height="36px" radius="var(--cm-radius-full)" />
        <SkeletonBox width="36px" height="36px" radius="var(--cm-radius-full)" />
        <SkeletonBox width="80px" height="36px" radius="var(--cm-radius-full)" />
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }} aria-hidden="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8 }}>
        <SkeletonBox width="32px" height="32px" radius="var(--cm-radius-sm)" />
        <SkeletonBox width="100px" height="16px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
            <SkeletonBox width="20px" height="20px" radius="var(--cm-radius-xs)" />
            <SkeletonBox width={`${60 + (i % 3) * 20}px`} height="14px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function NotificationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--cm-border-subtle)' }}>
          <SkeletonBox width="36px" height="36px" radius="var(--cm-radius-full)" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBox width={`${70 + (i % 3) * 10}%`} height="13px" />
            <SkeletonBox width="60%" height="11px" />
            <SkeletonBox width="40%" height="10px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: 'var(--cm-radius-md)', overflow: 'hidden', background: 'var(--cm-bg-surface)', border: '1px solid var(--cm-border-subtle)' }}>
          <div style={{ height: 120, overflow: 'hidden' }}>
            <SkeletonBox width="100%" height="100%" radius="0" />
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonBox width="40%" height="11px" />
            <SkeletonBox width={`${70 + (i % 3) * 10}%`} height="16px" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <SkeletonBox width="55%" height="12px" />
              <SkeletonBox width="50px" height="20px" radius="var(--cm-radius-full)" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--cm-bg-surface)', border: '1px solid var(--cm-border-subtle)', borderRadius: 'var(--cm-radius-md)', flex: 1, minWidth: 160 }}>
          <SkeletonBox width="44px" height="44px" radius="var(--cm-radius-md)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBox width="48px" height="24px" />
            <SkeletonBox width="80px" height="12px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function WidgetListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--cm-border-subtle)' }}>
          <SkeletonBox width="28px" height="28px" radius="var(--cm-radius-xs)" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBox width={`${60 + (i % 4) * 8}%`} height="13px" />
            <SkeletonBox width="45%" height="11px" />
          </div>
          <SkeletonBox width="36px" height="11px" />
        </div>
      ))}
    </div>
  )
}
