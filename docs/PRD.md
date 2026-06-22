# Product Requirements Document (PRD)

## Wisnu Blog — Platform Blog Personal / Knowledge Sharing

| Item           | Detail                                    |
| -------------- | ----------------------------------------- |
| Nama Produk    | Wisnu Blog _(sementara, dapat diganti)_   |
| Jenis Produk   | Website Blog Personal / Knowledge Sharing |
| Versi Dokumen  | 1.0                                       |
| Tanggal        | 22 Juni 2026                              |
| Status         | Draft Lengkap — Siap Review               |
| Pemilik Produk | Wisnu (Author/Admin)                      |

---

## Daftar Isi

1. Ringkasan Eksekutif
2. Latar Belakang & Permasalahan
3. Tujuan Produk
4. Target Pengguna & Persona
5. Lingkup Produk (Scope)
6. User Stories & Use Case
7. Sitemap
8. Spesifikasi Halaman & Fitur
9. Pencarian
10. SEO Requirements
11. Dashboard Admin
12. Newsletter
13. Dark Mode
14. Desain Database (ERD)
15. Non-Functional Requirements
16. Statistik & Analytics
17. Tech Stack
18. Roadmap & Milestone
19. Success Metrics (KPI)
20. Risiko & Mitigasi
21. Asumsi & Pertanyaan Terbuka
22. Lampiran (Glossary)

---

# 1. Ringkasan Eksekutif

Wisnu Blog adalah platform blog personal yang dirancang untuk membagikan pengetahuan, tutorial, opini, dan pengalaman lintas topik (teknologi, pemrograman, pendidikan, produktivitas, lifestyle, dll). Produk ini ditujukan untuk satu penulis utama (single-author, dengan kemungkinan ekspansi multi-author di fase lanjut) dan menyasar pembaca umum seperti mahasiswa, pelajar, programmer, dan masyarakat umum yang mencari artikel berkualitas.

Tujuan utama produk adalah membangun personal branding, menjadi katalog pengetahuan yang terdokumentasi rapi, serta menghasilkan trafik organik melalui SEO. Versi pertama (MVP) berfokus pada fungsi inti: publikasi artikel, kategori, pencarian, dan pengelolaan dasar via dashboard admin — sebelum berkembang ke fitur lanjutan seperti newsletter, dark mode, dan rekomendasi artikel berbasis AI.

---

# 2. Latar Belakang & Permasalahan

**Masalah yang ingin diselesaikan:**

- Pengetahuan dan catatan pribadi penulis tersebar di berbagai platform (notes, dokumen, media sosial) dan tidak terdokumentasi secara terstruktur.
- Belum ada platform milik sendiri (owned media) yang bisa dioptimasi untuk SEO dan personal branding jangka panjang.
- Platform pihak ketiga (Medium, dll) memiliki keterbatasan kustomisasi, monetisasi, dan kepemilikan data.

**Solusi yang ditawarkan:**

Membangun blog mandiri yang fleksibel, cepat, SEO-friendly, dan mudah dikelola oleh satu admin/penulis, dengan pengalaman membaca yang nyaman bagi pengunjung.

---

# 3. Tujuan Produk

### 3.1 Business Goals

- Menjadi media berbagi ilmu yang konsisten dan terpercaya.
- Membangun personal branding penulis.
- Menyimpan dan mengorganisir catatan pengetahuan secara terstruktur.
- Mendapatkan trafik organik dari mesin pencari (SEO).

### 3.2 User Goals

Pembaca dapat:

- Mencari artikel dengan mudah.
- Membaca artikel dengan nyaman (termasuk dark mode).
- Menemukan artikel berdasarkan kategori/tag.
- Memberikan komentar dan berdiskusi.
- Membagikan artikel ke media sosial.

---

# 4. Target Pengguna & Persona

### 4.1 Primary User — Pembaca

**Siapa:** Mahasiswa, pelajar, programmer, masyarakat umum yang suka membaca artikel.

**Persona singkat — "Andi, Mahasiswa Informatika"**

- Usia 20 tahun, sering mencari tutorial coding via Google.
- Butuh artikel yang ringkas, jelas, dan mudah diikuti langkah-langkahnya.
- Mengakses dari mobile saat di kampus, dari desktop saat mengerjakan tugas.

