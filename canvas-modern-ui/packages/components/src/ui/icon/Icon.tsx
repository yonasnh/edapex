import React, { memo, type SVGAttributes } from 'react'
import clsx from 'clsx'

export type IconSize = 16 | 20 | 24

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: IconSize
  label?: string
}

const SIZES = { 16: 16, 20: 20, 24: 24 }

function IconBase({ size = 24, label, children, className, ...props }: IconProps & { children: React.ReactNode }) {
  const px = SIZES[size]
  return (
    <svg
      className={clsx('cm-icon', className)}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={size === 16 ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...props}
    >
      {children}
    </svg>
  )
}

function createIcon(paths: string, viewBox = '0 0 24 24'): React.FC<IconProps> {
  return memo<IconProps>(({ size = 24, label, className, ...props }) => (
    <svg
      className={clsx('cm-icon', className)}
      width={SIZES[size]}
      height={SIZES[size]}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={size === 16 ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...props}
    >
      {paths.split('|').map((d, i) => (
        <path key={i} d={d.trim()} />
      ))}
    </svg>
  ))
}

export const SearchIcon = createIcon('M10 17a7 7 0 100-14 7 7 0 000 14zM21 21l-4.35-4.35')
export const CloseIcon = createIcon('M18 6L6 18M6 6l12 12')
export const ChevronLeftIcon = createIcon('M15 18l-6-6 6-6')
export const ChevronRightIcon = createIcon('M9 18l6-6-6-6')
export const ChevronUpIcon = createIcon('M18 15l-6-6-6 6')
export const ChevronDownIcon = createIcon('M6 9l6 6 6-6')
export const CheckIcon = createIcon('M20 6L9 17l-5-5')
export const AlertCircleIcon = createIcon('M12 8v4M12 16h.01M12 2a10 10 0 100 20 10 10 0 000-20z')
export const InfoIcon = createIcon('M12 16v-4M12 8h.01M12 2a10 10 0 100 20 10 10 0 000-20z')
export const WarningIcon = createIcon('M12 2L2 19h20L12 2zM12 10v4M12 16h.01')
export const EyeIcon = createIcon('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z')
export const EyeOffIcon = createIcon('M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24M1 1l22 22')
export const MenuIcon = createIcon('M3 12h18M3 6h18M3 18h18')
export const SettingsIcon = createIcon('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z')
export const HomeIcon = createIcon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10')
export const BellIcon = createIcon('M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0')
export const BookIcon = createIcon('M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2zM12 6v7M9 9l3-3 3 3')
export const UserIcon = createIcon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z')
export const FileIcon = createIcon('M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8')
export const EditIcon = createIcon('M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z')
export const ChatIcon = createIcon('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2zM8 9h8M8 13h6')
export const CheckCircleIcon = createIcon('M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3')
export const AlertTriangleIcon = createIcon('M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01')
export const MegaphoneIcon = createIcon('M15 8.5V19a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1M15 8.5l4.29-1.43A1 1 0 0121 8.02v7.96a1 1 0 01-.71.96L15 15.5M15 8.5H5a2 2 0 00-2 2v1a2 2 0 002 2h2.5M15 15.5V8.5M7 15v4a2 2 0 002 2h2')
export const MailIcon = createIcon('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6')
export const StarIcon = createIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z')
export const CalendarIcon = createIcon('M3 4h18v4H3V4zM3 8v12a2 2 0 002 2h14a2 2 0 002-2V8M7 2v4M17 2v4M8 13h2M12 13h2M16 13h2M8 17h2M12 17h2M16 17h2')
export const BarChartIcon = createIcon('M18 20V10M12 20V4M6 20v-6')
export const GridIcon = createIcon('M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z')
export const ListIcon = createIcon('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01')
export { IconBase }
