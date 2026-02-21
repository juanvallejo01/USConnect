export const BRAND = {
  name: "Campus Circle",
  gradientFrom: "#C62828",
  gradientTo: "#1565C0",
  gradientClass: "bg-gradient-to-r from-[#C62828] to-[#1565C0]",
  gradientClassBr: "bg-gradient-to-br from-[#C62828] to-[#1565C0]",
} as const

export interface UserProfile {
  id: number
  name: string
  avatar: string
  major: string
}

export interface SparkUser extends UserProfile {
  status: string
  lastMessage: string
  time: string
  unread: boolean
}

export interface ChatMessage {
  id: number
  text: string
  sent: boolean
  time: string
}

export interface FeedPost {
  id: number
  user: UserProfile & { major: string }
  timestamp: string
  content: string
  image?: string
  sparks: number
  connects: number
  discussions: number
  comments: FeedComment[]
}

export interface FeedComment {
  id: number
  name: string
  avatar: string
  text: string
  time: string
}

export const PROFILES = [
  {
    id: 1,
    name: "Sarah",
    age: 21,
    image: "/images/swipe-profile.jpg",
    interests: ["Photography", "Hiking", "Design"],
    bio: "Film major who loves golden hour shots",
  },
  {
    id: 2,
    name: "James",
    age: 22,
    image: "/images/profile-2.jpg",
    interests: ["Music", "Basketball", "CS"],
    bio: "Computer Science major, part-time DJ",
  },
  {
    id: 3,
    name: "Emily",
    age: 20,
    image: "/images/profile-3.jpg",
    interests: ["Art", "Yoga", "Coffee"],
    bio: "Art history nerd with a coffee addiction",
  },
] as const

export const SPARKS_DATA: SparkUser[] = [
  {
    id: 1,
    name: "Sarah Miller",
    avatar: "/images/profile-1.jpg",
    major: "Film Production",
    status: "Looking for study partners",
    lastMessage: "Hey! Are you going to the event tonight?",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    name: "James Chen",
    avatar: "/images/profile-2.jpg",
    major: "Computer Science",
    status: "Building cool things",
    lastMessage: "That sounds great, let's do it!",
    time: "15m ago",
    unread: true,
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "/images/profile-3.jpg",
    major: "Art History",
    status: "Thesis writing mode",
    lastMessage: "Haha yeah, the lecture was so long",
    time: "1h ago",
    unread: false,
  },
  {
    id: 4,
    name: "Alex Rivera",
    avatar: "/images/profile-4.jpg",
    major: "Business Administration",
    status: "Always down for coffee",
    lastMessage: "See you at the library tomorrow?",
    time: "3h ago",
    unread: false,
  },
]

export const CHAT_DATA: Record<number, { name: string; avatar: string; messages: ChatMessage[] }> = {
  1: {
    name: "Sarah Miller",
    avatar: "/images/profile-1.jpg",
    messages: [
      { id: 1, text: "Hey! I saw you're in the film program too?", sent: false, time: "4:30 PM" },
      { id: 2, text: "Yeah! I'm focusing on cinematography. What about you?", sent: true, time: "4:31 PM" },
      { id: 3, text: "That's awesome! I'm more into editing and post-production.", sent: false, time: "4:32 PM" },
      { id: 4, text: "We should collaborate on a project sometime!", sent: true, time: "4:33 PM" },
      { id: 5, text: "Hey! Are you going to the event tonight?", sent: false, time: "4:45 PM" },
    ],
  },
  2: {
    name: "James Chen",
    avatar: "/images/profile-2.jpg",
    messages: [
      { id: 1, text: "Dude, that hackathon was insane", sent: false, time: "2:10 PM" },
      { id: 2, text: "Right?! I can't believe we pulled it off", sent: true, time: "2:12 PM" },
      { id: 3, text: "That sounds great, let's do it!", sent: false, time: "2:15 PM" },
    ],
  },
  3: {
    name: "Emily Davis",
    avatar: "/images/profile-3.jpg",
    messages: [
      { id: 1, text: "Did you finish the art history essay?", sent: false, time: "11:20 AM" },
      { id: 2, text: "Almost! Just need the conclusion", sent: true, time: "11:25 AM" },
      { id: 3, text: "Haha yeah, the lecture was so long", sent: false, time: "11:30 AM" },
    ],
  },
  4: {
    name: "Alex Rivera",
    avatar: "/images/profile-4.jpg",
    messages: [
      { id: 1, text: "Want to study for midterms together?", sent: false, time: "9:00 AM" },
      { id: 2, text: "Sure! Library at 3?", sent: true, time: "9:05 AM" },
      { id: 3, text: "See you at the library tomorrow?", sent: false, time: "9:10 AM" },
    ],
  },
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: 1,
    user: { id: 1, name: "Sarah Miller", major: "Film Production", avatar: "/images/profile-1.jpg" },
    timestamp: "2h ago",
    content: "Caught the most incredible sunset over campus today. This is why I love USC.",
    image: "/images/feed-post-1.jpg",
    sparks: 42,
    connects: 8,
    discussions: 5,
    comments: [
      { id: 1, name: "James Chen", avatar: "/images/profile-2.jpg", text: "This is stunning! What camera did you use?", time: "1h ago" },
      { id: 2, name: "Emily Davis", avatar: "/images/profile-3.jpg", text: "Golden hour on campus hits different", time: "45m ago" },
    ],
  },
  {
    id: 2,
    user: { id: 2, name: "James Chen", major: "Computer Science", avatar: "/images/profile-2.jpg" },
    timestamp: "4h ago",
    content: "Study group for midterms anyone? We got snacks, good vibes, and a whiteboard full of algorithms.",
    image: "/images/feed-post-2.jpg",
    sparks: 31,
    connects: 12,
    discussions: 8,
    comments: [
      { id: 1, name: "Alex Rivera", avatar: "/images/profile-4.jpg", text: "Count me in! Which floor?", time: "3h ago" },
    ],
  },
  {
    id: 3,
    user: { id: 3, name: "Emily Davis", major: "Art History", avatar: "/images/profile-3.jpg" },
    timestamp: "6h ago",
    content: "Just finished my thesis draft on Baroque influence in modern street art. 47 pages later and I can finally breathe. Anyone else pulling all-nighters this week?",
    sparks: 28,
    connects: 5,
    discussions: 3,
    comments: [],
  },
]

