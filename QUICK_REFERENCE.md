# Quick Reference - New Features

## 📁 File Structure

```
src/
├── models/
│   ├── Calendar.ts           # Calendar events model
│   ├── Achievement.ts        # Achievements & user achievements
│   ├── FAQ.ts                # FAQs & help articles
│   └── Notification.ts       # Real-time notifications
│
├── app/api/
│   ├── calendar/
│   │   ├── route.ts          # GET/POST events
│   │   └── [id]/route.ts     # GET/PUT/DELETE event
│   ├── achievements/
│   │   ├── route.ts          # GET achievements, POST new
│   │   └── unlock/route.ts   # Unlock achievement for user
│   ├── leaderboard/
│   │   └── route.ts          # Get leaderboard rankings
│   ├── faq/
│   │   ├── route.ts          # FAQ CRUD
│   │   └── [id]/
│   │       ├── route.ts      # Individual FAQ
│   │       └── feedback/route.ts  # FAQ feedback
│   ├── help/
│   │   ├── route.ts          # Help articles CRUD
│   │   └── [id]/
│   │       ├── route.ts      # Individual article
│   │       └── feedback/route.ts  # Article feedback
│   └── notifications/
│       ├── route.ts          # GET/POST notifications
│       ├── [id]/route.ts     # PUT/DELETE notification
│       └── mark-all-read/route.ts  # Mark all as read
│
├── app/
│   ├── calendar/page.tsx     # Calendar page
│   ├── leaderboard/page.tsx  # Leaderboard & achievements
│   ├── faq/page.tsx          # FAQ page
│   ├── help/page.tsx         # Help center page
│
├── components/
│   ├── CalendarWidget.tsx       # Calendar component
│   ├── Leaderboard.tsx          # Leaderboard component
│   ├── AchievementBadges.tsx    # Achievements component
│   ├── FAQPanel.tsx             # FAQ component
│   ├── HelpCenter.tsx           # Help center component
│   ├── NotificationPanel.tsx    # Polling notifications
│   └── RealtimeNotification.tsx # WebSocket notifications
│
├── lib/
│   ├── websocket.ts            # WebSocket server
│   └── notificationService.ts  # Notification helpers
│
└── hooks/
    └── useWebSocket.ts         # WebSocket React hook
```

## 🚀 Quick Start

### 1. Calendar
```tsx
import CalendarWidget from '@/components/CalendarWidget';

<CalendarWidget userId={userId} compact={false} />
```

### 2. Leaderboard & Achievements
```tsx
import Leaderboard from '@/components/Leaderboard';
import AchievementBadges from '@/components/AchievementBadges';

<Leaderboard period="week" limit={10} />
<AchievementBadges userId={userId} showUnlocked={true} />
```

### 3. FAQ & Help
```tsx
import FAQPanel from '@/components/FAQPanel';
import HelpCenter from '@/components/HelpCenter';

<FAQPanel category="general" />
<HelpCenter />
```

### 4. Real-time Notifications
```tsx
import RealtimeNotification from '@/components/RealtimeNotification';

<RealtimeNotification userId={userId} />
```

## 📊 Data Models

### Calendar Event
```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  startDate: Date,
  endDate: Date,
  eventType: 'assignment' | 'liveClass' | 'deadline' | 'exam' | 'custom',
  course?: ObjectId,
  createdBy: ObjectId,
  attendees: ObjectId[],
  status: 'scheduled' | 'completed' | 'cancelled',
  color?: string,
  isRecurring: boolean,
  recurrencePattern?: 'daily' | 'weekly' | 'monthly'
}
```