### 4.2 Secondary User — Admin/Penulis

**Siapa:** Wisnu, sebagai pemilik dan penulis utama blog.

**Hak akses:**

- Membuat, mengedit, menghapus artikel.
- Mengelola kategori, tag, komentar, dan media.
- Melihat statistik performa blog.

---

# 5. Lingkup Produk (Scope)

### In Scope (MVP & lanjutan)

- Publikasi artikel publik dengan kategori & tag.
- Pencarian artikel.
- Dashboard admin untuk CRUD konten.
- Komentar pembaca.
- Newsletter, dark mode (fase lanjut).
- SEO dasar (meta tag, sitemap, URL friendly).

### Out of Scope (V1 — dipertimbangkan di masa depan)

- Sistem multi-author dengan manajemen tim penulis.
- Monetisasi (iklan, sponsored post, affiliate).
- Aplikasi mobile native.
- Sistem membership/paywall konten premium.
- AI article recommendation (disebut sebagai ide lanjutan, bukan bagian MVP/Phase 2).

---

# 6. User Stories & Use Case

| ID    | Sebagai | Saya ingin                             | Agar                                       |
| ----- | ------- | -------------------------------------- | ------------------------------------------ |
| US-01 | Pembaca | mencari artikel berdasarkan keyword    | menemukan konten yang relevan dengan cepat |
| US-02 | Pembaca | melihat artikel berdasarkan kategori   | menjelajah topik yang saya minati          |
| US-03 | Pembaca | memberi komentar pada artikel          | berdiskusi dengan penulis/pembaca lain     |
| US-04 | Pembaca | membagikan artikel ke media sosial     | merekomendasikan ke orang lain             |
| US-05 | Pembaca | mengaktifkan dark mode                 | membaca dengan nyaman di malam hari        |
| US-06 | Pembaca | berlangganan newsletter                | mendapat notifikasi artikel terbaru        |
| US-07 | Admin   | membuat & mempublikasikan artikel baru | membagikan pengetahuan terbaru             |
| US-08 | Admin   | menjadwalkan post (schedule)           | konten terbit otomatis di waktu tertentu   |
| US-09 | Admin   | memoderasi komentar (approve/reject)   | menjaga kualitas diskusi dan mencegah spam |
| US-10 | Admin   | melihat statistik blog                 | mengevaluasi performa konten               |

---

# 7. Sitemap

```text
HOME

├── Artikel
│   └── Detail Artikel
│
├── Kategori
│   ├── Teknologi
│   ├── Pendidikan
│   ├── Tutorial
│   ├── Opini
│   └── Lainnya
│
├── Tag
│
├── Arsip
│
├── Tentang Saya
│
├── Kontak
│
├── Login
│
└── Dashboard Admin
    ├── Artikel
    ├── Kategori
    ├── Tag
    ├── Komentar
    ├── Media
    ├── Subscriber
    ├── Statistik
    └── Pengaturan
```

---

# 8. Spesifikasi Halaman & Fitur

## 8.1 Homepage

**Hero Section** — menampilkan nama blog & slogan.

```text
Wisnu Blog
Berbagi Pengetahuan, Cerita, dan Pengalaman.
```

**Artikel Terbaru** — thumbnail, judul, deskripsi singkat, tanggal, kategori.

**Artikel Populer** — berdasarkan jumlah pembaca (views), like, share.

**Explore Categories** — Teknologi, Pendidikan, Tutorial, Review, Produktivitas, Opini, Lifestyle, Random.

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-HOME-01 | Sistem menampilkan 6–10 artikel terbaru di homepage, diurutkan berdasarkan tanggal publikasi terbaru |
| FR-HOME-02 | Sistem menampilkan artikel populer berdasarkan jumlah views dalam 30 hari terakhir |
| FR-HOME-03 | Homepage menampilkan daftar kategori yang dapat diklik untuk navigasi |
| FR-HOME-04 | Homepage menerapkan pagination atau infinite scroll untuk daftar artikel |

**Acceptance Criteria:**

- [ ] Homepage termuat (loading) dalam < 3 detik pada koneksi 4G standar.
- [ ] Setiap thumbnail menggunakan lazy loading.
- [ ] Tampilan responsif di desktop, tablet, dan mobile.

