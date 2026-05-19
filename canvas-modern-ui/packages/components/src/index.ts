export { Button, IconButton, ButtonGroup } from './ui/button/Button'
export type { ButtonProps, ButtonGroupProps } from './ui/button/Button'

export { Alert, Toast } from './ui/alert/Alert'
export type { AlertProps, AlertVariant, ToastProps } from './ui/alert/Alert'

export { Tabs } from './ui/tabs/Tabs'
export type { Tab, TabsProps } from './ui/tabs/Tabs'

export { Table } from './ui/table/Table'
export type { Column, TableProps } from './ui/table/Table'

export {
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  SearchInput,
  PasswordInput,
  Badge,
  Avatar,
  Modal,
} from './ui/atoms/Atoms'

export { AppShell } from './ui/layout/AppShell'
export { TopBar } from './ui/layout/TopBar'
export { NotificationDropdown } from './ui/layout/NotificationDropdown'
export { GlobalSearchModal } from './ui/layout/GlobalSearchModal'

export { Breadcrumb } from './navigation/Breadcrumb'
export { NavigationSidebar } from './navigation/NavigationSidebar'

export {
  LoadingSpinner,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonProgressBar,
  PageLoading,
  InlineLoading,
} from './ui/loading/LoadingStates'

export { EmptyState, EmptyStates } from './ui/empty/EmptyStates'

export { Card } from './ui/card/Card'
export type { CardProps, CardVariant, CardDensity } from './ui/card/Card'
export { CourseCard, CourseCardGrid } from './ui/card/CourseCard'
export { AssignmentCard } from './ui/card/AssignmentCard'
export { DiscussionCard } from './ui/card/DiscussionCard'
export { CalendarEventCard } from './ui/card/CalendarEventCard'
export { FileCard } from './ui/card/FileCard'

export { ProgressBar } from './ui/progress/ProgressBar'
export type { ProgressBarProps } from './ui/progress/ProgressBar'

export { Drawer } from './ui/drawer/Drawer'
export type { DrawerProps, DrawerSide } from './ui/drawer/Drawer'

export { Pagination } from './ui/pagination/Pagination'
export type { PaginationProps } from './ui/pagination/Pagination'

export { Popover } from './ui/popover/Popover'
export type { PopoverProps, PopoverPlacement } from './ui/popover/Popover'

export {
  SearchIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronUpIcon, ChevronDownIcon, CheckIcon, CheckCircleIcon,
  AlertCircleIcon, InfoIcon, WarningIcon, AlertTriangleIcon,
  EyeIcon, EyeOffIcon, MenuIcon, SettingsIcon, HomeIcon, BellIcon,
  BookIcon, UserIcon, FileIcon, EditIcon, ChatIcon,
  MegaphoneIcon, MailIcon, StarIcon, CalendarIcon, BarChartIcon, GridIcon, ListIcon,
} from './ui/icon/Icon'
export type { IconProps, IconSize } from './ui/icon/Icon'

export { ErrorBoundary } from './error-handling/ErrorBoundary'
export { APIErrorHandler } from './error-handling/APIErrorHandler'

export * from './ui/LaunchInfo'
export * from './ui/PerformanceMonitor'
export * from './ui/SettingsPanel'

export type {
  Course,
  User,
  Assignment,
  Submission,
  DiscussionTopic,
  DiscussionEntry,
  CalendarEvent,
  File,
  Folder,
  Notification,
  NotificationPreferences
} from '@schoolapex/core'
