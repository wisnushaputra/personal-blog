# DATABASE.md

## Wisnu Blog — Dokumentasi Database

> Dokumen ini melengkapi `PRD.md` (§14) dan `ARCHITECTURE.md` (§11) dengan detail teknis database: tipe data lengkap, indexing, cascade rules, Prisma schema siap pakai, contoh query, dan aturan integritas data. Dokumen ini adalah **single source of truth** untuk `prisma/schema.prisma`.

---

## Daftar Isi

1. Overview
2. Entity Relationship Diagram
3. Konvensi Penamaan & Tipe Data
4. Skema Tabel Detail
5. Prisma Schema (`schema.prisma`)
6. Strategi Migrasi & Seeding
7. Contoh Query Umum
8. Aturan Integritas Data & Validasi
9. Catatan & Keterbatasan
10. Pertimbangan Skema Masa Depan

---

## 1. Overview

Database menggunakan **PostgreSQL**, diakses lewat **Prisma ORM**. Skema dirancang untuk mendukung kebutuhan inti Wisnu Blog: artikel dengan satu kategori dan banyak tag, komentar bertingkat (nested reply), media manager, dan subscriber newsletter — dengan struktur yang sudah mengantisipasi kebutuhan multi-author di fase lanjut tanpa perlu migrasi besar.

**Asumsi kunci yang difinalisasi di dokumen ini** (sebelumnya ditandai sebagai catatan terbuka di PRD §14.3):

> Satu artikel memiliki **tepat satu kategori** (`posts.category_id`, relasi one-to-many), sementara **tag bersifat many-to-many** lewat tabel pivot `post_tags`. Ini dipilih karena draft awal menampilkan "Kategori" sebagai field tunggal di halaman artikel, sedangkan navigasi tag lebih cocok untuk pengelompokan silang yang lebih bebas.

---

## 2. Entity Relationship Diagram

```text
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│    users    │        │     posts    │        │  categories  │
├─────────────┤        ├──────────────┤        ├─────────────┤
│ id        PK│───┐    │ id         PK│    ┌───│ id        PK│
│ name        │   │    │ title        │    │   │ name        │
│ email       │   └───►│ author_id  FK│    │   │ slug        │
│ password    │        │ category_id│FK├────┘   │ description │
│ avatar      │        │ title        │        └─────────────┘
│ role        │        │ slug         │
│ created_at  │        │ content      │        ┌─────────────┐
│ updated_at  │        │ excerpt      │        │     tags     │
└─────┬───────┘        │ thumbnail    │        ├─────────────┤
      │                │ status       │   ┌───►│ id        PK│
      │ (uploaded_by)  │ views        │   │    │ name        │
      ▼                │ created_at   │   │    │ slug        │
┌─────────────┐        │ updated_at   │   │    └─────────────┘
│    media    │        │ published_at │   │
├─────────────┤        └──────┬───────┘   │
│ id        PK│               │           │
│ file_name   │               │           │
│ file_url    │        ┌──────▼───────┐   │
│ uploaded_by │        │  post_tags    │   │
│ created_at  │        ├──────────────┤   │
└─────────────┘        │ post_id  FK  │───┘
                        │ tag_id   FK  │
                        └──────────────┘

┌──────────────┐                       ┌─────────────┐
│   comments   │                       │ subscribers  │
├──────────────┤                       ├─────────────┤
│ id         PK│◄──┐ (parent_id, self) │ id        PK│
│ post_id   FK │   │                    │ email       │
│ parent_id FK │───┘                    │ created_at  │
│ name         │                        └─────────────┘
│ email        │
│ content      │
│ status       │
│ created_at   │
└──────────────┘
```

---

## 3. Konvensi Penamaan & Tipe Data

| Aspek                  | Konvensi                                                     |
| ---------------------- | ------------------------------------------------------------ |
| Nama tabel             | `snake_case`, plural (`posts`, `categories`)                 |
| Nama kolom (DB)        | `snake_case` (`author_id`, `created_at`)                     |
| Nama field (Prisma/TS) | `camelCase` (`authorId`, `createdAt`) — dipetakan via `@map` |
| Primary key            | `id`, tipe `BigInt` auto-increment                           |
| Foreign key            | `<entitas>_id`, mis. `author_id`, `post_id`                  |
| Slug                   | lowercase, hyphen-separated, mis. `cara-install-java`        |
| Timestamp              | `TIMESTAMP WITH TIME ZONE`, default `now()`                  |

---

## 4. Skema Tabel Detail

### 4.1 `users`

