import {
  FilePlus,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  TrendingUp,
  User,
} from 'lucide-react'

/** Links shown in the desktop header, in order. */
export const mainNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/market-prices', label: 'Market prices' },
  { to: '/news', label: 'News' },
  { to: '/assistant', label: 'Assistant' },
]

/** The primary CTA that appears in the header. */
export const primaryCta = { to: '/reports/new', label: 'New report' }

/** Full navigation list used in the mobile drawer. */
export const allNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports/new', label: 'New soil report', icon: FilePlus },
  { to: '/reports', label: 'Report history', icon: FileText },
  { to: '/market-prices', label: 'Market prices', icon: TrendingUp },
  { to: '/news', label: 'Agriculture news', icon: Newspaper },
  { to: '/assistant', label: 'AI assistant', icon: MessageSquare },
  { to: '/profile', label: 'Farmer profile', icon: User },
]