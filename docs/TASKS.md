# TASKS.md

## Wisnu Blog — Task Breakdown

> Dokumen ini menerjemahkan `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, dan `STYLEGUIDE.md` menjadi checklist kerja konkret, diurutkan berdasarkan Roadmap (PRD §18). Setiap task menyebut dokumen rujukan agar developer tidak perlu menebak detail teknisnya.

---

## Daftar Isi

1. Cara Menggunakan Dokumen Ini
2. Keputusan Terbuka yang Perlu Difinalisasi Dulu
3. Urutan Pengerjaan
4. Phase 1 — MVP
5. Phase 2 — Engagement & Retensi
6. Phase 3 — Optimasi & Inovasi
7. Definition of Done
8. Tracking Progress

---

## 1. Cara Menggunakan Dokumen Ini

- Checklist `[ ]` bisa dicentang manual di editor Markdown, atau di-import jadi GitHub Issues (satu task = satu issue) — lihat §8.
- Setiap task menyertakan rujukan dokumen + bagian, mis. `(API.md §5)`, supaya detail request/response/skema tidak perlu dicari ulang.
- Task di Phase 1 (MVP) **wajib selesai semua** sebelum Phase 2 dimulai, mengikuti urutan dependency di §3.

---

## 2. Keputusan Terbuka yang Perlu Difinalisasi Dulu

Selama menyusun PRD → ARCHITECTURE → DATABASE → API → STYLEGUIDE, ada beberapa hal yang ditandai sebagai asumsi atau pertanyaan terbuka. Sebaiknya diputuskan **sebelum** development Phase 1 dimulai, karena beberapa mempengaruhi skema/endpoint:

| #   | Keputusan                                                        | Default yang Dipakai Jika Tidak Diubah                                       | Sumber              |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| 1   | Single-author atau multi-author?                                 | Single-author (skema sudah siap multi-author tanpa migrasi)                  | PRD §21             |
| 2   | Bahasa konten ID saja atau bilingual?                            | ID saja                                                                      | PRD §21             |
| 3   | Komentar pakai sistem sendiri atau pihak ketiga (Giscus/Disqus)? | Sistem sendiri (sesuai skema `comments`)                                     | PRD §21             |
| 4   | Newsletter dikirim manual atau otomatis via API email?           | Manual dulu di MVP, integrasi Resend/Mailchimp di Phase 2                    | PRD §21             |
| 5   | Provider hosting database                                        | Railway/Supabase                                                             | ARCHITECTURE.md §19 |
| 6   | Storage media                                                    | Cloud object storage (Vercel Blob/Cloudinary), bukan lokal                   | ARCHITECTURE.md §19 |
| 7   | Metrik "Artikel Populer" all-time vs 30 hari                     | All-time di MVP; tabel `post_views` jika butuh akurasi periode               | DATABASE.md §9      |
| 8   | Field "Nama" di form newsletter                                  | Tidak disimpan (skema cuma `email`) — tambah kolom jika diperlukan           | API.md §15          |
| 9   | Lokasi endpoint sitemap                                          | `app/sitemap.ts` (konvensi Next.js), bukan `/api/sitemap.xml`                | API.md §15          |
| 10  | Mekanisme token unsubscribe                                      | Signed JWT stateless (tanpa kolom DB baru)                                   | API.md §15          |
| 11  | Palet warna & font brand                                         | Hijau tinta + kuning highlighter, Fraunces/IBM Plex — **perlu review Wisnu** | STYLEGUIDE.md §12   |

> Jika tidak ada keputusan eksplisit, asumsikan kolom "Default" di atas dipakai dan lanjutkan ke Phase 1.

---

## 3. Urutan Pengerjaan

```text
Setup Project & Infra
        │
        ▼
   Database (schema + migrasi + seed)
        │
        ▼
   Autentikasi Admin
        │
        ├──────────────┐
        ▼              ▼
   Backend/API     Frontend Publik (layout, homepage, dll)
        │              │
        ▼              ▼
   Dashboard Admin ◄────┘ (butuh API selesai)
        │
        ▼
   SEO Dasar
        │
        ▼
   Testing & QA
        │
        ▼
   Deployment Production
