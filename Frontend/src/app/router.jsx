import { createBrowserRouter } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import LandingPage from '../pages/landing/LandingPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import NewReportPage from '../pages/NewReportPage.jsx'
import ReportDetailPage from '../pages/ReportDetailPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'
import MarketPricesPage from '../pages/MarketPricesPage.jsx'
import NewsPage from '../pages/NewsPage.jsx'
import AssistantPage from '../pages/AssistantPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'reports/new', element: <NewReportPage /> },
      { path: 'reports/:reportId', element: <ReportDetailPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'market-prices', element: <MarketPricesPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])