---

## 8.2 Halaman Detail Artikel

**Informasi Artikel:** Judul, Thumbnail, Kategori, Tag, Tanggal Publikasi, Nama Penulis, Isi Artikel.

**Fitur Share:** Facebook, WhatsApp, X/Twitter, Telegram.

**Fitur Komentar:** menulis komentar, membalas komentar (nested reply).

**Artikel Terkait:** berdasarkan kategori sama dan/atau tag yang sama.

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-ART-01 | Sistem menampilkan konten artikel dalam format rich text (heading, list, gambar, code block) |
| FR-ART-02 | Sistem menyediakan tombol share ke 4 platform (FB, WA, X, Telegram) dengan URL artikel ter-encode otomatis |
| FR-ART-03 | Pengguna dapat menulis komentar dengan nama & email (tanpa wajib registrasi) |
| FR-ART-04 | Komentar yang masuk berstatus "pending" sampai disetujui admin |
| FR-ART-05 | Sistem menampilkan minimal 3 artikel terkait berdasarkan kategori/tag yang sama |
| FR-ART-06 | Setiap view artikel dihitung dan disimpan ke kolom `views` |

**Acceptance Criteria:**

- [ ] Komentar spam/kasar dapat ditolak (reject) oleh admin sebelum tampil ke publik.
- [ ] Artikel mendukung gambar dengan alt text untuk SEO & aksesibilitas.

---

# 9. Pencarian

Pengguna dapat mencari berdasarkan: Keyword, Judul Artikel, Kategori, Tag.

**Contoh:**

```text
Input:  Java
Output:
  Belajar Java Dasar
  Java Swing CRUD
  Java OOP
```

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-SRCH-01 | Sistem mencari berdasarkan judul dan isi artikel (full-text search) |
| FR-SRCH-02 | Hasil pencarian diurutkan berdasarkan relevansi, dengan opsi sort by tanggal |
| FR-SRCH-03 | Sistem menampilkan pesan "Artikel tidak ditemukan" jika hasil kosong, beserta saran kategori populer |

---

# 10. SEO Requirements

**SEO Friendly URL:**

```text
/teknologi/cara-install-java
/tutorial/membuat-blog-nextjs
```

**Meta Tag:**

```html
title description keywords og:image og:title
```

**Sitemap & Crawling:**

```text
sitemap.xml
robots.txt
```

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-SEO-01 | Setiap artikel memiliki slug unik yang dapat diedit manual oleh admin |
| FR-SEO-02 | Sistem otomatis generate `sitemap.xml` setiap kali artikel baru dipublikasikan |
| FR-SEO-03 | Setiap halaman memiliki meta title & description yang dapat dikustomisasi terpisah dari judul tampilan |
| FR-SEO-04 | Sistem mendukung structured data (JSON-LD) untuk tipe Article |

---

# 11. Dashboard Admin

### 11.1 Login

Field: Email, Password.

### 11.2 Kelola Artikel

Admin dapat: Tambah, Edit, Hapus, Publish, Draft, Schedule Post.

### 11.3 Kelola Kategori

CRUD: Nama kategori, Slug, Deskripsi.

### 11.4 Kelola Tag

CRUD: Nama Tag, Slug.

### 11.5 Kelola Komentar

Fitur: Approve, Reject, Delete.

### 11.6 Media Manager

Upload: jpg, png, webp, gif.
Fungsi: Upload gambar, Hapus gambar, Copy URL gambar.

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-ADM-01 | Login admin dibatasi rate limit (maks. 5 percobaan gagal per 15 menit) |
| FR-ADM-02 | Artikel berstatus draft tidak dapat diakses publik melalui URL langsung |
| FR-ADM-03 | Scheduled post otomatis berubah status menjadi "published" pada waktu yang ditentukan |
| FR-ADM-04 | Penghapusan kategori/tag yang masih digunakan artikel akan memunculkan konfirmasi peringatan |
| FR-ADM-05 | Media manager membatasi ukuran upload (mis. maks. 5MB per file) dan memvalidasi tipe file |

**Acceptance Criteria:**

- [ ] Password admin disimpan dalam bentuk hash (bcrypt/argon2), tidak pernah plaintext.
- [ ] Sesi login admin otomatis expired setelah periode tidak aktif tertentu.

