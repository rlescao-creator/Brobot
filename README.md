# 🔥 BROBOT - Real Talk. No BS.

**The no-nonsense AI bro for men's self-improvement.**

Built with Next.js 16, Groq (Llama 3.3 70B), Prisma, and Tailwind CSS.

---

## ✨ Features

### 💬 **Chat**
- AI-powered conversations with brutal honesty
- Straight-talking advice on fitness, relationships, goals, motivation
- Image upload for physique ratings
- Conversation history with sidebar
- Fast responses powered by Groq AI

### 🎯 **Proposita** (Goal Tracker)
- Latin for "goals" - set and track your commitments
- Timeline categories: This Week, Short-Term, Mid-Term, Long-Term
- Success rates, streaks, and weekly stats
- Visual progress tracking

### ✨ **Womanslator** (Relationship Decoder)
- Decode what women really mean
- Context-aware translations of words and actions
- Red flag detection and honest advice
- Multi-language support (EN, FR, ES, DE)
- Copy-paste responses

---

## 🚀 One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fbrobot&env=GROQ_API_KEY&envDescription=Get%20your%20Groq%20API%20key%20from%20https%3A%2F%2Fconsole.groq.com&project-name=brobot&repository-name=brobot)

### Environment Variables Required:
- `GROQ_API_KEY` - Get it free at [console.groq.com](https://console.groq.com)

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/brobot.git
cd brobot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your Groq API key to .env
GROQ_API_KEY=your_api_key_here

# Initialize database
npx prisma db push
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Groq (Llama 3.3 70B) - Blazing fast inference
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **UI:** Lucide React Icons
- **Auth:** localStorage (simple client-side)
- **Deployment:** Vercel

---

## 📁 Project Structure

```
brobot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # Chat AI endpoint
│   │   │   └── womanslator/route.ts   # Womanslator AI endpoint
│   │   ├── proposita/page.tsx         # Goals tracker page
│   │   ├── womanslator/page.tsx       # Relationship decoder page
│   │   ├── page.tsx                   # Main chat page
│   │   ├── actions.ts                 # Server actions (auth, goals, etc.)
│   │   └── globals.css                # Global styles + animations
│   ├── components/
│   │   ├── LandingPage.tsx            # Landing page with video
│   │   └── PropositaView.tsx          # Goals display component
│   └── lib/
│       └── db.ts                      # Prisma client
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Database migrations
└── public/
    ├── logo_brobot.png                # App logo
    └── brobot video.mp4               # Landing page video
```

---

## 🎨 Features Deep Dive

### Chat System
- **AI Model:** Llama 3.3 70B via Groq (sub-second responses)
- **Personality:** Straight-talking bro - honest, direct, no corporate BS
- **Max Response:** 3-4 lines (text-like brevity)
- **Tone Limits:** "bro" usage limited to once per 3-4 responses
- **Special Features:**
  - Physique rating with image upload
  - Meal plan generation
  - Workout program advice (multiple splits)
  - Automatic goal extraction to Proposita

### Proposita (Goals)
- **Timelines:**
  - This Week: ≤7 days
  - Short-Term: 1 week - 2 months
  - Mid-Term: 2 - 5 months  
  - Long-Term: 5+ months
- **Stats Tracked:**
  - Overall success rate
  - Current streak (consecutive days)
  - Weekly completion rate
- **Date Parsing:** Extracts dates from natural language

### Womanslator
- **60+ Scenarios** covering:
  - Past relationships & baggage
  - Dating apps (zero tolerance)
  - Nightlife & clubbing
  - Money & lifestyle
  - Arguments & conflict
  - Tests & manipulation
  - Mental health & boundaries
  - Red flags (immediate exit)
- **Output Format:**
  - SHE MEANS / WHAT IT MEANS (context-aware)
  - WHY (explanation)
  - SAY THIS (exact response template)
  - WHAT TO DO (actionable advice)
- **Languages:** English, French, Spanish, German

---

## 🔑 API Keys

### Groq (Required)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key
4. Add to `.env`: `GROQ_API_KEY=gsk_...`

**Free Tier Limits:**
- 14,400 requests/day
- 30 requests/minute
- More than enough for personal use + 10 friends

---

## 🎯 Deployment Guide

### Vercel (Recommended)

1. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/brobot.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo
   - Add environment variable: `GROQ_API_KEY`
   - Click "Deploy"

3. **Done!** Your app will be live at `https://brobot-xyz.vercel.app`

### Other Platforms
- **Netlify:** Similar process, add env vars in dashboard
- **Railway:** Auto-deploy from GitHub, add env vars
- **Self-hosted:** `npm run build` → `npm start`

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm -f prisma/dev.db
npx prisma db push
npx prisma generate
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Slow AI Responses
- Check Groq API key is valid
- Verify you're not hitting rate limits
- Model is `llama-3.3-70b-versatile` (fastest)

---

## 📝 License

MIT License - Do whatever you want with it, bro.

---

## 🙌 Credits

- **AI:** Groq (Llama 3.3 70B)
- **Framework:** Next.js by Vercel
- **UI:** Tailwind CSS
- **Icons:** Lucide React
- **Built by:** You, a warrior crushing life 💪

---

## 💬 Support

Issues? Questions? Ideas?
- Open an issue on GitHub
- Or just ask Brobot itself 😎

---

**Remember:** Your self-respect is non-negotiable. Walk away from disrespect. Know your worth.

🔥 **Real Talk. No BS.** 🔥
