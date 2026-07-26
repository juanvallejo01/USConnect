"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Eye, Trash2, ShieldCheck, Flag, Check, Clock, CalendarX, Ban } from "lucide-react"
import { useTranslations } from "next-intl"
import { REPORTED_POSTS } from "@/utils/constants"
import { adminApi } from "@/lib/api-client"
import { formatRelativeTime } from "@/utils/relative-time"
import type { Report, ReportAction } from "@/types"

export function ModerationTab() {
  const t = useTranslations("adminModeration")
  const tReasons = useTranslations("adminModeration.reasons")
  const tReports = useTranslations("adminReports")
  const tReportReasons = useTranslations("adminReports.reasons")
  const tTime = useTranslations("time")
  const [posts, setPosts] = useState(REPORTED_POSTS)
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoadingReports(true)
      const data = await adminApi.getReports("PENDING")
      setReports(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleResolve = async (report: Report, action: ReportAction) => {
    if (
      (action === "suspend_1w" || action === "suspend_1m" || action === "ban") &&
      !confirm(tReports("confirmAction", { action: tReports(`actions.${action}`), name: report.reported?.name ?? "?" }))
    ) {
      return
    }
    try {
      await adminApi.resolveReport(report.id, action)
      setReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (error) {
      console.error("Failed to resolve report:", error)
    }
  }

  function handleRemove(id: number) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* ── Reported users (real data) ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{tReports("title")}</h3>
        {!loadingReports && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {tReports("pendingCount", { count: reports.length })}
          </span>
        )}
      </div>
      {loadingReports ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-card border border-border">
          <ShieldCheck size={32} className="text-muted-foreground/30 mb-2" />
          <p className="text-xs font-medium text-muted-foreground">{tReports("allClear")}</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="rounded-xl bg-card border border-border cloud-shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{report.reported?.name}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    {tReportReasons(report.reason)}
                  </span>
                  {report.reported?.accountStatus === "SUSPENDED" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {tReports("alreadySuspended")}
                    </span>
                  )}
                  {report.reported?.accountStatus === "BANNED" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      {tReports("alreadyBanned")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tReports("reportedBy", { name: report.reporter?.name ?? "?" })}
                </p>
                <p className="text-xs font-medium text-red-700 mt-0.5">
                  {tReports("totalReportsCount", { count: report.reportedTotalCount ?? 1 })}
                </p>
                {report.details && (
                  <div className="rounded-lg bg-secondary p-3 mt-2">
                    <p className="text-xs text-foreground/80 leading-relaxed">{report.details}</p>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatRelativeTime(report.createdAt, tTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleResolve(report, "dismiss")}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border active:scale-95"
              >
                <Flag size={12} /> {tReports("dismiss")}
              </button>
              <button
                onClick={() => handleResolve(report, "resolve")}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border active:scale-95"
              >
                <Check size={12} /> {tReports("resolve")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResolve(report, "suspend_1w")}
                className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 active:scale-95"
              >
                <Clock size={12} /> {tReports("actions.suspend_1w")}
              </button>
              <button
                onClick={() => handleResolve(report, "suspend_1m")}
                className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 active:scale-95"
              >
                <CalendarX size={12} /> {tReports("actions.suspend_1m")}
              </button>
              <button
                onClick={() => handleResolve(report, "ban")}
                className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 active:scale-95"
              >
                <Ban size={12} /> {tReports("actions.ban")}
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── Reported content (posts) ── */}
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-sm font-semibold text-foreground">{t("reportedContent")}</h3>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
          {t("pendingCount", { count: posts.length })}
        </span>
      </div>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-card border border-border">
          <ShieldCheck size={40} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">{t("allClear")}</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="rounded-xl bg-card border border-border cloud-shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{post.user}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    {t("reportsCount", { count: post.reports })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{tReasons(post.reason)}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{post.time}</span>
            </div>
            <div className="rounded-lg bg-secondary p-3 mb-3">
              <p className="text-xs text-foreground/80 leading-relaxed">{post.content}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border active:scale-95">
                <Eye size={12} /> {t("review")}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 active:scale-95">
                <AlertTriangle size={12} /> {t("warnUser")}
              </button>
              <button
                onClick={() => handleRemove(post.id)}
                className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 active:scale-95"
              >
                <Trash2 size={12} /> {t("remove")}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
