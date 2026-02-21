export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-8 pt-3 pb-1">
      <span className="text-xs font-semibold text-foreground">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
          <rect x="0" y="6" width="3" height="6" rx="1" fill="currentColor" className="text-foreground" />
          <rect x="4.5" y="4" width="3" height="8" rx="1" fill="currentColor" className="text-foreground" />
          <rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor" className="text-foreground" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor" className="text-foreground" opacity="0.3" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
          <path d="M7.5 3.5C9.16 3.5 10.68 4.15 11.8 5.25L13.2 3.85C11.7 2.35 9.7 1.5 7.5 1.5C5.3 1.5 3.3 2.35 1.8 3.85L3.2 5.25C4.32 4.15 5.84 3.5 7.5 3.5Z" fill="currentColor" className="text-foreground" />
          <path d="M7.5 6.5C8.5 6.5 9.4 6.85 10.1 7.45L11.5 6.05C10.4 5.15 9 4.5 7.5 4.5C6 4.5 4.6 5.15 3.5 6.05L4.9 7.45C5.6 6.85 6.5 6.5 7.5 6.5Z" fill="currentColor" className="text-foreground" />
          <circle cx="7.5" cy="9.5" r="1.5" fill="currentColor" className="text-foreground" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="0" y="1" width="21" height="10" rx="2" stroke="currentColor" strokeWidth="1" className="text-foreground" />
          <rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor" className="text-foreground" opacity="0.4" />
          <rect x="1.5" y="2.5" width="13" height="7" rx="1" fill="currentColor" className="text-foreground" />
        </svg>
      </div>
    </div>
  )
}