export const ADMIN_STATS = [
  { label: "Total Users", value: "2,847", icon: "Users", color: "from-[#C62828] to-[#EF4444]" },
  { label: "Active Today", value: "412", icon: "Activity", color: "from-[#1565C0] to-[#42A5F5]" },
  { label: "Total Sparks", value: "8,391", icon: "Zap", color: "from-[#C62828] to-[#1565C0]" },
  { label: "Total Posts", value: "1,204", icon: "Newspaper", color: "from-[#2E7D32] to-[#66BB6A]" },
  { label: "Reports Pending", value: "14", icon: "AlertTriangle", color: "from-[#E65100] to-[#FF9800]" },
  { label: "Verified Students", value: "2,103", icon: "ShieldCheck", color: "from-[#6A1B9A] to-[#AB47BC]" },
] as const

export const ADMIN_USERS = [
  { id: 1, name: "Sarah Miller", email: "smiller@usc.edu", major: "Film Production", status: "active" as const, verified: true },
  { id: 2, name: "James Chen", email: "jchen@usc.edu", major: "Computer Science", status: "active" as const, verified: true },
  { id: 3, name: "Emily Davis", email: "edavis@usc.edu", major: "Art History", status: "suspended" as const, verified: true },
  { id: 4, name: "Alex Rivera", email: "arivera@usc.edu", major: "Business Admin", status: "active" as const, verified: false },
  { id: 5, name: "Jordan Lee", email: "jlee@usc.edu", major: "Psychology", status: "banned" as const, verified: false },
  { id: 6, name: "Taylor Kim", email: "tkim@usc.edu", major: "Engineering", status: "active" as const, verified: true },
]

export const REPORTED_POSTS = [
  { id: 1, user: "Anonymous", reason: "Inappropriate content", content: "Post contains offensive language targeting students...", reports: 5, time: "2h ago" },
  { id: 2, user: "Jordan Lee", reason: "Spam", content: "Buy followers cheap! DM for details. Best prices guaranteed...", reports: 12, time: "4h ago" },
  { id: 3, user: "Unknown", reason: "Harassment", content: "Targeted message about a specific student organization...", reports: 3, time: "6h ago" },
]

export const MAJOR_DISTRIBUTION = [
  { major: "Computer Science", count: 520, pct: 18 },
  { major: "Business Admin", count: 445, pct: 16 },
  { major: "Film Production", count: 380, pct: 13 },
  { major: "Engineering", count: 340, pct: 12 },
  { major: "Art & Design", count: 290, pct: 10 },
  { major: "Psychology", count: 260, pct: 9 },
  { major: "Other", count: 612, pct: 22 },
]

export const DEFAULT_INTERESTS = [
  "Photography",
  "Design",
  "Music",
  "Hiking",
  "Coffee",
  "Film",
  "Art",
  "Tech",
]
