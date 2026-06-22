# ARCHITECTURE.md

## Wisnu Blog — Dokumentasi Arsitektur Sistem

> **Catatan:** Dokumen ini menjabarkan arsitektur yang **diusulkan (proposed)** berdasarkan tech stack dan kebutuhan fungsional yang sudah ditetapkan di `PRD-Wisnu-Blog-Lengkap.md`. Karena project belum memiliki source code, dokumen ini berfungsi sebagai blueprint teknis sebelum development dimulai — bukan hasil analisis dari kode yang sudah ada. Sesuaikan dengan keputusan tim saat implementasi dimulai.

---

## Daftar Isi

1. Overview
2. Prinsip & Keputusan Arsitektur Kunci
3. High-Level Architecture
4. Tech Stack
5. Struktur Folder Project
6. Application Layers
7. Alur Request (Request Flow)
8. Strategi Rendering (SSG/SSR/CSR)
9. Autentikasi & Otorisasi
10. Desain API
11. Arsitektur Database
12. Media & File Storage
13. Caching Strategy
14. Arsitektur SEO
15. Arsitektur Deployment
16. Keamanan
17. Observability (Monitoring & Logging)
18. Skalabilitas & Roadmap Teknis
19. Asumsi Arsitektur

---

## 1. Overview

Wisnu Blog dibangun sebagai aplikasi **monolithic full-stack** menggunakan Next.js (App Router), dengan API Routes sebagai backend dan PostgreSQL sebagai database utama. Pendekatan monolith dipilih karena skala MVP masih kecil (single-author, traffic moderate) — arsitektur ini cukup sederhana untuk dikembangkan cepat, namun tetap terstruktur agar mudah dipecah jadi service terpisah (mis. media service, search service) jika traffic/kompleksitas bertambah di fase lanjut.

Tiga area fungsional utama:

- **Public Site** — halaman yang diakses pembaca (homepage, artikel, kategori, search).
- **Admin Dashboard** — area terproteksi untuk Wisnu mengelola konten.
- **API Layer** — menjembatani frontend dengan database, juga dikonsumsi oleh proses internal (sitemap generator, newsletter, dll).

---

## 2. Prinsip & Keputusan Arsitektur Kunci

| Keputusan                                                  | Alasan                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Next.js App Router (bukan Pages Router)                    | Mendukung React Server Components, layout bersarang, dan streaming — cocok untuk halaman publik yang SEO-sensitive |
| PostgreSQL + Prisma                                        | Relasi data (post–category–tag–comment) cukup kompleks untuk relational DB; Prisma memberi type-safety end-to-end  |
| Rendering campuran (SSG/ISR untuk publik, CSR untuk admin) | Halaman publik butuh SEO & performa; dashboard admin tidak butuh SEO dan lebih interaktif                          |
| Monolith dahulu, modular secara internal                   | Menghindari over-engineering di MVP, tapi folder/layer dipisah supaya mudah di-refactor jadi services nanti        |
| NextAuth (Credentials Provider) untuk login admin          | Terintegrasi native dengan Next.js, cukup untuk kebutuhan single/few-admin tanpa OAuth kompleks                    |

---

## 3. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      Pengunjung /     │
                         │     Admin (Browser)   │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │  Cloudflare (DNS,CDN) │
                         └──────────┬───────────┘
                                    ▼
                         ┌──────────────────────┐
                         │   Next.js App (Vercel)│
                         │ ┌──────────────────┐  │
                         │ │  Public Pages    │  │  SSG/ISR
                         │ ├──────────────────┤  │
                         │ │  Admin Dashboard │  │  CSR (protected)
                         │ ├──────────────────┤  │
                         │ │  API Routes      │  │  Serverless Functions
                         │ └──────────────────┘  │
                         └──────────┬───────────┘
                                    │ Prisma Client
                                    ▼
                         ┌──────────────────────┐
                         │  PostgreSQL (Railway/ │
                         │      Supabase)        │
                         └──────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Object Storage       │
                         │  (Vercel Blob /       │
                         │   Cloudinary)         │
                         └──────────────────────┘