---

# 12. Newsletter

Pengunjung memasukkan: Nama, Email.

**Tujuan:** Mendapat artikel terbaru, notifikasi posting baru.

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-NEWS-01 | Sistem memvalidasi format email sebelum menyimpan subscriber |
| FR-NEWS-02 | Subscriber dapat unsubscribe melalui link di setiap email yang dikirim |
| FR-NEWS-03 | Admin dapat mengekspor daftar subscriber (CSV) dari dashboard |

---

# 13. Dark Mode

Mode: ☀ Light / 🌙 Dark. Preferensi disimpan pada browser pengguna (local storage).

**Functional Requirements:**
| ID | Requirement |
|---|---|
| FR-DARK-01 | Toggle dark mode tersedia di seluruh halaman (header/navbar) |
| FR-DARK-02 | Preferensi mode tersimpan dan diterapkan otomatis pada kunjungan berikutnya |

---

# 14. Desain Database (ERD)

### 14.1 `users`

| Field      | Tipe                   | Constraint       | Deskripsi         |
| ---------- | ---------------------- | ---------------- | ----------------- |
| id         | UUID / BIGINT          | PK               | ID unik user      |
| name       | VARCHAR(100)           | NOT NULL         | Nama lengkap      |
| email      | VARCHAR(150)           | UNIQUE, NOT NULL | Email login       |
| password   | VARCHAR(255)           | NOT NULL         | Password (hashed) |
| avatar     | VARCHAR(255)           | NULLABLE         | URL foto profil   |
| role       | ENUM('admin','author') | DEFAULT 'author' | Role akses        |
| created_at | TIMESTAMP              | DEFAULT now()    | Tanggal dibuat    |
| updated_at | TIMESTAMP              | DEFAULT now()    | Tanggal update    |

### 14.2 `posts`

| Field        | Tipe                                  | Constraint       | Deskripsi                    |
| ------------ | ------------------------------------- | ---------------- | ---------------------------- |
| id           | UUID / BIGINT                         | PK               | ID unik artikel              |
| title        | VARCHAR(255)                          | NOT NULL         | Judul artikel                |
| slug         | VARCHAR(255)                          | UNIQUE, NOT NULL | URL slug                     |
| content      | TEXT                                  | NOT NULL         | Isi artikel (rich text/HTML) |
| excerpt      | VARCHAR(300)                          | NULLABLE         | Ringkasan singkat            |
| thumbnail    | VARCHAR(255)                          | NULLABLE         | URL gambar utama             |
| status       | ENUM('draft','scheduled','published') | DEFAULT 'draft'  | Status publikasi             |
| views        | INTEGER                               | DEFAULT 0        | Jumlah views                 |
| author_id    | BIGINT                                | FK → users.id    | Penulis artikel              |
| created_at   | TIMESTAMP                             | DEFAULT now()    | Tanggal dibuat               |
| updated_at   | TIMESTAMP                             | DEFAULT now()    | Tanggal update               |
| published_at | TIMESTAMP                             | NULLABLE         | Tanggal/jam tayang           |

### 14.3 `categories`

| Field       | Tipe         | Constraint       | Deskripsi          |
| ----------- | ------------ | ---------------- | ------------------ |
| id          | BIGINT       | PK               | ID kategori        |
| name        | VARCHAR(100) | NOT NULL         | Nama kategori      |
| slug        | VARCHAR(100) | UNIQUE, NOT NULL | URL slug           |
| description | VARCHAR(300) | NULLABLE         | Deskripsi kategori |

> Catatan: relasi `posts` ↔ `categories` perlu kolom `category_id` (FK) di tabel `posts`, atau tabel pivot `post_categories` jika satu artikel boleh punya lebih dari satu kategori.

### 14.4 `tags`

| Field | Tipe         | Constraint       | Deskripsi |
| ----- | ------------ | ---------------- | --------- |
| id    | BIGINT       | PK               | ID tag    |
| name  | VARCHAR(100) | NOT NULL         | Nama tag  |
| slug  | VARCHAR(100) | UNIQUE, NOT NULL | URL slug  |

### 14.5 `post_tags` (pivot, many-to-many)