| Field      | Tipe                   | Constraint       | Index  |
| ---------- | ---------------------- | ---------------- | ------ |
| id         | BIGINT                 | PK               | —      |
| name       | VARCHAR(100)           | NOT NULL         | —      |
| email      | VARCHAR(150)           | UNIQUE, NOT NULL | UNIQUE |
| password   | VARCHAR(255)           | NOT NULL         | —      |
| avatar     | VARCHAR(255)           | NULLABLE         | —      |
| role       | ENUM('admin','author') | DEFAULT 'author' | —      |
| created_at | TIMESTAMPTZ            | DEFAULT now()    | —      |
| updated_at | TIMESTAMPTZ            | DEFAULT now()    | —      |

### 4.2 `categories`

| Field       | Tipe         | Constraint       | Index  |
| ----------- | ------------ | ---------------- | ------ |
| id          | BIGINT       | PK               | —      |
| name        | VARCHAR(100) | NOT NULL         | —      |
| slug        | VARCHAR(100) | UNIQUE, NOT NULL | UNIQUE |
| description | VARCHAR(300) | NULLABLE         | —      |

### 4.3 `tags`

| Field | Tipe         | Constraint       | Index  |
| ----- | ------------ | ---------------- | ------ |
| id    | BIGINT       | PK               | —      |
| name  | VARCHAR(100) | NOT NULL         | —      |
| slug  | VARCHAR(100) | UNIQUE, NOT NULL | UNIQUE |

### 4.4 `posts`

| Field        | Tipe                                  | Constraint                   | On Delete (FK) | Index                            |
| ------------ | ------------------------------------- | ---------------------------- | -------------- | -------------------------------- |
| id           | BIGINT                                | PK                           | —              | —                                |
| title        | VARCHAR(255)                          | NOT NULL                     | —              | —                                |
| slug         | VARCHAR(255)                          | UNIQUE, NOT NULL             | —              | UNIQUE                           |
| content      | TEXT                                  | NOT NULL                     | —              | GIN (full-text, lihat §9)        |
| excerpt      | VARCHAR(300)                          | NULLABLE                     | —              | —                                |
| thumbnail    | VARCHAR(255)                          | NULLABLE                     | —              | —                                |
| status       | ENUM('draft','scheduled','published') | DEFAULT 'draft'              | —              | composite (status, published_at) |
| views        | INTEGER                               | DEFAULT 0                    | —              | —                                |
| author_id    | BIGINT                                | FK → users.id, NOT NULL      | RESTRICT       | INDEX                            |
| category_id  | BIGINT                                | FK → categories.id, NULLABLE | SET NULL       | INDEX                            |
| created_at   | TIMESTAMPTZ                           | DEFAULT now()                | —              | —                                |
| updated_at   | TIMESTAMPTZ                           | DEFAULT now()                | —              | —                                |
| published_at | TIMESTAMPTZ                           | NULLABLE                     | —              | composite (status, published_at) |

> **`author_id` → RESTRICT**: mencegah penghapusan user yang masih punya artikel (admin harus reassign dulu).
> **`category_id` → SET NULL**: jika kategori dihapus, artikel tidak ikut terhapus — cukup jadi "tanpa kategori" (selaras dengan FR-ADM-04 di ARCHITECTURE.md yang meminta konfirmasi sebelum hapus).

### 4.5 `post_tags` (pivot, many-to-many)

| Field   | Tipe   | Constraint    | On Delete | Index        |
| ------- | ------ | ------------- | --------- | ------------ |
| post_id | BIGINT | FK → posts.id | CASCADE   | composite PK |
| tag_id  | BIGINT | FK → tags.id  | CASCADE   | INDEX        |

Primary key komposit: `(post_id, tag_id)` — mencegah duplikasi relasi.

### 4.6 `comments`

| Field      | Tipe                                  | Constraint                        | On Delete | Index |
| ---------- | ------------------------------------- | --------------------------------- | --------- | ----- |
| id         | BIGINT                                | PK                                | —         | —     |
| post_id    | BIGINT                                | FK → posts.id, NOT NULL           | CASCADE   | INDEX |
| parent_id  | BIGINT                                | FK → comments.id, NULLABLE (self) | CASCADE   | INDEX |
| name       | VARCHAR(100)                          | NOT NULL                          | —         | —     |
| email      | VARCHAR(150)                          | NOT NULL                          | —         | —     |
| content    | TEXT                                  | NOT NULL                          | —         | —     |
| status     | ENUM('pending','approved','rejected') | DEFAULT 'pending'                 | —         | INDEX |
| created_at | TIMESTAMPTZ                           | DEFAULT now()                     | —         | —     |

> **`post_id` → CASCADE**: artikel dihapus, komentarnya ikut terhapus.
> **`parent_id` → CASCADE**: komentar induk dihapus, semua balasannya ikut terhapus. _(Alternatif: `SET NULL` jika ingin balasan tetap tampil sebagai "komentar dihapus" — pertimbangkan ini jika UX moderasi membutuhkannya.)_

### 4.7 `subscribers`

| Field      | Tipe         | Constraint       | Index  |
| ---------- | ------------ | ---------------- | ------ |
| id         | BIGINT       | PK               | —      |
| email      | VARCHAR(150) | UNIQUE, NOT NULL | UNIQUE |
| created_at | TIMESTAMPTZ  | DEFAULT now()    | —      |

### 4.8 `media`

| Field       | Tipe         | Constraint              | On Delete | Index |
| ----------- | ------------ | ----------------------- | --------- | ----- |
| id          | BIGINT       | PK                      | —         | —     |
| file_name   | VARCHAR(255) | NOT NULL                | —         | —     |
| file_url    | VARCHAR(255) | NOT NULL                | —         | —     |
| uploaded_by | BIGINT       | FK → users.id, NULLABLE | SET NULL  | INDEX |
| created_at  | TIMESTAMPTZ  | DEFAULT now()           | —         | —     |

---

## 5. Prisma Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  AUTHOR
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id        BigInt   @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(150)
  password  String   @db.VarChar(255)
  avatar    String?  @db.VarChar(255)
  role      Role     @default(AUTHOR)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts         Post[]
  uploadedMedia Media[]

  @@map("users")
}

model Category {
  id          BigInt  @id @default(autoincrement())
  name        String  @db.VarChar(100)
  slug        String  @unique @db.VarChar(100)
  description String? @db.VarChar(300)

  posts Post[]

  @@map("categories")
}

model Tag {
  id   BigInt @id @default(autoincrement())
  name String @db.VarChar(100)
  slug String @unique @db.VarChar(100)

  posts PostTag[]

  @@map("tags")
}

model Post {
  id          BigInt     @id @default(autoincrement())
  title       String     @db.VarChar(255)
  slug        String     @unique @db.VarChar(255)
  content     String
  excerpt     String?    @db.VarChar(300)
  thumbnail   String?    @db.VarChar(255)
  status      PostStatus @default(DRAFT)
  views       Int        @default(0)
  authorId    BigInt     @map("author_id")
  categoryId  BigInt?    @map("category_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  publishedAt DateTime?  @map("published_at")

  author   User      @relation(fields: [authorId], references: [id], onDelete: Restrict)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags     PostTag[]
  comments Comment[]

  @@index([status, publishedAt])
  @@index([authorId])
  @@index([categoryId])
  @@map("posts")
}

model PostTag {
  postId BigInt @map("post_id")
  tagId  BigInt @map("tag_id")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
  @@map("post_tags")
}

model Comment {
  id        BigInt        @id @default(autoincrement())
  postId    BigInt        @map("post_id")
  parentId  BigInt?       @map("parent_id")
  name      String        @db.VarChar(100)
  email     String        @db.VarChar(150)
  content   String
  status    CommentStatus @default(PENDING)
  createdAt DateTime      @default(now()) @map("created_at")

  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([parentId])
  @@index([status])
  @@map("comments")
}

model Subscriber {
  id        BigInt   @id @default(autoincrement())
  email     String   @unique @db.VarChar(150)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("subscribers")
}

model Media {
  id         BigInt   @id @default(autoincrement())
  fileName   String   @map("file_name") @db.VarChar(255)
  fileUrl    String   @map("file_url") @db.VarChar(255)
  uploadedBy BigInt?  @map("uploaded_by")
  createdAt  DateTime @default(now()) @map("created_at")

  uploader User? @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)

  @@index([uploadedBy])
  @@map("media")
}
```

---

## 6. Strategi Migrasi & Seeding

**Development:**

```bash
npx prisma migrate dev --name init
```

**Production (CI/CD, dijalankan sebagai build step di Vercel — lihat ARCHITECTURE.md §15):**

```bash
npx prisma migrate deploy
```

**Seed data awal** (`prisma/seed.ts`) — minimal untuk MVP siap pakai:

- 1 user dengan `role: ADMIN` (akun Wisnu).
- 5–7 `categories` dasar (Teknologi, Pendidikan, Tutorial, Opini, Lifestyle, dst — sesuai PRD §5).
- Beberapa `tags` umum (mis. `javascript`, `nextjs`, `produktivitas`).
- 1–2 artikel contoh berstatus `PUBLISHED` untuk testing tampilan homepage.

> Jalankan dengan `npx prisma db seed` setelah migrasi awal. Jangan jalankan seed ini di environment production setelah go-live (hanya untuk setup awal/staging).

---

## 7. Contoh Query Umum

**Artikel terbaru (homepage), termasuk kategori & jumlah tag:**

```ts
const posts = await prisma.post.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { publishedAt: 'desc' },
  take: 10,
  include: { category: true, tags: { include: { tag: true } } },
});
```

**Detail artikel berdasarkan slug, dengan komentar yang sudah disetujui (nested):**

```ts
const post = await prisma.post.findUnique({
  where: { slug },
  include: {
    author: { select: { name: true, avatar: true } },
    category: true,
    tags: { include: { tag: true } },
    comments: {
      where: { status: 'APPROVED', parentId: null },
      include: { replies: { where: { status: 'APPROVED' } } },
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

**Artikel terkait (kategori sama, kecuali artikel saat ini):**

```ts
const related = await prisma.post.findMany({
  where: {
    categoryId: post.categoryId,
    id: { not: post.id },
    status: 'PUBLISHED',
  },
  take: 3,
  orderBy: { publishedAt: 'desc' },
});
```

**Komentar pending untuk moderasi admin:**

```ts
const pendingComments = await prisma.comment.findMany({
  where: { status: 'PENDING' },
  include: { post: { select: { title: true, slug: true } } },
  orderBy: { createdAt: 'asc' },
});
```

**Tambah subscriber newsletter (dengan handle duplikat):**

```ts
await prisma.subscriber.upsert({
  where: { email },
  update: {},
  create: { email },
});
```

**Full-text search sederhana (lihat keterbatasan di §9):**

```ts
const results = await prisma.post.findMany({
  where: {
    status: 'PUBLISHED',
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
    ],
  },
  take: 20,
});
```

---

## 8. Aturan Integritas Data & Validasi

| Aturan                                                                      | Lapisan                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Format email valid                                                          | Aplikasi (Zod/Yup) sebelum insert ke `users`, `subscribers`, `comments`                                       |
| Slug unik                                                                   | DB (`UNIQUE` constraint) + Aplikasi (auto-generate dengan suffix `-2`, `-3` jika terjadi collision)           |
| Password minimal 8 karakter, ter-hash sebelum simpan                        | Aplikasi (bcrypt/argon2) — DB tidak pernah menerima plaintext                                                 |
| Komentar tidak boleh kosong, maksimal panjang wajar (mis. 1000 karakter)    | Aplikasi (validasi form), meski kolom DB bertipe `TEXT` (tidak ada limit bawaan)                              |
| Artikel tidak bisa `published` tanpa `published_at` terisi                  | Aplikasi (set otomatis saat status diubah ke `PUBLISHED`)                                                     |
| Kategori/tag tidak bisa dihapus jika masih dipakai artikel tanpa konfirmasi | Aplikasi (cek count sebelum hapus) — DB sudah mencegah via `SET NULL`/`RESTRICT`, tapi UX tetap perlu warning |

---

## 9. Catatan & Keterbatasan

- **"Artikel Populer" berbasis 30 hari (FR-HOME-02 di ARCHITECTURE.md) tidak bisa akurat dengan skema saat ini.** Kolom `posts.views` hanya counter kumulatif (all-time), bukan time-series. Dua opsi:
  1. **Sederhanakan** metrik jadi "populer sepanjang waktu" (cukup pakai `views` langsung) — paling murah untuk MVP.
  2. **Tambah tabel log** `post_views (id, post_id, viewed_at)` untuk menghitung populeritas per periode waktu secara akurat — direkomendasikan jika metrik 30-hari benar-benar dibutuhkan, tapi menambah beban write per page view (pertimbangkan batching/queue).

  _Rekomendasi untuk MVP: opsi 1, lalu evaluasi opsi 2 di Phase 2 jika dibutuhkan data analitik lebih presisi._

- **Full-text search** di §7 menggunakan `LIKE`/`ILIKE` sederhana (`contains`) — cukup untuk volume artikel kecil di MVP, tapi tidak efisien dan tidak relevansi-aware untuk skala besar. Lihat §10 untuk upgrade path.

---

## 10. Pertimbangan Skema Masa Depan

| Kebutuhan (Roadmap)                     | Perubahan Skema                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-author (Phase 3)                  | **Tidak perlu migrasi** — `role` enum & `author_id` FK di `posts` sudah mendukung ini sejak MVP                                                                        |
| Full-text search yang lebih baik        | Tambah kolom `tsvector` + index `GIN` di Postgres (mis. `search_vector` pada `posts`), atau migrasi ke layanan search terpisah (Meilisearch/Algolia) jika volume besar |
| AI article recommendation (Phase 3)     | Tambah ekstensi `pgvector`, kolom `embedding vector(1536)` pada `posts` (atau tabel terpisah `post_embeddings`) untuk similarity search                                |
| Analitik populeritas akurat             | Tabel `post_views` log (lihat §9)                                                                                                                                      |
| Monetisasi (jika dipertimbangkan ulang) | Tabel baru `ads` atau `sponsored_posts` — di luar scope V1 sesuai PRD §5                                                                                               |

---

_Dokumen ini melengkapi `PRD-Wisnu-Blog-Lengkap.md` dan `ARCHITECTURE.md`. Update bagian ini setiap kali ada perubahan skema agar tetap menjadi referensi yang akurat untuk tim development._