```

---

## 4. Tech Stack

| Layer              | Teknologi                                     | Catatan                             |
| ------------------ | --------------------------------------------- | ----------------------------------- |
| Frontend           | Next.js (App Router) + React + Tailwind CSS   | Sesuai PRD §17                      |
| Backend            | Next.js API Routes                            | Tidak perlu service terpisah di MVP |
| Database           | PostgreSQL                                    | Hosting: Railway / Supabase         |
| ORM                | Prisma                                        | Migration & type-safety             |
| Autentikasi        | NextAuth (Credentials Provider + JWT session) | Untuk login admin                   |
| Media Storage      | Vercel Blob / Cloudinary (disarankan)         | Lihat §12                           |
| Deployment         | Vercel (app) + Cloudflare (DNS/CDN)           | Sesuai PRD §17                      |
| Email (Newsletter) | Resend / Mailchimp API (disarankan)           | Lihat §19                           |

---

## 5. Struktur Folder Project

```text
wisnu-blog/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── uploads/                  # fallback jika storage lokal (lihat §12)
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                  # Homepage
│   │   │   ├── [category]/[slug]/page.tsx  # Detail artikel
│   │   │   ├── kategori/page.tsx
│   │   │   ├── tag/[slug]/page.tsx
│   │   │   ├── arsip/page.tsx
│   │   │   ├── tentang/page.tsx
│   │   │   ├── kontak/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (admin)/
│   │   │   └── dashboard/
│   │   │       ├── artikel/
│   │   │       ├── kategori/
│   │   │       ├── tag/
│   │   │       ├── komentar/
│   │   │       ├── media/
│   │   │       ├── subscriber/
│   │   │       └── statistik/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── posts/route.ts
│   │   │   ├── posts/[slug]/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── tags/route.ts
│   │   │   ├── comments/route.ts
│   │   │   ├── subscribers/route.ts
│   │   │   ├── media/route.ts
│   │   │   ├── search/route.ts
│   │   │   └── sitemap.xml/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/        # Header, Footer, Navbar, ThemeToggle
│   │   ├── article/       # ArticleCard, ArticleContent, ShareButtons
│   │   ├── admin/         # Sidebar, DataTable, Editor
│   │   └── ui/            # Button, Input, Modal (shared)
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── auth.ts        # NextAuth config
│   │   ├── seo.ts         # Helper meta tag & JSON-LD
│   │   └── utils.ts
│   ├── hooks/
│   ├── middleware.ts      # Proteksi route /dashboard/*
│   └── types/
├── .env
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 6. Application Layers

```text
┌─────────────────────────────┐
│   Presentation Layer        │  React Components, Pages, Layouts
├─────────────────────────────┤
│   Application/API Layer     │  API Routes, Server Actions, Validasi input
├─────────────────────────────┤
│   Data Access Layer         │  Prisma Client, Query builder
├─────────────────────────────┤
│   Data Layer                │  PostgreSQL, Object Storage
└─────────────────────────────┘
```

**Aturan dependensi:** Presentation Layer tidak mengakses Prisma secara langsung dari client component — semua akses data lewat Server Component, Server Action, atau API Route. Ini mencegah credential/database logic terekspos ke browser.

---

## 7. Alur Request (Request Flow)

### 7.1 Membaca Artikel (Public)

```text
Browser
  │ GET /[category]/[slug]
  ▼
Next.js Server Component
  │ fetch via Prisma (cached/ISR)
  ▼
PostgreSQL (posts JOIN categories, tags, author)
  │
  ▼
Increment views (async, tidak blocking render)
  │
  ▼
Render HTML (artikel + related articles) → Browser
```

### 7.2 Pencarian Artikel

```text
Browser
  │ GET /api/search?q=java
  ▼
API Route → Prisma full-text query (judul, content, tag)
  │
  ▼
Response JSON → Render hasil di client
```

### 7.3 Submit Komentar

```text
Browser (form)
  │ POST /api/comments  { post_id, name, email, content }
  ▼
API Route → Validasi + sanitasi input (XSS) → Insert (status: pending)
  │
  ▼
Response sukses → Tampilkan pesan "Komentar menunggu moderasi"
```

---

## 8. Strategi Rendering

| Halaman         | Strategi                                           | Alasan                                                        |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Homepage        | ISR (revalidate ±5 menit)                          | Konten berubah saat ada post baru, tapi tidak perlu real-time |
| Detail Artikel  | SSG + ISR (revalidate on-demand saat publish/edit) | Maksimalkan SEO & performa load                               |
| Search          | SSR/CSR hybrid                                     | Hasil dinamis berdasarkan query user                          |
| Dashboard Admin | CSR (Client Component, protected)                  | Interaktif, tidak perlu SEO                                   |
| Sitemap.xml     | Generated on-demand / cached                       | Lihat §14                                                     |

