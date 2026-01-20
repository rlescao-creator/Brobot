# Brobot - Setup Guide

## 🚀 Quick Start

Your Brobot app is **ready to go**! Here's what's been set up:

### ✅ What's Complete

1. **Next.js App** with dark theme and modern UI
2. **User Authentication** (login/signup with bcrypt)
3. **Chat Interface** with:
   - Message history
   - Stop generation button
   - Image upload for physique ratings
   - Real-time streaming responses
4. **Proposita System** (goal tracking)
5. **Gemini AI Integration** with your API key
6. **Complete System Prompt** (Brobot personality)
7. **Database** (SQLite with Prisma)

---

## 🏃 Running the App

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 2. First Time Setup

1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Create an account with email/password
4. Start chatting with Brobot!

---

## 📸 Testing Image Upload (Physique Rating)

1. Click the **image icon** (📷) in the chat input
2. Select a physique photo (jpg/png)
3. Type a message or leave it blank
4. Send to get Brobot's honest rating

**Brobot will:**
- Ask for your goal/sport
- Provide body fat estimate
- Rate your physique (1-10)
- Offer a meal plan
- Suggest whether to cut/bulk/maintain

---

## 🎯 Testing Proposita (Goal Tracking)

1. Ask Brobot for advice: *"I want to get in better shape"*
2. Brobot will offer actionable steps
3. When asked, Brobot will save goals to Proposita
4. Click the **"Proposita"** tab to see your goals
5. Check them off as you complete them

**Example conversation:**

```
You: "I can't stay consistent with the gym"

Brobot: "That's your discipline talking, not motivation.

Set a specific schedule. 3 days minimum this week. Want me to add that to Proposita?"

You: "yeah"

Brobot: "Added to Proposita:
- Hit gym 3x this week
- Pick 3 specific days and times now

You got this."
```

---

## 🔧 Tech Stack

- **Framework:** Next.js 16 (React 19)
- **AI:** Gemini 1.5 Flash (Google)
- **Database:** SQLite with Prisma ORM
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **Auth:** bcryptjs

---

## 📁 Project Structure

```
Brobot/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main chat UI
│   │   ├── actions.ts        # Server actions (auth, goals)
│   │   ├── api/chat/         # Gemini API route
│   │   └── layout.tsx
│   ├── components/
│   │   └── PropositaView.tsx # Goals UI
│   └── lib/
│       └── db.ts             # Prisma client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db               # SQLite database
├── prompts/
│   └── core_identity.md      # Brobot system prompt
└── package.json
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   # hashed with bcrypt
  createdAt DateTime @default(now())
  goals     Goal[]
}

model Goal {
  id        String   @id @default(uuid())
  text      String
  deadline  String?
  completed Boolean  @default(false)
  userId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

### If you need to reset the database:

```bash
npx prisma migrate reset
npx prisma generate
```

---

## 🤖 Brobot Personality

Brobot is configured with the **complete system prompt** you provided:

- **Max 3-4 lines** per response (except meal plans, physique ratings, Proposita)
- **No formatting** (plain text, conversational)
- **Straight-talking** but respectful
- **Actionable advice** over fluff
- **Proposita integration** for goal tracking
- **Physique rating system** with bodybuilding standards
- **Nutrition planning** with macro calculations
- **Communication decoder** for relationship advice

---

## 🔑 API Key (Already Configured)

Your Gemini API key is already set in:
```
src/app/api/chat/route.ts
```

**For security in production:**
1. Create a `.env.local` file:
   ```
   GOOGLE_API_KEY=AIzaSyDo8KM1Uxb_d_FXu0wpdUZwhozGNSbqgB8
   ```
2. Update `route.ts` to use:
   ```typescript
   apiKey: process.env.GOOGLE_API_KEY
   ```

---

## 🎨 UI Features

### Chat View
- User messages: right-aligned, white background
- Brobot messages: left-aligned, dark background
- Image preview before sending
- Remove image button (X)
- Stop generation button (red square)
- Auto-scroll to latest message

### Proposita View
- Checkbox to mark goals complete
- Strikethrough for completed goals
- Delete button (appears on hover)
- Deadline display (if set)
- Auto-refresh when switching tabs

### Navigation
- Toggle between "Chat" and "Proposita"
- Logout button
- Notification when goals are saved

---

## 🚀 Deployment (When Ready)

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable:
   - `GOOGLE_API_KEY`: Your Gemini API key
5. Deploy!

**Note:** You'll need to switch from SQLite to PostgreSQL for production:
- Add PostgreSQL database (Vercel/Supabase/Neon)
- Update `prisma/schema.prisma` datasource to `postgresql`
- Run migrations

### Option 2: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Import repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## 🐛 Troubleshooting

### "Error connecting to Brobot"
- Check that dev server is running (`npm run dev`)
- Check browser console for errors
- Verify Gemini API key is valid

### Images not uploading
- Only jpg/png supported
- Max file size handled by browser
- Check browser console for errors

### Goals not saving
- Make sure you're logged in
- Check that Brobot's response includes "Added to Proposita:"
- Refresh the Proposita view

### Database errors
```bash
npx prisma generate
npx prisma migrate deploy
```

---

## 📝 Example Conversations

### 1. Motivation Help
```
You: "I'm feeling unmotivated"
Brobot: "Stop waiting for motivation - it's not coming.

Just do one thing today. Action creates motivation, not the other way around."
```

### 2. Breakup Advice
```
You: "My girl left me"
Brobot: "Damn, that's rough. Sorry bro.

Breakups suck but sitting around won't fix it. Hit the gym, delete her socials, keep moving forward.

Want me to add these to Proposita to keep you on track?"
```

### 3. Physique Rating
```
You: [uploads photo]
Brobot: "Alright let me check this out.

What's your goal? Bodybuilding, powerlifting, team sport (what position?), combat sport, or just general fitness?"

You: "bodybuilding"
Brobot: "You're at 18% body fat (Fat AF by bodybuilding standards).

For bodybuilding: 4/10. Too much fat covering your muscle. Chest and arms are decent but hidden.

Cut to 12-15% body fat. Track calories, aim for 0.9lbs per week loss. Want a meal plan?"
```

---

## 🎯 Next Steps

1. **Test the chat** - Try various questions
2. **Test image upload** - Upload a physique photo
3. **Test Proposita** - Add and complete goals
4. **Customize styling** (if desired) - Edit `src/app/globals.css`
5. **Deploy** when ready!

---

## 💡 Tips

- Brobot is designed to be **short and direct** - responses are 3-4 lines max
- Use Proposita for **accountability** - it helps track actionable goals
- **Image uploads** work with any jpg/png physique photo
- The system prompt enforces Brobot's personality - edit `prompts/core_identity.md` to adjust

---

## ❓ Need Help?

Check the following files:
- `src/app/page.tsx` - Main UI
- `src/app/api/chat/route.ts` - Gemini integration
- `prompts/core_identity.md` - Brobot personality
- `src/app/actions.ts` - Database operations

---

**You're all set! Run `npm run dev` and open http://localhost:3000 to start using Brobot.** 💪



