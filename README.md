# Plot Genie: your plots website

A website where clients can browse your plots (photos, price, size, map) and contact you on WhatsApp, by phone or on Instagram. A friendly genie flies around the pages and guides them. Only you can log in to add, edit or remove plots.

- **Public pages:** Home · Plots (search and filters) · Plot details (gallery, map, WhatsApp/Call/Share) · About you
- **Your console:** `/admin`, where you add plots with photos, mark them Sold/Reserved, feature them on the home page, and edit your profile

## 1. Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:5173.

Without Supabase keys the site runs in **demo mode**. It shows sample plots, and anything you add at `/admin` (password `genie123`) is saved only in that browser. This is good for trying it out, but clients won't see those changes.

## 2. Go live with Supabase (free)

1. Create a free account at https://supabase.com and click **New project**.
2. Go to **SQL Editor → New query**, paste everything from [supabase/schema.sql](supabase/schema.sql), and click **Run**.
3. Go to **Authentication → Users → Add user → Create new user** and enter your email and a strong password. Tick "Auto confirm".
4. Back in the **SQL Editor**, make that user the admin (use your email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up", so nobody else can create an account.
6. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.
7. Copy `.env.example` to `.env` and paste both values in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
8. Restart `npm run dev`, go to `/admin`, log in, fill in **My profile** (name, phone, WhatsApp, Instagram, photo), and add your first plot.

**Security:** anyone can *read* plots, but the database only accepts changes from accounts listed in the `admins` table, and that is only you. The anon key is safe to put in the website.

## 3. Put it on the internet (free, Vercel)

1. Push this folder to a GitHub repository.
2. Sign in at https://vercel.com, then **Add New → Project** and import the repo. It detects Vite on its own.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**. You get a link like `https://your-plots.vercel.app` to share with clients. You can attach your own domain later in Vercel settings.

## Sharing with clients

- **The whole list:** share `https://your-site/plots`, or use **Share all plots** in your console.
- **One plot:** open it and tap **Share**, which sends it on WhatsApp or copies the link.
- **Filtered lists work too:** for example `/plots?city=Hyderabad&budget=5000000` shows Hyderabad plots under ₹50 L.

## Customising

| What | Where |
|---|---|
| Genie's tips and where it hovers on each page | `src/components/Genie/genieScript.ts` |
| Genie's look | `src/components/Genie/GenieSvg.tsx` |
| Colours and fonts | `tailwind.config.js` |
| Home page text ("Why buy with me") | `src/pages/Home.tsx` |
| Budget filter options | `src/pages/Plots.tsx` |

## Project layout

```
src/
  lib/          api.ts (Supabase + demo store), format.ts (₹ Lakh/Crore, area units), contact.ts (WhatsApp/tel/maps links)
  hooks/        useData (plots + profile), useAuth (login)
  components/   Layout, PlotCard, Gallery, PlotMap, ShareButton, Genie/
  pages/        Home, Plots, PlotDetail, About, admin/*
supabase/schema.sql
```