**On-demand revalidation:** saat admin publish/edit/hapus artikel, API Route memanggil `revalidatePath()` agar halaman terkait langsung ter-update tanpa menunggu interval ISR.

---

## 9. Autentikasi & Otorisasi

```text
Admin Browser
  │ POST /api/auth/callback/credentials (email, password)
  ▼
NextAuth Credentials Provider
  │ Bandingkan password dengan hash di tabel users (bcrypt)
  ▼
Valid → Buat session (JWT) → Set cookie httpOnly, secure
  │
  ▼
middleware.ts memverifikasi session pada setiap request ke /dashboard/*
  │
  ▼
Jika tidak valid → redirect ke /login
```

- **Role:** `admin` dan `author` dibedakan lewat kolom `role` pada tabel `users` (mendukung multi-author di Phase 3 tanpa ubah skema).
- **Public endpoints** (GET artikel, search, komentar submit) tidak memerlukan autentikasi.
- **Protected endpoints** (CRUD artikel/kategori/tag, moderasi komentar, media upload) memerlukan session admin valid, divalidasi di setiap API Route — bukan hanya di middleware (defense in depth).

---

## 10. Desain API

| Method | Endpoint             | Auth   | Deskripsi                                      |
| ------ | -------------------- | ------ | ---------------------------------------------- |
| GET    | `/api/posts`         | Publik | List artikel (pagination, filter kategori/tag) |
| GET    | `/api/posts/[slug]`  | Publik | Detail artikel                                 |
| POST   | `/api/posts`         | Admin  | Buat artikel                                   |
| PUT    | `/api/posts/[id]`    | Admin  | Edit artikel                                   |
| DELETE | `/api/posts/[id]`    | Admin  | Hapus artikel                                  |
| GET    | `/api/categories`    | Publik | List kategori                                  |
| POST   | `/api/categories`    | Admin  | Buat kategori                                  |
| GET    | `/api/search?q=`     | Publik | Full-text search                               |
| POST   | `/api/comments`      | Publik | Submit komentar (status pending)               |
| PATCH  | `/api/comments/[id]` | Admin  | Approve/reject komentar                        |
| POST   | `/api/subscribers`   | Publik | Daftar newsletter                              |
| POST   | `/api/media`         | Admin  | Upload gambar                                  |
| GET    | `/api/sitemap.xml`   | Publik | Generate sitemap                               |

> Semua endpoint mengikuti format respons konsisten: `{ success, data, error }` agar mudah ditangani di frontend.

---

## 11. Arsitektur Database

Skema lengkap (tipe data, constraint, relasi) sudah didefinisikan di `PRD-Wisnu-Blog-Lengkap.md` §14 — dokumen ini tidak mengulang skema, tetapi merujuknya sebagai single source of truth untuk `prisma/schema.prisma`.

Ringkasan relasi:

```text
users (1) ──── (N) posts
posts (1) ──── (N) comments
posts (N) ──── (N) tags        via post_tags
categories (1) ─ (N) posts
users (1) ──── (N) media
comments (1) ── (N) comments   self-relation (reply)
```

---

## 12. Media & File Storage

Dua opsi, dipilih berdasarkan skala:

| Opsi                                                | Kapan dipakai                     | Trade-off                                                                                                           |
| --------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Local (`public/uploads`)**                        | MVP awal, traffic kecil           | Sederhana, tapi tidak scalable di serverless (Vercel filesystem ephemeral) — **berisiko file hilang setiap deploy** |
| **Cloud Object Storage (Vercel Blob / Cloudinary)** | Direkomendasikan untuk production | Persistent, mendukung image transformation (resize/webp otomatis), sedikit biaya tambahan                           |

**Rekomendasi:** langsung gunakan Vercel Blob atau Cloudinary sejak awal, karena deployment di Vercel bersifat serverless — filesystem lokal tidak persistent antar deployment.

---

## 13. Caching Strategy

| Layer      | Mekanisme                                                                           |
| ---------- | ----------------------------------------------------------------------------------- |
| CDN/Edge   | Cloudflare cache untuk asset statis (gambar, JS, CSS)                               |
| Page-level | ISR (Next.js) untuk homepage & artikel                                              |
| Data-level | Cache hasil query "artikel populer" (mis. 15 menit) untuk kurangi load DB           |
| Database   | Index pada kolom `slug`, `status`, `published_at`, dan full-text index untuk search |