| Field   | Tipe   | Constraint    | Deskripsi         |
| ------- | ------ | ------------- | ----------------- |
| post_id | BIGINT | FK → posts.id | Relasi ke artikel |
| tag_id  | BIGINT | FK → tags.id  | Relasi ke tag     |

### 14.6 `comments`

| Field      | Tipe                                  | Constraint                 | Deskripsi                  |
| ---------- | ------------------------------------- | -------------------------- | -------------------------- |
| id         | BIGINT                                | PK                         | ID komentar                |
| post_id    | BIGINT                                | FK → posts.id              | Artikel terkait            |
| parent_id  | BIGINT                                | FK → comments.id, NULLABLE | Untuk reply/nested comment |
| name       | VARCHAR(100)                          | NOT NULL                   | Nama pengirim              |
| email      | VARCHAR(150)                          | NOT NULL                   | Email pengirim             |
| content    | TEXT                                  | NOT NULL                   | Isi komentar               |
| status     | ENUM('pending','approved','rejected') | DEFAULT 'pending'          | Status moderasi            |
| created_at | TIMESTAMP                             | DEFAULT now()              | Tanggal dibuat             |

### 14.7 `subscribers`

| Field      | Tipe         | Constraint       | Deskripsi         |
| ---------- | ------------ | ---------------- | ----------------- |
| id         | BIGINT       | PK               | ID subscriber     |
| email      | VARCHAR(150) | UNIQUE, NOT NULL | Email subscriber  |
| created_at | TIMESTAMP    | DEFAULT now()    | Tanggal subscribe |

### 14.8 `media`

| Field       | Tipe         | Constraint    | Deskripsi        |
| ----------- | ------------ | ------------- | ---------------- |
| id          | BIGINT       | PK            | ID media         |
| file_name   | VARCHAR(255) | NOT NULL      | Nama file        |
| file_url    | VARCHAR(255) | NOT NULL      | URL/path file    |
| uploaded_by | BIGINT       | FK → users.id | User yang upload |
| created_at  | TIMESTAMP    | DEFAULT now() | Tanggal upload   |

### 14.9 Ringkasan Relasi

```text
users (1) ────── (N) posts
posts (1) ────── (N) comments
posts (N) ──── (N) tags        → melalui post_tags
categories (1) ── (N) posts
users (1) ────── (N) media
comments (1) ──── (N) comments  → self-relation (reply)
```

---

# 15. Non-Functional Requirements

### Performance

- Loading halaman < 3 detik.
- Image lazy loading.
- Pagination artikel (bukan load semua sekaligus).
- Caching untuk halaman yang sering diakses (homepage, artikel populer).

### Security

- Password di-hash (bcrypt/argon2).
- CSRF Protection pada semua form.
- XSS Protection (sanitasi input & output konten artikel/komentar).
- Rate limiting pada login dan submit komentar.
- Validasi & sanitasi upload file media.

### Reliability & Availability

- Target uptime ≥ 99% (indikatif, disesuaikan dengan kapasitas hosting).
- Backup database otomatis secara berkala (mis. harian).

### Responsive & Aksesibilitas

- Mendukung desktop, tablet, dan mobile.
- Kontras warna memadai pada mode light & dark.
- Gambar memiliki alt text.

---

# 16. Statistik & Analytics

Dashboard internal menampilkan:

```text
Total Artikel
Total Pengunjung
Artikel Populer
Total Subscriber
Total Komentar
```

**Rekomendasi tambahan:**

- Integrasi Google Analytics / Plausible / Umami untuk data trafik lebih mendalam (sumber trafik, durasi sesi, bounce rate).
- Laporan ringkas bulanan (opsional, fase lanjut).

---

# 17. Tech Stack yang Direkomendasikan

| Layer          | Pilihan                            |
| -------------- | ---------------------------------- |
| Frontend       | React / Next.js + Tailwind CSS     |
| Backend        | Next.js API Route atau Laravel API |
| Database       | PostgreSQL                         |
| ORM            | Prisma                             |
| Authentication | JWT / NextAuth                     |
| Deployment     | Vercel / Railway / Cloudflare      |

---

# 18. Roadmap & Milestone

### Phase 1 — MVP

1. Homepage
2. Detail Artikel
3. Kategori
4. Search
5. Login Admin
6. CRUD Artikel
7. CRUD Kategori
8. Upload Gambar
9. Komentar
10. SEO dasar

