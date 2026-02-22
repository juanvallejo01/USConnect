"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { MatchProvider } from "@/context/match-context"
import { NotificationProvider } from "@/context/notification-context"
import { ChatProvider, useChat } from "@/context/chat-context"
import { RankProvider } from "@/context/rank-context"
import { MobileFrame } from "@/components/layout/mobile-frame"
import { BottomNav, type Tab } from "@/components/navigation/bottom-nav"
import { AuthPage } from "@/pages/Auth"
import { ExplorePage } from "@/pages/Explore"
import { FeedPage } from "@/pages/Feed"
import { LeaderboardPage } from "@/pages/Leaderboard"
import { NotificationsPage } from "@/pages/Notifications"
import { ChatPage } from "@/pages/Chat"
import { ProfilePage } from "@/pages/Profile"
import { AdminDashboardPage } from "@/pages/AdminDashboard"

export default function Home() {
  return (
    <AuthProvider>
      <MatchProvider>
        <NotificationProvider>
          <ChatProvider>
            <RankProvider>
              <AppShell />
            </RankProvider>
          </ChatProvider>
        </NotificationProvider>
      </MatchProvider>
    </AuthProvider>
  )
}

function AppShell() {
  const { isLoggedIn, user } = useAuth()
  const { activeUserId, closeChat } = useChat()
  const [activeTab, setActiveTab] = useState<Tab>("explore")
  const [showAdmin, setShowAdmin] = useState(false)
  
  // Check if user is admin based on role from backend
  const isAdmin = user?.role === 'ADMIN'

  if (!isLoggedIn) {
    return <AuthPage />
  }

  if (showAdmin) {
    return <AdminDashboardPage onClose={() => setShowAdmin(false)} />
  }

  if (activeUserId !== null) {
    return (
      <MobileFrame>
        <ChatPage />
      </MobileFrame>
    )
  }

  function renderScreen() {
    switch (activeTab) {
      case "explore": return <ExplorePage />
      case "feed": return <FeedPage />
      case "leaderboard": return <LeaderboardPage />
      case "notifications": return <NotificationsPage />
      case "profile": return <ProfilePage />
      case "admin": return null
      default: return <ExplorePage />
    }
  }

  function handleTabChange(tab: Tab) {
    if (tab === "admin") {
      setShowAdmin(true)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <MobileFrame>
      <main className="flex-1 overflow-hidden">
        {renderScreen()}
      </main>
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        showAdmin={isAdmin}
      />
    </MobileFrame>
  )
}
