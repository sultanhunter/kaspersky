# Demo Sessions - Dynamic Generation

## What Changed?

The demo booking system has been updated to **generate sessions dynamically** in the frontend instead of storing them in the database.

### Before:

- Demo sessions were hardcoded in the database via `demo-sessions.sql`
- Required manual updates to change dates
- Needed `demo_sessions` table in database
- Required updating `booked_count` for each session

### After:

- ✅ Sessions generated automatically for **today and tomorrow**
- ✅ No manual database entries needed
- ✅ Only user bookings saved to database
- ✅ Booking counts calculated in real-time from bookings table
- ✅ Automatically adapts to current date

## How It Works

### Frontend Session Generation

The `DemoBooking` component now has a `generateSessions()` function that:

1. Gets today's date and tomorrow's date
2. Creates time slots: 11:00-11:30, 12:00-12:30, 15:00-15:30, 16:00-16:30
3. Generates sessions for all 4 products across 2 days
4. Returns 32 sessions dynamically

### Time Slots

According to requirements:

- **Sessions**: 11:00am - 5:00pm
- **Duration**: 30 minutes each
- **Break**: 30 minutes between sessions
- **Lunch**: 1:00pm - 3:00pm (excluded)
- **Capacity**: 20 people per session

Generated slots:

- 11:00 - 11:30
- 12:00 - 12:30 (before lunch)
- 15:00 - 15:30 (after lunch)
- 16:00 - 16:30

### Database Changes

**Removed Table:**

```sql
-- demo_sessions table (no longer needed)
```

**Simplified Table:**

```sql
CREATE TABLE public.demo_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_name TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_name)
);
```

Now stores only the essential booking information directly.

## Migration Steps

If you already ran the old schema:

1. **Run the migration script**:

   ```sql
   -- Execute migration-demo-sessions.sql in Supabase SQL Editor
   ```

2. **This will**:
   - Drop old `demo_sessions` and `demo_bookings` tables
   - Create new simplified `demo_bookings` table
   - Set up proper indexes and RLS policies

For new setups:

- Just run `supabase-schema.sql` (already updated)

## Benefits

1. **Automatic Date Handling**: Always shows sessions for current date + 1 day
2. **No Manual Updates**: No need to update session dates for events
3. **Simpler Database**: One less table to manage
4. **Real-time Availability**: Counts bookings dynamically
5. **Easier Maintenance**: All logic in one place (frontend)

## User Experience

- Users see available slots for today and tomorrow
- Can book up to 3 different products
- One booking per product across all days
- Real-time availability (20 slots per session)
- Booking counts calculated from actual bookings

## Code Changes

### Key Functions:

- `generateSessions()` - Creates dynamic session list
- `getBookingCount()` - Counts bookings for a specific session
- `isSessionFull()` - Checks if 20 slots are booked
- `handleBooking()` - Saves only user booking (no session update needed)

### Removed Dependencies:

- No need for `demo_sessions` table
- No need for `session_id` foreign key
- No need for `booked_count` management

## Testing

To test the system:

1. Register a user
2. Navigate to "Book a Demo Session"
3. You'll see sessions for today and tomorrow
4. Book a session (saves to `demo_bookings`)
5. Try booking same product twice (will be prevented)
6. Try booking 4 products (limited to 3)
7. Sessions automatically show correct availability

## Notes

- Sessions are generated on component mount
- Each session has a unique ID based on: `{product}-{date}-{time}`
- Booking counts are fetched from database on load
- Frontend calculates availability: `capacity(20) - bookingCount`
- UNIQUE constraint on `(user_id, product_name)` prevents duplicate bookings