_Estimasi indikatif: 4–6 minggu_ (asumsi 1 developer full-time atau 2 developer part-time — sesuaikan dengan kapasitas tim aktual).

### Phase 2 — Engagement & Retensi

- Newsletter
- Dark Mode
- Bookmark artikel
- Statistik pengunjung (dashboard internal)

_Estimasi indikatif: 2–3 minggu setelah MVP._

### Phase 3 — Optimasi & Inovasi

- AI article recommendation
- Multi-author support (jika diperlukan)
- Integrasi analytics pihak ketiga yang lebih lengkap

_Estimasi indikatif: ditentukan kemudian berdasarkan prioritas bisnis._

---

# 19. Success Metrics (KPI)

| Metrik                           | Target Indikatif                   |
| -------------------------------- | ---------------------------------- |
| Pengunjung unik per bulan        | Meningkat konsisten bulan-ke-bulan |
| Artikel dipublikasikan per bulan | Minimal 4 artikel/bulan            |
| Bounce rate                      | < 60%                              |
| Rata-rata durasi sesi            | > 1.5 menit                        |
| Subscriber baru per bulan        | Bertumbuh secara konsisten         |
| Page load time (Core Web Vitals) | LCP < 2.5s                         |

> Target di atas adalah baseline indikatif; sebaiknya disesuaikan setelah 1–2 bulan data trafik nyata tersedia.

---

# 20. Risiko & Mitigasi

| Risiko                             | Dampak                                     | Mitigasi                                                 |
| ---------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Komentar spam/abuse                | Menurunkan kualitas diskusi & kredibilitas | Moderasi manual + captcha pada form komentar             |
| Konten tidak konsisten terbit      | Trafik SEO stagnan                         | Content calendar & target jumlah artikel/bulan           |
| Traffic spike tiba-tiba (viral)    | Server down/lambat                         | Caching, CDN, monitoring server                          |
| Single admin sebagai bottleneck    | Keterlambatan publikasi/moderasi           | Rencanakan multi-author di Phase 3 jika volume meningkat |
| Kebocoran data subscriber/komentar | Masalah privasi & kepercayaan              | Enkripsi data sensitif, kebijakan privasi yang jelas     |

---

# 21. Asumsi & Pertanyaan Terbuka

Hal-hal berikut belum ditentukan secara eksplisit di draft awal dan perlu dikonfirmasi sebelum development dimulai:

- Apakah blog ini akan tetap single-author, atau direncanakan multi-author di masa depan?
- Apakah ada rencana monetisasi (iklan, sponsored post, affiliate link)?
- Apakah konten hanya berbahasa Indonesia, atau perlu dukungan bilingual (ID/EN)?
- Apakah komentar menggunakan sistem buatan sendiri atau memanfaatkan layanan pihak ketiga (mis. Giscus/Disqus) untuk mengurangi beban moderasi spam?
- Apakah newsletter dikirim manual oleh admin atau otomatis terintegrasi dengan layanan email (mis. Mailchimp/Resend)?
- Berapa kapasitas tim development (1 orang vs tim) — ini akan memengaruhi estimasi timeline pada Roadmap.

---

# 22. Lampiran — Glossary

| Istilah         | Penjelasan                                                         |
| --------------- | ------------------------------------------------------------------ |
| Slug            | Versi URL-friendly dari judul artikel/kategori                     |
| MVP             | Minimum Viable Product — versi awal dengan fitur inti              |
| FR              | Functional Requirement                                             |
| ERD             | Entity Relationship Diagram — gambaran relasi antar tabel database |
| Core Web Vitals | Metrik performa web dari Google (LCP, FID/INP, CLS)                |
| CSRF            | Cross-Site Request Forgery, jenis serangan keamanan web            |
| XSS             | Cross-Site Scripting, jenis serangan keamanan web                  |

---

_Dokumen ini adalah hasil pengembangan dari draft PRD awal, dengan penambahan struktur standar PRD (ringkasan eksekutif, persona, scope, user stories, acceptance criteria, ERD bertipe data, KPI, risiko, roadmap, dan asumsi) agar lebih siap digunakan sebagai acuan pengembangan oleh tim atau developer._
