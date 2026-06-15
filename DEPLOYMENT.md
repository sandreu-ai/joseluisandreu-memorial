# Deployment checklist for joseluisandreu.com

The code is ready locally at:

```txt
C:\Users\TORO\joseluisandreu-memorial
```

## 1. GitHub

1. Go to GitHub > New repository.
2. Repository name: `joseluisandreu-memorial`
3. Visibility: Private is recommended while building; public is also fine.
4. Do **not** initialize with README/license/gitignore because the local project already has files.
5. After GitHub creates the empty repo, run the commands GitHub shows under “push an existing repository from the command line”, from this folder:

```bash
cd /c/Users/TORO/joseluisandreu-memorial
git remote add origin https://github.com/YOUR_USERNAME/joseluisandreu-memorial.git
git branch -M main
git push -u origin main
```

If Git asks you to sign in, complete the GitHub browser login prompt.

## 2. Supabase

1. Go to Supabase > New project.
2. Create a project, for example: `joseluisandreu-memorial`.
3. Open SQL Editor.
4. Copy/paste and run the contents of:

```txt
supabase/schema.sql
```

5. Go to Project Settings > API.
6. Copy:
   - Project URL
   - `anon public` key

These become the Vercel environment variables.

## 3. Vercel

1. Go to Vercel > Add New Project.
2. Import the GitHub repo: `joseluisandreu-memorial`.
3. Framework preset should auto-detect as Vite.
4. Add environment variables:

```txt
VITE_SUPABASE_URL=<Supabase Project URL>
VITE_SUPABASE_ANON_KEY=<Supabase anon public key>
VITE_SUPABASE_MEDIA_BUCKET=memorial-media
```

5. Deploy.

## 4. Add domain in Vercel

1. In the Vercel project, go to Settings > Domains.
2. Add:

```txt
joseluisandreu.com
www.joseluisandreu.com
```

3. Vercel will show DNS records to add in Namecheap.

## 5. Namecheap DNS

In Namecheap > Domain List > joseluisandreu.com > Advanced DNS, use the exact values Vercel shows.

Typical Vercel DNS records are:

```txt
A Record     @      76.76.21.21
CNAME Record www    cname.vercel-dns.com
```

Remove conflicting parking/redirect records if Namecheap has them.

## 6. Test after deploy

- Visit `https://joseluisandreu.com`
- Submit a test memory
- Upload one small photo
- Confirm it appears on the memory wall/gallery


## Important security note

The current Supabase policy intentionally allows public immediate posts and uploads because that was requested. After launch, add one or more protections:

- Cloudflare Turnstile/CAPTCHA
- admin delete/moderation page
- file count and size validation server-side
- spam/report button
