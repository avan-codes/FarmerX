import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import LandingPage from '../pages/landing/LandingPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

const DashboardPage = React.lazy(() => import('../pages/DashboardPage.jsx'))
const NewReportPage = React.lazy(() => import('../pages/NewReportPage.jsx'))
const ReportDetailPage = React.lazy(() => import('../pages/ReportDetailPage.jsx'))
const ReportsPage = React.lazy(() => import('../pages/ReportsPage.jsx'))
const FarmsPage = React.lazy(() => import('../pages/FarmsPage.jsx'))
const MarketPricesPage = React.lazy(() => import('../pages/MarketPricesPage.jsx'))
const NewsPage = React.lazy(() => import('../pages/NewsPage.jsx'))
const NewsDetailPage = React.lazy(() => import('../pages/NewsDetailPage.jsx'))
const AssistantPage = React.lazy(() => import('../pages/AssistantPage.jsx'))
const ProfilePage = React.lazy(() => import('../pages/ProfilePage.jsx'))

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
      { path: 'farms', element: <FarmsPage /> },
      { path: 'market-prices', element: <MarketPricesPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:newsId', element: <NewsDetailPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