```

---

## 4. Phase 1 — MVP

### 4.1 Setup Project & Infrastruktur

- [x] Init project Next.js (App Router + TypeScript + Tailwind) _(ARCHITECTURE.md §5)_
- [x] Setup ESLint + Prettier + `prettier-plugin-tailwindcss` _(STYLEGUIDE.md §8)_
- [x] Setup Husky + lint-staged pre-commit hook _(STYLEGUIDE.md §8)_
- [x] Provisioning PostgreSQL (Railway/Supabase) _(ARCHITECTURE.md §15)_
- [x] Setup `.env.local` & `.env.example` (`DATABASE_URL`, `NEXTAUTH_SECRET`, storage API key)
- [x] Connect repo GitHub ke Vercel, aktifkan preview deployment per PR _(ARCHITECTURE.md §15)_
- [ ] Setup object storage untuk media (Vercel Blob/Cloudinary) _(ARCHITECTURE.md §12)_

### 4.2 Database

- [ ] Tulis `prisma/schema.prisma` sesuai skema final _(DATABASE.md §5)_
- [ ] Jalankan `prisma migrate dev --name init`
- [ ] Buat `prisma/seed.ts`: 1 admin user, 5–7 kategori dasar, beberapa tag, 1–2 artikel contoh _(DATABASE.md §6)_
- [ ] Tentukan pendekatan search MVP (`ILIKE` sederhana, upgrade nanti) _(DATABASE.md §9)_

### 4.3 Autentikasi

- [ ] Setup NextAuth Credentials Provider _(ARCHITECTURE.md §9)_
- [ ] Buat `middleware.ts` untuk proteksi `/dashboard/*`
- [ ] Implementasi rate limiting login (maks. 5 gagal/15 menit) _(API.md §14)_
- [ ] Halaman `/login`

### 4.4 Backend/API

_(detail lengkap request/response di `API.md`)_

- [ ] `GET/POST /api/posts`, `GET /api/posts/[slug]`, `PUT/DELETE /api/posts/[id]` _(API.md §5)_
- [ ] `GET/POST /api/categories`, `PUT/DELETE /api/categories/[id]` (+ konfirmasi force-delete) _(API.md §6)_
- [ ] `GET/POST /api/tags`, `PUT/DELETE /api/tags/[id]` _(API.md §7)_
- [ ] `POST/GET /api/comments`, `PATCH/DELETE /api/comments/[id]` _(API.md §8)_
- [ ] `POST /api/subscribers`, unsubscribe endpoint _(API.md §9 — tunggu keputusan #8 & #10 di §2)_
- [ ] `POST/GET/DELETE /api/media` _(API.md §10)_
- [ ] `GET /api/search` _(API.md §11)_
- [ ] `GET /api/stats` _(API.md §12)_
- [ ] Panggil `revalidatePath()` di handler create/update/delete artikel _(ARCHITECTURE.md §8)_

### 4.5 Frontend Publik

- [ ] Layout dasar: Header, Footer, ThemeToggle _(STYLEGUIDE.md §4)_
- [ ] Implementasi design tokens (CSS variables + `tailwind.config.js`) _(STYLEGUIDE.md §2)_
- [ ] Homepage: hero, artikel terbaru, artikel populer, explore categories _(PRD §8.1)_
- [ ] Halaman detail artikel: konten, share button, komentar, artikel terkait _(PRD §8.2)_
- [ ] Halaman kategori & tag listing
- [ ] Halaman search _(API.md §11)_
- [ ] Halaman statis: arsip, tentang saya, kontak
- [ ] Dark mode toggle + persist preferensi _(PRD §10)_
- [ ] Komponen signature: "Catatan Wisnu" callout, inline highlight, tag chip _(STYLEGUIDE.md §4)_

### 4.6 Dashboard Admin

- [ ] Layout dashboard + sidebar navigasi
- [ ] CRUD artikel (form create/edit, draft/publish/schedule) _(PRD §11.2)_
- [ ] CRUD kategori _(PRD §11.3)_
- [ ] CRUD tag _(PRD §11.4)_
- [ ] Moderasi komentar: approve/reject/delete _(PRD §11.5)_
- [ ] Media manager: upload, list, delete, copy URL _(PRD §11.6)_
- [ ] Halaman statistik dashboard _(API.md §12)_

### 4.7 SEO Dasar

- [ ] Meta tag per halaman via `generateMetadata()` _(ARCHITECTURE.md §14)_
- [ ] `app/sitemap.ts` _(keputusan #9 di §2)_
- [ ] `public/robots.txt`
- [ ] JSON-LD structured data tipe `Article`

### 4.8 Testing & QA

- [ ] Unit test utility function (slug generator, validasi email, dll)
- [ ] Test manual responsive: desktop, tablet, mobile _(PRD §14)_
- [ ] Test aksesibilitas dasar: keyboard nav, kontras, alt text _(STYLEGUIDE.md §11)_
- [ ] Test endpoint API manual (Postman/curl) sesuai contoh di `API.md`

### 4.9 Deployment

- [ ] Deploy production ke Vercel
- [ ] Setup custom domain + SSL
- [ ] Verifikasi `sitemap.xml` & `robots.txt` bisa diakses publik
- [ ] Submit sitemap ke Google Search Console

---

## 5. Phase 2 — Engagement & Retensi

- [ ] Integrasi provider email (Resend/Mailchimp) untuk kirim notifikasi artikel baru _(PRD §21 keputusan #4)_
- [ ] Export subscriber ke CSV _(API.md §9)_
- [ ] Unsubscribe flow lengkap (validasi token JWT) _(API.md §9)_
- [ ] Dark mode: audit ulang kontras & transisi sesuai `prefers-reduced-motion` _(STYLEGUIDE.md §11)_
- [ ] Bookmark artikel — **perlu klarifikasi dulu**: disimpan per-browser (localStorage, tanpa akun) atau perlu sistem akun pembaca? Belum dibahas di PRD manapun.
- [ ] Statistik pengunjung lebih detail (sumber trafik, durasi sesi) — integrasi Google Analytics/Plausible _(PRD §16)_

---

## 6. Phase 3 — Optimasi & Inovasi

- [ ] Evaluasi kebutuhan tabel log `post_views` untuk metrik populer akurat per periode _(DATABASE.md §9–10)_
- [ ] Riset & implementasi AI article recommendation (`pgvector` + embedding) _(DATABASE.md §10)_
- [ ] Evaluasi multi-author: role permission lebih granular, UI assignment penulis _(ARCHITECTURE.md §18)_
- [ ] Upgrade search ke Meilisearch/Algolia jika volume artikel besar _(DATABASE.md §9)_

---

## 7. Definition of Done

| Tipe Task                 | Selesai jika...                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint API              | Sesuai kontrak request/response di `API.md`, ada validasi input, error format konsisten (§4 `API.md`), sudah ditest manual          |
| Halaman/komponen frontend | Responsive (desktop/tablet/mobile), mendukung dark mode, pakai design token dari `STYLEGUIDE.md`, accessible (keyboard + alt text)  |
| Migrasi database          | Jalan tanpa error di environment bersih, seed data berhasil, index sesuai `DATABASE.md` §4                                          |
| Fitur admin               | Hak akses tervalidasi di server (bukan hanya disembunyikan di UI), ada confirmation untuk aksi destruktif (hapus kategori/komentar) |

---

## 8. Tracking Progress

Untuk tim lebih dari 1 orang, disarankan memindahkan checklist ini ke **GitHub Issues/Projects**: setiap sub-bullet di §4–6 jadi satu issue, dikelompokkan per milestone (`Phase 1 - MVP`, `Phase 2`, `Phase 3`). Untuk solo development, checklist Markdown ini cukup dicentang langsung di editor (`- [x]`) dan di-commit sebagai bagian dari progress tracking.
