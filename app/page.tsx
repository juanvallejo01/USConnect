"use client"

import { AuthProvider, useAuth } from "@/context/auth-context"
import { SparkProvider, useSpark } from "@/context/spark-context"
import { MobileFrame } from "@/components/layout/mobile-frame"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AuthPage } from "@/pages/Auth"
import { ExplorePage } from "@/pages/Explore"
import { FeedPage } from "@/pages/Feed"
import { SparksPage } from "@/pages/Sparks"
import { ChatPage } from "@/pages/Chat"
import { ProfilePage } from "@/pages/Profile"
import { AdminDashboardPage } from "@/pages/AdminDashboard"

export default function Home() {
  return (
    <AuthProvider>
      <SparkProvider>
        <AppShell />
      </SparkProvider>
    </AuthProvider>
  )
}

function AppShell() {
  const { isLoggedIn } = useAuth()
  const { showAdmin, activeSparkId, activeTab } = useSpark()

  if (!isLoggedIn) {
    return <AuthPage />
  }

  if (showAdmin) {
    return <AdminDashboardPage />
  }

  function renderScreen() {
    if (activeSparkId !== null) return <ChatPage />
    switch (activeTab) {
      case "explore": return <ExplorePage />
      case "feed": return <FeedPage />
      case "sparks": return <SparksPage />
      case "chat": return <SparksPage />
      case "profile": return <ProfilePage />
      default: return <ExplorePage />
    }
  }

  return (
    <MobileFrame>
      <main className="flex-1 overflow-hidden">
        {renderScreen()}
      </main>
      {activeSparkId === null && <BottomNav />}
    </MobileFrame>
  )
}
