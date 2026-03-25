"use client"

import { useState } from "react"
import { ShieldCheck, CheckCircle, Ban, Trash2 } from "lucide-react"
import { StatusBadge } from "./stat-card"
import { ADMIN_USERS } from "@/utils/constants"

export function UsersTab() {
  const [userList, setUserList] = useState(ADMIN_USERS)

  function handleVerify(id: number) {
    setUserList((prev) => prev.map((u) => (u.id === id ? { ...u, verified: true } : u)))
  }

  function handleSuspend(id: number) {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "suspended" as const } : u))
    )
  }

  function handleDelete(id: number) {
    setUserList((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">All Users</h3>
        <span className="text-xs text-muted-foreground">{userList.length} users</span>
      </div>
      {userList.map((user) => (
        <div key={user.id} className="rounded-xl bg-card border border-border cloud-shadow p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">{user.name}</h4>
                {user.verified && <ShieldCheck size={14} className="text-[#4A90D9] shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.major}</p>
            </div>
            <StatusBadge status={user.status} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            {!user.verified && (
              <button
                onClick={() => handleVerify(user.id)}
                className="flex items-center gap-1.5 rounded-lg bg-[#4A90D9]/10 px-3 py-1.5 text-xs font-medium text-[#4A90D9] transition-colors hover:bg-[#4A90D9]/20 active:scale-95"
              >
                <CheckCircle size={12} /> Verify
              </button>
            )}
            {user.status !== "suspended" && user.status !== "banned" && (
              <button
                onClick={() => handleSuspend(user.id)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 active:scale-95"
              >
                <Ban size={12} /> Suspend
              </button>
            )}
            <button
              onClick={() => handleDelete(user.id)}
              className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 active:scale-95"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
