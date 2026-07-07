# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 WebSocket Connection Issues

**Problem**: WebSocket connection fails or keeps reconnecting
```
TypeError: Cannot read property 'readyState' of undefined
```

**Solution**:
1. Ensure WebSocket server is initialized in your HTTP server setup
2. Check that `/api/ws` endpoint is properly configured
3. For production, use secure WebSocket (`wss://` instead of `ws://`)
4. Add CORS headers if WebSocket is on different domain:
```typescript
const wss = new WebSocketServer({ 
  server, 
  path: '/api/ws',
  perMessageDeflate: false 
});
```

---

### 🔴 Notifications Not Appearing

**Problem**: Notifications created but not showing in UI

**Solution**:
1. **Check MongoDB Connection**: Ensure MONGODB_URI is set correctly
2. **Verify Notification TTL**: Check that expiresAt date is in the future
3. **Check Recipient ID**: Ensure recipientId matches current userId
4. **WebSocket Subscription**: Verify client is subscribed to WebSocket
```typescript
// In browser console:
// Check if connection exists
// ws should show "subscribed" message
```

---

### 🔴 Calendar Events Not Showing

**Problem**: Calendar component renders but no events visible

**Solution**:
1. **Check Date Range**: Ensure event dates are within the current month
2. **User Filter**: Remove userId filter to see all events
3. **Event Status**: Verify events have status 'scheduled' (not 'cancelled')
4. **Database Indexes**: Create indexes for better performance
```javascript
db.calendarevent.createIndex({ startDate: 1, endDate: 1 });
```

---

### 🔴 Leaderboard Empty

**Problem**: Leaderboard shows "No data" or wrong user order

**Solution**:
1. **Check User Achievements**: Ensure UserAchievement records exist
2. **Verify Points**: Check that achievements have point values > 0
3. **Date Range**: For time-based leaderboard, check if records are old
```bash
# Get records created in last 30 days
db.userachievement.find({ createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } })
```

---

### 🔴 FAQ Search Not Working

**Problem**: Search returns no results even when questions exist

**Solution**:
1. **Check isPublished**: Ensure FAQ records have isPublished: true
2. **Case Sensitivity**: Search is case-insensitive (should work fine)
3. **Special Characters**: Some special characters may need escaping
4. **Index Creation**:
```javascript
db.faq.createIndex({ question: "text", answer: "text" });
```

---

### 🔴 Help Center Articles Not Loading

**Problem**: 404 error or blank page when accessing help center

**Solution**:
1. **Check Slug Format**: Ensure slugs are URL-friendly (lowercase, hyphens)
2. **Verify isPublished**: Articles must have isPublished: true
3. **Check Permissions**: If auth required, ensure user is authenticated
4. **Clear Cache**: Browser cache may have old data

---

### 🔴 Achievement Unlock Not Triggering

**Problem**: Achievement created but not unlocking for users

**Solution**:
1. **Manual Testing**: Use API endpoint to unlock
```bash
curl -X POST http://localhost:3000/api/achievements/unlock \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "achievementId": "ACH_ID"}'
```

2. **Check Duplicate Prevention**: Ensure no duplicate unlock attempts
3. **Verify Criteria**: If using auto-unlock, check criteria logic
4. **User Subscription**: Ensure user subscribed to achievement system

---

## Debugging Commands

### MongoDB Queries

```bash
# Check calendar events
db.calendarevent.find({}).limit(5)

# Check achievements
db.achievement.find({ isActive: true })

# Check user achievements
db.userachievement.find({}).limit(5)

# Check notifications count
db.notification.countDocuments({ recipientId: ObjectId("USER_ID") })

# Check unread notifications
db.notification.countDocuments({ recipientId: ObjectId("USER_ID"), isRead: false })

# Find FAQs by category
db.faq.find({ category: "general" })

# Check help article views
db.helparticle.aggregate([
  { $group: { _id: "$category", totalViews: { $sum: "$views" } } }
])
```

### Browser Console

```javascript
// Check WebSocket connection
// Open DevTools > Network > WS
// Look for /api/ws connection

// Monitor notifications
// Open DevTools > Console
// WebSocket messages will appear in Network tab

// Manually create notification
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientId: 'USER_ID',
    title: 'Test',
    message: 'Test message',
    type: 'system'
  })
})
```

### Network Issues

```bash
# Test WebSocket connectivity
wscat -c ws://localhost:3000/api/ws

# Check API endpoints
curl http://localhost:3000/api/calendar
curl http://localhost:3000/api/achievements
curl http://localhost:3000/api/leaderboard
curl http://localhost:3000/api/notifications?userId=USER_ID
```

---

## Performance Issues

### Slow Calendar Loading

**Problem**: Calendar takes too long to render

**Solution**:
1. **Add Indexes**:
```javascript
db.calendarevent.createIndex({ startDate: 1 });
db.calendarevent.createIndex({ attendees: 1 });
```

2. **Pagination**: Implement pagination for large datasets
3. **Limit Results**: Fetch only upcoming events (next 3 months)

### Slow Notifications

**Problem**: Notifications panel is slow to load

**Solution**:
1. **Limit Query**: Use `.limit(50)` on notifications
2. **Indexing**:
```javascript
db.notification.createIndex({ recipientId: 1, createdAt: -1 });
db.notification.createIndex({ recipientId: 1, isRead: 1 });
```

3. **Archive Old**: Delete notifications older than 30 days
4. **Pagination**: Lazy load notifications

---

## Memory Leaks

### WebSocket Memory Leak

**Problem**: Application memory grows over time

**Solution**:
1. **Clean Up Connections**: Ensure `onclose` properly removes connections
2. **Check `userConnections` Map**: Verify cleanup in websocket.ts
3. **Add Memory Monitoring**:
```typescript
setInterval(() => {
  const connectedUsers = getConnectedUsers();
  console.log(`Connected users: ${connectedUsers.length}`);
  console.log(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 60000);
```

---

## Database Issues

### Connection Timeout

**Problem**: "ECONNREFUSED" or "Connection timeout"

**Solution**:
1. **Check MongoDB Running**: `mongosh` or check service
2. **Verify URI**: Check MONGODB_URI environment variable
3. **Network Access**: Ensure firewall allows connection
4. **Credentials**: Verify username/password if using authentication

### Out of Memory

**Problem**: "MongoError: Exceded memory limit for $group"

**Solution**:
1. **Break Into Batches**: Process in smaller chunks
2. **Use Indexes**: Speed up queries
3. **Increase Server Limit**: MongoDB server settings
4. **Aggregate Pipeline**: Optimize aggregation queries

---

## Testing the Features

### Test Calendar
```typescript
// 1. Create event
const event = await fetch('/api/calendar', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Test Event',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000),
    eventType: 'assignment',
    createdBy: 'USER_ID'
  })
});

// 2. List events
const events = await fetch('/api/calendar?userId=USER_ID');

// 3. Verify calendar widget shows event
```

### Test Notifications
```typescript
// 1. Open WebSocket connection (automatic in RealtimeNotification)
// 2. Create notification
const notif = await fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({
    recipientId: 'USER_ID',
    title: 'Test',
    message: 'Test message',
    type: 'system'
  })
});

// 3. Check toast appears
// 4. Mark as read
await fetch('/api/notifications/[id]', { method: 'PUT' });
```

---

## Getting Help

1. **Check Logs**: Look at server console for errors
2. **Browser DevTools**: Network tab for API errors
3. **MongoDB Logs**: Check database connection logs
4. **Component Props**: Verify all required props are passed
5. **TypeScript Errors**: Run `npm run build` to check types

---

**Last Updated:** July 2026