Fase lanjut (jika traffic besar): pertimbangkan Redis untuk cache ranking artikel populer & rate limiting terdistribusi.

---

## 14. Arsitektur SEO

- **Rendering:** SSG/ISR memastikan crawler menerima HTML penuh (bukan kosong seperti pure CSR).
- **Sitemap:** endpoint `/api/sitemap.xml` generate ulang otomatis saat artikel baru dipublikasikan (trigger via revalidation), bukan static file manual.
- **Meta tag & JSON-LD:** di-generate per halaman via helper `lib/seo.ts`, memanfaatkan Next.js `generateMetadata()`.
- **robots.txt:** static file di `public/robots.txt`, mengarahkan ke sitemap.

---

## 15. Arsitektur Deployment

```text
GitHub Repo
   │  git push (branch: main)
   ▼
Vercel CI/CD (auto build & deploy)
   │
   ▼
Environment:
   ├── Production  (main branch)  → domain utama
   └── Preview     (PR/branch)    → URL preview otomatis
   │
   ▼
Database (Railway/Supabase) — environment terpisah untuk staging vs production
```

- **Environment variables** (`DATABASE_URL`, `NEXTAUTH_SECRET`, storage API key) dikelola lewat Vercel Project Settings, tidak pernah commit ke repo.
- **Migration:** `prisma migrate deploy` dijalankan sebagai build step sebelum aplikasi live.

---

## 16. Keamanan

| Area          | Implementasi                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Password      | Hash dengan bcrypt/argon2, tidak pernah disimpan plaintext                                          |
| CSRF          | NextAuth menangani CSRF token built-in pada form auth                                               |
| XSS           | Sanitasi konten artikel (rich text) & komentar sebelum render (mis. dengan DOMPurify)               |
| Rate limiting | Diberlakukan pada `/api/auth/*` dan `/api/comments` (mis. via middleware + in-memory/Redis counter) |
| File upload   | Validasi tipe MIME & ukuran file, scan ekstensi sebelum simpan ke storage                           |
| Session       | JWT httpOnly + secure cookie, expiry wajar (mis. 7 hari)                                            |

---

## 17. Observability (Monitoring & Logging)

- **Error tracking:** Sentry (disarankan) untuk capture error di frontend & API routes.
- **Analytics trafik:** Google Analytics / Plausible / Umami (sesuai PRD §16).
- **Uptime monitoring:** UptimeRobot/BetterStack untuk cek availability endpoint utama.
- **Logging API:** log request penting (login attempt, publish artikel) untuk audit trail dasar.

---

## 18. Skalabilitas & Roadmap Teknis

Selaras dengan Roadmap di PRD §18:

| Fase                                      | Perubahan Arsitektur                                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP                                       | Monolith Next.js + PostgreSQL, storage cloud sederhana                                                                                                                     |
| Phase 2 (Newsletter, Dark Mode, Bookmark) | Tambah integrasi email API (Resend/Mailchimp); dark mode cukup di client-side (CSS variables), tidak perlu perubahan backend signifikan                                    |
| Phase 3 (AI recommendation, multi-author) | Pertimbangkan: vector search/embedding untuk rekomendasi artikel, pemisahan role & permission lebih granular, kemungkinan cache layer (Redis) jika traffic naik signifikan |

---

## 19. Asumsi Arsitektur

Beberapa keputusan teknis di dokumen ini diambil sebagai asumsi default karena belum ditentukan eksplisit di PRD — perlu dikonfirmasi tim sebelum implementasi:

- Hosting database: **Railway atau Supabase** dipilih sebagai contoh; PRD hanya menyebut "PostgreSQL" tanpa provider spesifik.
- Media storage: diasumsikan **cloud object storage** (bukan filesystem lokal) karena target deployment Vercel bersifat serverless.
- Autentikasi: diasumsikan **NextAuth Credentials Provider**, bukan custom JWT manual — PRD menyebut "JWT / NextAuth" sebagai alternatif, dokumen ini memilih NextAuth untuk kecepatan development.
- Provider email newsletter (Resend/Mailchimp) belum ditentukan — masih opsi terbuka di PRD §21.