### Achievement
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  icon: string,
  badge: string,
  criteria: {
    type: 'coursesCompleted' | 'assignmentSubmissions' | 'perfectScore' | 'streak' | 'engagement',
    threshold: number
  },
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary',
  points: number,
  isActive: boolean
}
```

### FAQ
```typescript
{
  _id: ObjectId,
  category: 'general' | 'courses' | 'payments' | 'technical' | 'account',
  question: string,
  answer: string,
  views: number,
  helpful: number,
  notHelpful: number,
  tags: string[],
  isPublished: boolean
}
```

### Notification
```typescript
{
  _id: ObjectId,
  recipientId: ObjectId,
  senderId?: ObjectId,
  title: string,
  message: string,
  type: 'assignment' | 'message' | 'achievement' | 'course' | 'system' | 'payment',
  isRead: boolean,
  readAt?: Date,
  createdAt: Date,
  expiresAt: Date (30 days)
}
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar` | Get events |
| POST | `/api/calendar` | Create event |
| PUT | `/api/calendar/[id]` | Update event |
| DELETE | `/api/calendar/[id]` | Delete event |
| GET | `/api/achievements` | Get achievements |
| POST | `/api/achievements/unlock` | Unlock achievement |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/faq` | Get FAQs |
| POST | `/api/faq/[id]/feedback` | FAQ feedback |
| GET | `/api/help` | Get articles |
| POST | `/api/help/[id]/feedback` | Article feedback |
| GET | `/api/notifications` | Get notifications |
| POST | `/api/notifications` | Create notification |
| PUT | `/api/notifications/[id]` | Mark as read |
| DELETE | `/api/notifications/[id]` | Delete notification |
| POST | `/api/notifications/mark-all-read` | Mark all as read |

## 🎯 WebSocket Events

```typescript
// Client -> Server
{
  type: 'subscribe',      // Subscribe to notifications
  userId: string
}

{
  type: 'unsubscribe'     // Unsubscribe
}

{
  type: 'ping'            // Check connection
}

// Server -> Client
{
  type: 'connected'       // Connection established
}

{
  type: 'subscribed',     // Subscription confirmed
  userId: string
}

{
  type: 'notification',   // New notification
  data: Notification
}

{
  type: 'pong'            // Ping response
}

{
  type: 'error',          // Error message
  message: string
}
```

## 📝 Notification Service Examples

```typescript
import { 
  createNotification,
  notifyAchievementUnlocked,
  notifyAssignmentCreated,
  notifyPaymentSuccessful,
  notifyLiveClassStarting
} from '@/lib/notificationService';

// Create custom notification
await createNotification({
  recipientId: userId,
  title: 'Custom Title',
  message: 'Custom message',
  type: 'system'
});

// Achievement unlocked
await notifyAchievementUnlocked(userId, 'Top Performer', 50);

// Assignment created
await notifyAssignmentCreated(teacherId, [studentId1, studentId2], 'Math Assignment', courseId);

// Payment successful
await notifyPaymentSuccessful(userId, 99.99, 'Advanced JavaScript');

// Live class starting
await notifyLiveClassStarting([studentId1, studentId2], 'Live Q&A Session', 'https://meet.google.com/...');
```

## 🎨 Component Props

### CalendarWidget
```typescript
<CalendarWidget 
  userId="user-123"           // Optional: filter events for user
  compact={false}             // Show up to 10 events (true) or all
/>
```

### Leaderboard
```typescript
<Leaderboard 
  period="all-time"           // 'week' | 'month' | 'all-time'
  limit={10}                  // Number of users to show
/>
```

### AchievementBadges
```typescript
<AchievementBadges 
  userId="user-123"           // Optional: show user's achievements
  limit={9}                   // Number of achievements to show
  showUnlocked={true}         // Show only unlocked achievements
/>
```

### FAQPanel
```typescript
<FAQPanel 
  category="general"          // Optional: filter by category
/>
```

### HelpCenter
```typescript
<HelpCenter 
  selectedArticle="id-123"    // Optional: pre-select article
  onSelectArticle={(id) => {}} // Optional: callback on article select
/>
```

### RealtimeNotification
```typescript
<RealtimeNotification 
  userId="user-123"           // Required: user ID
  onClose={() => {}}          // Optional: close callback
/>
```

## ✅ Status

All 4 features are **100% implemented** and **production-ready**:
- ✅ Calendar Integration
- ✅ Leaderboard & Achievement Badges
- ✅ Help Center & FAQs
- ✅ Real-time Notifications (WebSocket)

---

**Last Updated:** July 2026
