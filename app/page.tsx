"use client"

import { useState, useEffect } from "react"
import { LocaleProvider } from "@/context/locale-context"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { MatchProvider } from "@/context/match-context"
import { NotificationProvider } from "@/context/notification-context"
import { ChatProvider, useChat } from "@/context/chat-context"
import { ProfilePhotosProvider } from "@/context/profile-photos-context"
import { ToastProvider } from "@/context/toast-context"
import { MobileFrame } from "@/components/layout/mobile-frame"
import { BottomNav, type Tab } from "@/components/navigation/bottom-nav"
import { PageTransition } from "@/components/layout/page-transition"
import { LandingPage } from "@/screens/Landing"
import { AuthPage } from "@/screens/Auth"
import { ExplorePage } from "@/screens/Explore"
import { FeedPage } from "@/screens/Feed"
import { MatchesPage } from "@/screens/Matches"
import { LeaderboardPage } from "@/screens/Leaderboard"
import { NotificationsPage } from "@/screens/Notifications"
import { ChatPage } from "@/screens/Chat"
import { ProfilePage } from "@/screens/Profile"
import { AdminDashboardPage } from "@/screens/AdminDashboard"

export default function Home() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ToastProvider>
          <ProfilePhotosProvider>
            <MatchProvider>
              <NotificationProvider>
                <ChatProvider>
                  <AppShell />
                </ChatProvider>
              </NotificationProvider>
            </MatchProvider>
          </ProfilePhotosProvider>
        </ToastProvider>
      </AuthProvider>
    </LocaleProvider>
  )
}

function AppShell() {
  const { isLoggedIn, isLoading, user } = useAuth()
  const { activeUserId, closeChat } = useChat()
  const [activeTab, setActiveTab] = useState<Tab>("feed")
  const [showAdmin, setShowAdmin] = useState(false)
  const [authEntry, setAuthEntry] = useState<"login" | "register" | null>(null)

  // Check if user is admin based on role from backend
  const isAdmin = user?.role === 'ADMIN'

  // Return to the landing page after logging out
  useEffect(() => {
    if (!isLoggedIn) setAuthEntry(null)
  }, [isLoggedIn])

  if (isLoading) {
    return <div className="min-h-screen bg-background" />
  }

  if (!isLoggedIn) {
    if (!authEntry) {
      return (
        <LandingPage
          onSignIn={() => setAuthEntry("login")}
          onCreateAccount={() => setAuthEntry("register")}
        />
      )
    }
    return <AuthPage initialMode={authEntry} />
  }

  // Si es admin, mostrar SOLO el panel de administración
  if (isAdmin) {
    return <AdminDashboardPage onClose={() => {}} />
  }

  // Usuarios normales: mostrar chat y navegación normal (sin admin)
  if (activeUserId !== null) {
    return (
      <MobileFrame>
        <PageTransition pageKey={`chat-${activeUserId}`}>
          <ChatPage />
        </PageTransition>
      </MobileFrame>
    )
  }

  function renderScreen() {
    switch (activeTab) {
      case "feed": 
        return (
          <PageTransition pageKey="feed">
            <FeedPage />
          </PageTransition>
        )
      case "explore": 
        return (
          <PageTransition pageKey="explore">
            <ExplorePage />
          </PageTransition>
        )
      case "matches": 
        return (
          <PageTransition pageKey="matches">
            <MatchesPage />
          </PageTransition>
        )
      case "leaderboard": 
        return (
          <PageTransition pageKey="leaderboard">
            <LeaderboardPage />
          </PageTransition>
        )
      case "notifications": 
        return (
          <PageTransition pageKey="notifications">
            <NotificationsPage />
          </PageTransition>
        )
      case "profile": 
        return (
          <PageTransition pageKey="profile">
            <ProfilePage />
          </PageTransition>
        )
      default: 
        return (
          <PageTransition pageKey="feed">
            <FeedPage />
          </PageTransition>
        )
    }
  }

  return (
    <MobileFrame>
      <main className="flex-1 overflow-hidden">
        {renderScreen()}
      </main>
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        showAdmin={false}
      />
    </MobileFrame>
  )
}
