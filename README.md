# Jose Luis Andreu Memorial Website

A public memorial site for `joseluisandreu.com` where friends and family can:

- read the tribute homepage
- share memories immediately
- upload photos and videos directly
- view a public memory wall and gallery


## Local development

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy the project URL and anon public key.
5. Add these env vars locally and in Vercel:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_MEDIA_BUCKET=memorial-media
```

Without Supabase env vars, the site runs in local preview mode and stores demo memories only in the browser.

## Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Domain: `joseluisandreu.com`

## DNS records for Vercel

Usually:

```txt
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

Confirm in Vercel after adding the domain because Vercel will show exact required DNS records.
