# Campus Circle - Premium Social Campus App

A modern, iOS-style social networking platform for university students featuring match-based chat, campus rankings, and real-time notifications.

## 🎨 Design System

### Color Palette
- **Primary Gradient**: `linear-gradient(135deg, #8B5CF6, #EC4899)` (Purple to Pink)
- **Background**: `#F9FAFB` (Gray-50)
- **Cards**: `#FFFFFF` with subtle shadows
- **Text**: Gray-900 (primary), Gray-500 (secondary)

### UI Principles
- **Premium iOS Aesthetic**: Rounded-3xl containers, generous spacing
- **Smooth Animations**: 300ms transitions, scale effects, fade-ins
- **Gradient Accents**: Used for buttons, headers, active states
- **Backdrop Blur**: Glass-morphism for navigation and overlays

## 🏗️ Architecture

### Core Product Logic

#### Likes System
- **Permanent Likes**: Once liked, cannot be removed
- **Anti-Spam**: Users cannot like themselves or duplicate likes
- **One-Way or Mutual**: Likes can be one-directional until mutual

#### Match System
- **Auto-Created**: Match forms when both users like each other
- **Permanent**: Matches cannot be removed
- **Chat Access**: Only matched users can message each other

#### Campus Rank
- **Formula**: `CampusRank = totalLikesReceived`
- **Simplicity**: Only likes count, no complex scoring
- **Real-Time**: Updates immediately when likes are received

#### Notifications
- **Match Alerts**: Users notified when a new match is created
- **Badge Count**: Red dot shows unread notification count
- **Action Oriented**: "Start Chat" button directly opens conversation

### Context Structure

```
AuthProvider (Authentication)
  ├── MatchProvider (Likes & Matches)
  │     ├── NotificationProvider (Match Notifications)
  │     │     ├── ChatProvider (Messages)
  │     │     │     └── RankProvider (Rankings)
```

**Dependency Flow:**
- `RankContext` depends on `MatchContext` (for like counts)
- `ChatContext` depends on `MatchContext` (for match validation)
- `NotificationContext` is independent but triggered by `MatchContext`

### File Structure

```
src/
├── app/
│   ├── page.tsx              # Main app shell with providers
│   └── globals.css           # Global styles & animations
├── components/
│   ├── layout/               # Reusable layout components
│   ├── navigation/           # Bottom nav with badge
│   ├── admin/                # Admin dashboard
│   └── ...
├── context/
│   ├── auth-context.tsx      # User authentication
│   ├── match-context.tsx     # Likes & matches (core logic)
│   ├── notification-context.tsx  # Match notifications
│   ├── chat-context.tsx      # Messaging (requires match)
│   └── rank-context.tsx      # Campus rankings
├── pages/
│   ├── Explore.tsx           # Swipe to like users
│   ├── Feed.tsx              # Public posts
│   ├── Leaderboard.tsx       # Top 10 ranked users
│   ├── Notifications.tsx     # Match notifications
│   ├── Chat.tsx              # Match-required messaging
│   └── Profile.tsx           # User profile settings
├── utils/
│   ├── match.ts              # Match validation utilities
│   ├── rank.ts               # Ranking calculation utilities
│   └── constants.ts          # App constants
└── types/
    └── index.ts              # TypeScript interfaces
```

## 🔑 Key Features

### 1. Match-Based Chat
- **Access Control**: Chat only available after mutual like
- **Visual Feedback**: Lock icon and "Match Required" message
- **Disabled State**: Input greyed out, send button inactive

### 2. Permanent Likes
- **No Undo**: Strategic liking encouraged
- **Once Only**: Cannot like same user twice
- **Visual Indicator**: "Already Liked" badge on profile

### 3. Match Celebrations
- **Confetti Animation**: 30 particles falling on match
- **Modal Popup**: Large celebration screen
- **Instant Action**: "Send Message" or "Keep Swiping"

### 4. Real-Time Notifications
- **Badge Counter**: Shows unread count (1-9+)
- **Match Cards**: User avatar, name, timestamp
- **Quick Action**: Tap to start chat immediately

### 5. Campus Leaderboard
- **Top 10 Ranking**: Sorted by likes received
- **Podium Display**: Top 3 with medal badges
- **Smooth Animations**: Fade-in, hover effects
- **Heart Icons**: Visual representation of likes

## 🛠️ Utilities

### `utils/match.ts`
- `canLikeUser()` - Validates like action (anti-spam)
- `hasMutualLikes()` - Checks if both users liked each other
- `createMatch()` - Generates new match object
- `findMatch()` - Searches for existing match

### `utils/rank.ts`
- `calculateLikesReceived()` - Counts likes for user
- `getTopUsers()` - Returns ranked list with limit
- `getUserRank()` - Gets specific user's rank and likes

## 🎯 Business Logic Centralization

### Single Responsibility Principle
- **MatchContext**: Only handles likes and matches
- **ChatContext**: Only handles messages
- **RankContext**: Only handles rankings
- **NotificationContext**: Only handles notifications

### No Logic in UI Components
- All business logic in context files
- UI components are purely presentational
- Validation happens at context level

### Utility Functions
- Reusable logic extracted to `utils/`
- TypeScript strict typing (no `any`)
- Pure functions without side effects

## 🎨 Animation System

### CSS Keyframes
```css
@keyframes fadeIn       # Opacity 0 → 1
@keyframes scaleIn      # Scale 0.9 → 1
@keyframes confetti     # Falling particles
@keyframes slideUp      # Translate Y 20px → 0
@keyframes pulse        # Opacity breathing
```

### Usage
- `.animate-fadeIn` - Elements appearing
- `.animate-scaleIn` - Modals/popups
- `.animate-confetti` - Match celebration
- `.animate-slideUp` - Header transitions
- `.animate-pulse` - Warning messages

### Delays
```tsx
style={{ animationDelay: `${index * 0.05}s` }}
```

## 🔐 Security & Validation

### Like Validation
- ✅ Sender and receiver must be different
- ✅ Like must not already exist
- ✅ Both users must exist in system

### Chat Validation
- ✅ Match must exist before messaging
- ✅ Validation at context level
- ✅ UI disabled if not matched

### Admin Controls
- View total users, likes, matches
- Monitor notification activity
- Track average engagement

## 📱 Responsive Design

### Mobile-First
- Base width: 390px (iPhone size)
- Scales down gracefully
- Touch-friendly targets (44px minimum)

### iOS Aesthetic
- Rounded corners (3xl = 24px)
- Backdrop blur effects
- Smooth transitions (300ms)
- Shadow elevation (sm/md/lg)

## 🚀 Production Readiness

### TypeScript
- ✅ Strict mode enabled
- ✅ No `any` types
- ✅ Full interface coverage

### Code Quality
- ✅ Single responsibility contexts
- ✅ No duplicate logic
- ✅ Utility functions extracted
- ✅ Clear folder structure

### Performance
- ✅ Memoized callbacks
- ✅ Optimized re-renders
- ✅ Lazy loading ready

## 📊 Metrics Tracked

- Total Users
- Active Users (today)
- Total Likes
- Total Matches
- Total Notifications
- Average Likes per User

## 🎓 Campus Rank Algorithm

```typescript
// Simple, transparent formula
CampusRank = totalLikesReceived

// Example:
User A: 45 likes → Rank based on 45
User B: 12 likes → Rank based on 12
User C: 89 likes → Rank based on 89
// Sorted: C (1st), A (2nd), B (3rd)
```

No complex weighting, no hidden factors. Pure engagement.

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS
