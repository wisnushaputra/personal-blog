# API.md

## Wisnu Blog — API Reference

> Dokumen ini merinci endpoint yang digarisbesarkan di `ARCHITECTURE.md` §10, mengacu pada skema di `DATABASE.md`. API ini dikonsumsi langsung oleh frontend Next.js milik sendiri (bukan public API pihak ketiga), sehingga belum menggunakan prefix versioning (`/api/v1/`) — pertimbangkan ini jika nanti dibuka untuk integrasi eksternal.

---

## Daftar Isi

1. Konvensi Umum
2. Autentikasi
3. Pagination
4. Format Error
5. Posts (Artikel)
6. Categories (Kategori)
7. Tags
8. Comments (Komentar)
9. Subscribers (Newsletter)
10. Media
11. Search
12. Statistics
13. Sitemap & SEO
14. Rate Limiting
15. Catatan & Inkonsistensi yang Perlu Diputuskan

---

## 1. Konvensi Umum

- **Base path:** semua endpoint custom berada di bawah `/api/*`, kecuali `sitemap.xml` dan `robots.txt` yang mengikuti konvensi Next.js di root.
- **Format data:** JSON untuk request & response (kecuali upload media yang memakai `multipart/form-data`).
- **Format respons sukses:**

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

- **Format respons gagal:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email tidak valid"
  }
}
```

- **ID pada path** menggunakan `BigInt` (dikirim/diterima sebagai string di JSON untuk menghindari masalah precision JavaScript).

---

## 2. Autentikasi

Autentikasi admin memakai **NextAuth (Credentials Provider)** dengan session berbasis **httpOnly cookie** (bukan Bearer token) — selaras dengan `ARCHITECTURE.md` §9, karena API ini same-origin dengan frontend.

| Endpoint (dikelola NextAuth, bukan custom) | Deskripsi                                                         |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `POST /api/auth/callback/credentials`      | Login (dipanggil otomatis oleh `signIn()` dari `next-auth/react`) |
| `GET /api/auth/session`                    | Ambil session aktif                                               |
| `POST /api/auth/signout`                   | Logout                                                            |
| `GET /api/auth/csrf`                       | CSRF token (dihandle otomatis oleh NextAuth client)               |

> **Catatan implementasi:** jangan panggil endpoint ini secara manual via `fetch` — gunakan helper `signIn()`, `signOut()`, dan `useSession()` dari `next-auth/react` di frontend.

Untuk endpoint custom (`/api/posts`, `/api/comments`, dst), setiap request yang ditandai **Admin** akan divalidasi via `getServerSession()` di dalam handler. Jika tidak valid:

```json
// 401
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Sesi tidak valid, silakan login kembali" }
}
```

---

## 3. Pagination

Semua endpoint list mendukung query param berikut:

| Param   | Tipe   | Default | Keterangan                         |
| ------- | ------ | ------- | ---------------------------------- |
| `page`  | number | 1       | Halaman ke-                        |
| `limit` | number | 10      | Jumlah item per halaman (maks. 50) |

Respons list selalu menyertakan `meta`:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

---

## 4. Format Error

| HTTP Status | Code               | Kapan terjadi                                          |
| ----------- | ------------------ | ------------------------------------------------------ |
| 400         | `BAD_REQUEST`      | Body/query request tidak sesuai format                 |
| 401         | `UNAUTHORIZED`     | Tidak ada sesi / sesi invalid                          |
| 403         | `FORBIDDEN`        | Sesi valid tapi role tidak diizinkan                   |
| 404         | `NOT_FOUND`        | Resource tidak ditemukan                               |
| 409         | `CONFLICT`         | Slug duplikat, atau kategori/tag masih dipakai artikel |
| 422         | `VALIDATION_ERROR` | Validasi field gagal (mis. email tidak valid)          |
| 429         | `RATE_LIMITED`     | Melebihi batas request (lihat §14)                     |
| 500         | `INTERNAL_ERROR`   | Kesalahan server tak terduga                           |

---

## 5. Posts (Artikel)

### `GET /api/posts` — Publik

List artikel. Hanya status `published` yang dikembalikan untuk request publik; admin yang sudah login bisa filter status lain.

**Query params:** `page`, `limit`, `category` (slug), `tag` (slug), `status` _(khusus admin)_

```json
// 200
{
  "success": true,
  "data": [
    {
      "id": "12",
      "title": "Belajar Java Dasar",
      "slug": "belajar-java-dasar",
      "excerpt": "Pengenalan dasar bahasa Java untuk pemula...",
      "thumbnail": "https://cdn.../java.webp",
      "category": { "id": "2", "name": "Tutorial", "slug": "tutorial" },
      "tags": [{ "id": "5", "name": "Java", "slug": "java" }],
      "publishedAt": "2026-06-10T08:00:00Z",
      "views": 1820
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 34, "totalPages": 4 }
}
```

### `GET /api/posts/[slug]` — Publik

Detail artikel, termasuk komentar berstatus `approved` (nested reply).

```json
// 200
{
  "success": true,
  "data": {
    "id": "12",
    "title": "Belajar Java Dasar",
    "slug": "belajar-java-dasar",
    "content": "<p>...</p>",
    "author": { "name": "Wisnu", "avatar": "https://cdn.../avatar.jpg" },
    "category": { "id": "2", "name": "Tutorial", "slug": "tutorial" },
    "tags": [{ "id": "5", "name": "Java", "slug": "java" }],
    "comments": [
      {
        "id": "101",
        "name": "Andi",
        "content": "Terima kasih, sangat membantu!",
        "createdAt": "2026-06-11T10:00:00Z",
        "replies": []
      }
    ]
  }
}
```

```json
// 404 — slug tidak ditemukan, atau ditemukan tapi statusnya draft/scheduled dan requester bukan admin
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Artikel tidak ditemukan" } }
```

### `POST /api/posts` — Admin

```json
// Request body
{
  "title": "Belajar Java Dasar",
  "slug": "belajar-java-dasar",
  "content": "<p>...</p>",
  "excerpt": "Pengenalan dasar bahasa Java...",
  "thumbnail": "https://cdn.../java.webp",
  "categoryId": "2",
  "tagIds": ["5", "8"],
  "status": "draft"
}
```

```json
// 201
{ "success": true, "data": { "id": "12", "slug": "belajar-java-dasar", "status": "draft" } }
```

```json
// 409 — slug sudah dipakai
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Slug sudah digunakan artikel lain" }
}
```

> Jika `slug` tidak dikirim, sistem auto-generate dari `title`. Jika `status` diubah ke `"published"` tanpa `publishedAt` di body, sistem mengisi otomatis dengan waktu saat ini.

### `PUT /api/posts/[id]` — Admin

Body sama seperti `POST`, field bersifat parsial (hanya field yang ingin diubah). Memicu `revalidatePath()` pada halaman artikel & homepage agar ISR cache ter-update (lihat `ARCHITECTURE.md` §8).

### `DELETE /api/posts/[id]` — Admin

```json
// 200
{ "success": true, "data": { "id": "12", "deleted": true } }
```

> Menghapus artikel akan **cascade** menghapus komentar terkait (lihat `DATABASE.md` §4.6).

---

## 6. Categories (Kategori)

| Method | Endpoint               | Auth   | Keterangan                            |
| ------ | ---------------------- | ------ | ------------------------------------- |
| GET    | `/api/categories`      | Publik | List semua kategori                   |
| POST   | `/api/categories`      | Admin  | Body: `{ name, slug?, description? }` |
| PUT    | `/api/categories/[id]` | Admin  | Update                                |
| DELETE | `/api/categories/[id]` | Admin  | Lihat catatan di bawah                |

```json
// DELETE — 409 jika masih dipakai artikel, tanpa query param force
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "Kategori masih digunakan oleh 8 artikel" }
}
```

```text
DELETE /api/categories/3?force=true
```

> Dengan `force=true`, kategori tetap dihapus dan artikel terkait otomatis menjadi `categoryId: null` (sesuai aturan `SET NULL` di `DATABASE.md` §4.4). Tanpa `force`, request ditolak agar admin sadar dampaknya (selaras FR-ADM-04 di `ARCHITECTURE.md`).

---

## 7. Tags

| Method | Endpoint         | Auth   | Keterangan                                                                                                                                           |
| ------ | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/tags`      | Publik | List semua tag                                                                                                                                       |
| POST   | `/api/tags`      | Admin  | Body: `{ name, slug? }`                                                                                                                              |
| PUT    | `/api/tags/[id]` | Admin  | Update                                                                                                                                               |
| DELETE | `/api/tags/[id]` | Admin  | Langsung hapus — relasi di `post_tags` ikut terhapus otomatis (`CASCADE`), tidak perlu konfirmasi khusus karena artikel tidak jadi "rusak" tanpa tag |

---

## 8. Comments (Komentar)

### `POST /api/comments` — Publik

```json
// Request
{
  "postId": "12",
  "parentId": null,
  "name": "Andi",
  "email": "andi@mail.com",
  "content": "Mantap, terima kasih!"
}
```

```json
// 201 — selalu berstatus pending, menunggu moderasi
{ "success": true, "data": { "id": "101", "status": "pending" } }
```

### `GET /api/comments` — Admin

**Query params:** `status` (`pending` | `approved` | `rejected`), `page`, `limit`

### `PATCH /api/comments/[id]` — Admin

```json
// Request
{ "status": "approved" }
```

### `DELETE /api/comments/[id]` — Admin

> Cascade: menghapus komentar induk ikut menghapus semua balasannya (lihat `DATABASE.md` §4.6 — pertimbangkan `SET NULL` di masa depan jika ingin balasan tetap tampil sebagai "komentar dihapus").

---

## 9. Subscribers (Newsletter)

### `POST /api/subscribers` — Publik

```json
// Request
{ "email": "reader@mail.com" }
```

```json
// 201
{ "success": true, "data": { "email": "reader@mail.com" } }
```

```json
// 200 — jika email sudah subscribe sebelumnya, tidak error, idempotent (upsert)
{ "success": true, "data": { "email": "reader@mail.com", "alreadySubscribed": true } }
```

### `GET /api/subscribers` — Admin

**Query params:** `page`, `limit`, `format=csv` _(jika `csv`, response berupa file download, bukan JSON — sesuai FR-NEWS-03 di PRD)_

### `GET /api/subscribers/unsubscribe?token=...` — Publik

Link unsubscribe yang dikirim di setiap email (FR-NEWS-02 di PRD). `token` berupa **signed JWT** berisi email subscriber (bukan ID mentah) — menghindari kebutuhan kolom token baru di tabel `subscribers`, dan mencegah orang lain bisa unsubscribe-kan email orang lain hanya dengan menebak ID.

```json
// 200
{ "success": true, "data": { "unsubscribed": true } }
```

---

## 10. Media

| Method | Endpoint          | Auth  | Keterangan                                                                                           |
| ------ | ----------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| POST   | `/api/media`      | Admin | `multipart/form-data`, field `file`. Validasi tipe (jpg/png/webp/gif) & ukuran maks. 5MB (FR-ADM-05) |
| GET    | `/api/media`      | Admin | List media, pagination                                                                               |
| DELETE | `/api/media/[id]` | Admin | Hapus file dari storage + record DB                                                                  |

```json
// POST — 201
{ "success": true, "data": { "id": "8", "fileUrl": "https://cdn.../upload-8.webp" } }
```

```json
// 422 — tipe file tidak didukung
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tipe file tidak didukung. Gunakan jpg, png, webp, atau gif"
  }
}
```

---

## 11. Search

### `GET /api/search` — Publik

**Query params:** `q` (wajib), `page`, `limit`

```text
GET /api/search?q=java&page=1&limit=10
```

```json
// 200
{
  "success": true,
  "data": [
    /* array artikel, format sama seperti GET /api/posts */
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

```json
// 200 dengan data kosong jika tidak ditemukan
{ "success": true, "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
```

> Implementasi saat ini memakai `ILIKE` sederhana (lihat `DATABASE.md` §9) — cukup untuk MVP, perlu upgrade ke full-text index/Meilisearch jika volume artikel besar.

---

## 12. Statistics

### `GET /api/stats` — Admin

```json
// 200
{
  "success": true,
  "data": {
    "totalPosts": 34,
    "totalViews": 48210,
    "totalSubscribers": 512,
    "totalComments": 289,
    "pendingComments": 6,
    "popularPosts": [{ "id": "12", "title": "Belajar Java Dasar", "views": 1820 }]
  }
}
```

> `totalViews` & `popularPosts` bersifat all-time (lihat keterbatasan metrik 30-hari di `DATABASE.md` §9).

---

## 13. Sitemap & SEO

| Endpoint           | Keterangan                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /sitemap.xml` | Direkomendasikan diimplementasikan via konvensi Next.js `app/sitemap.ts` (bukan custom route `/api/sitemap.xml` seperti disebut sebelumnya di `ARCHITECTURE.md`) — lebih sederhana karena Next.js otomatis generate format XML yang benar |
| `GET /robots.txt`  | Static file di `public/robots.txt`, mengarahkan ke `sitemap.xml`                                                                                                                                                                          |

---

## 14. Rate Limiting

| Endpoint                                      | Limit                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `POST /api/auth/callback/credentials` (login) | 5 percobaan gagal / 15 menit per IP (FR-ADM-01)                       |
| `POST /api/comments`                          | 5 request / 10 menit per IP                                           |
| `POST /api/subscribers`                       | 3 request / 1 jam per IP                                              |
| Endpoint lain                                 | Tidak dibatasi khusus di MVP, dipertimbangkan jika ada indikasi abuse |

Response saat limit terlampaui:

```json
// 429
{
  "success": false,
  "error": { "code": "RATE_LIMITED", "message": "Terlalu banyak percobaan, coba lagi nanti" }
}
```

---

## 15. Catatan & Inkonsistensi yang Perlu Diputuskan

- **Field "Nama" pada form newsletter (PRD §9) tidak ada di skema `subscribers`** (`DATABASE.md` §4.7 hanya punya `email`). API ini mengikuti skema DB saat ini (hanya `email` wajib). Jika nama subscriber memang ingin disimpan (mis. untuk personalisasi email "Halo, Andi"), perlu tambah kolom `name` di tabel `subscribers` sebelum endpoint `POST /api/subscribers` diubah untuk menerimanya.
- **Endpoint sitemap** sebelumnya ditulis sebagai `/api/sitemap.xml` di `ARCHITECTURE.md` §10 — di dokumen ini saya sarankan pindah ke konvensi `app/sitemap.ts` Next.js yang lebih standar. Perlu update `ARCHITECTURE.md` agar konsisten jika disetujui.
- **Token unsubscribe** menggunakan signed JWT (stateless) sebagai asumsi default, bukan kolom token tersimpan di DB — perlu konfirmasi apakah pendekatan ini cukup, atau tim lebih memilih kolom `unsubscribe_token` tersimpan (lebih mudah di-revoke, tapi butuh migrasi skema).
