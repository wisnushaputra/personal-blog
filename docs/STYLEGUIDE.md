# STYLEGUIDE.md

## Wisnu Blog — Panduan Gaya (Visual, Kode, & Editorial)

> Dokumen ini melengkapi `ARCHITECTURE.md` (yang baru menyebut "Tailwind CSS" tanpa detail) dengan identitas visual konkret, konvensi kode, dan panduan menulis artikel. Palet warna & tipografi di sini adalah **proposal awal** yang dirancang khusus untuk konsep "catatan pengetahuan" dari PRD — bukan default generik — dan terbuka untuk direvisi sesuai preferensi Wisnu.

---

## Daftar Isi

1. Konsep & Rasionalisasi Desain
2. Design Tokens (Warna)
3. Tipografi
4. Komponen Signature
5. Spacing & Layout
6. Konvensi Kode (TypeScript/React/Next.js)
7. Konvensi Tailwind CSS
8. Linting & Formatting
9. Konvensi Git
10. Style Guide Editorial (Menulis Artikel)
11. Aksesibilitas
12. Catatan & Keputusan yang Diambil

---

## 1. Konsep & Rasionalisasi Desain

Tema visual: **"catatan yang ditandai"** — menghidupkan kalimat di PRD _"menyimpan catatan pengetahuan"_ secara literal. Metafora yang dipakai adalah buku catatan/textbook yang sudah ditandai stabilo saat belajar: ada warna highlighter yang konsisten di light & dark mode, dan komponen "catatan pinggir" (margin note) untuk opini/tips penulis.

Ini dipilih secara sadar untuk menghindari tiga pola visual generik yang sering muncul di desain AI: (1) krem hangat + serif kontras + aksen terracotta, (2) hampir-hitam + satu aksen neon, (3) gaya broadsheet dengan garis tipis. Wisnu Blog memakai **hijau tinta + kuning highlighter** sebagai identitas, dengan latar netral (bukan krem) baik di mode terang maupun gelap.

---

## 2. Design Tokens (Warna)

### Light Mode

| Token               | Hex       | Penggunaan                                  |
| ------------------- | --------- | ------------------------------------------- |
| `--color-bg`        | `#F7F7F2` | Latar halaman                               |
| `--color-surface`   | `#FFFFFF` | Card, kotak komentar                        |
| `--color-ink`       | `#1C1B17` | Teks utama                                  |
| `--color-muted`     | `#6B6A63` | Teks sekunder (tanggal, meta)               |
| `--color-accent`    | `#1F6F4A` | Link, tombol primer, kategori               |
| `--color-highlight` | `#F5C84C` | Tag, mark/highlight teks, signature element |
| `--color-border`    | `#E4E2DA` | Garis pembatas, divider                     |

### Dark Mode

| Token               | Hex       | Penggunaan                                                  |
| ------------------- | --------- | ----------------------------------------------------------- |
| `--color-bg`        | `#15171A` | Latar halaman                                               |
| `--color-surface`   | `#1D2024` | Card, kotak komentar                                        |
| `--color-ink`       | `#ECEAE3` | Teks utama                                                  |
| `--color-muted`     | `#8B8A82` | Teks sekunder                                               |
| `--color-accent`    | `#4FBE89` | Link, tombol primer, kategori                               |
| `--color-highlight` | `#F5C84C` | Sama seperti light mode — menjaga identitas brand konsisten |
| `--color-border`    | `#2B2F34` | Garis pembatas, divider                                     |

**Implementasi CSS variables:**

```css
:root {
  --color-bg: #f7f7f2;
  --color-surface: #ffffff;
  --color-ink: #1c1b17;
  --color-muted: #6b6a63;
  --color-accent: #1f6f4a;
  --color-highlight: #f5c84c;
  --color-border: #e4e2da;
}

[data-theme='dark'] {
  --color-bg: #15171a;
  --color-surface: #1d2024;
  --color-ink: #eceae3;
  --color-muted: #8b8a82;
  --color-accent: #4fbe89;
  --color-highlight: #f5c84c;
  --color-border: #2b2f34;
}
```

**Mapping ke `tailwind.config.js`:**

```js
theme: {
  extend: {
    colors: {
      bg: "var(--color-bg)",
      surface: "var(--color-surface)",
      ink: "var(--color-ink)",
      muted: "var(--color-muted)",
      accent: "var(--color-accent)",
      highlight: "var(--color-highlight)",
      border: "var(--color-border)",
    },
  },
}
```

> Toggle dark mode menambah/menghapus atribut `data-theme="dark"` di elemen `<html>`, lalu menyimpan preferensi di `localStorage` (sesuai PRD §10).

---

## 3. Tipografi

| Role    | Font              | Penggunaan                                 |
| ------- | ----------------- | ------------------------------------------ |
| Display | **Fraunces**      | Judul artikel, judul section besar (H1/H2) |
| Body    | **IBM Plex Sans** | Paragraf, navigasi, UI umum                |
| Mono    | **IBM Plex Mono** | Code block, slug preview, angka statistik  |

**Alasan pemilihan:** Fraunces punya karakter (sedikit quirky di angka & kontras stroke) yang membuat judul artikel terasa personal, bukan netral seperti font sistem. IBM Plex Sans dipilih karena nyaman dibaca panjang dan punya pasangan Mono dari keluarga yang sama — penting karena banyak artikel berisi tutorial coding, sehingga transisi visual antara teks biasa dan code block tetap terasa satu keluarga.

**Type scale:**
| Elemen | Size (rem) | Weight | Font |
|---|---|---|---|
| H1 (judul artikel) | 2.5 | 600 | Fraunces |
| H2 | 1.75 | 600 | Fraunces |
| H3 | 1.25 | 600 | IBM Plex Sans |
| Body | 1.0 | 400 | IBM Plex Sans |
| Small/meta | 0.875 | 400 | IBM Plex Sans |
| Code inline/block | 0.9 | 400 | IBM Plex Mono |

---

## 4. Komponen Signature

### "Catatan Wisnu" — callout box

Dipakai untuk opini/tips penulis di tengah artikel, meniru catatan pinggir buku:

```text
┌─ border-left 4px, warna highlight ──────────┐
│  💬 Catatan Wisnu                            │
│  Teks opini/tips penulis di sini, italic.    │
└──────────────────────────────────────────────┘
```

- Background: `--color-surface` dengan border kiri 4px `--color-highlight`.
- Ikon konsisten (mis. 💬 atau ikon "sticky-note" dari `lucide-react`).

### Inline highlight (`<mark>`)

Untuk menandai istilah kunci dalam paragraf:

```css
mark {
  background-color: color-mix(in srgb, var(--color-highlight) 35%, transparent);
  color: var(--color-ink);
  padding: 0 2px;
}
```

### Tag chip

Tag artikel dirender seperti label kertas, bukan pill standar Tailwind default — sudut membulat kecil (4px, bukan full-rounded) dengan border tipis `--color-border`, agar terasa seperti label fisik bukan badge generik UI kit.

---

## 5. Spacing & Layout

- **Grid dasar:** skala 4px (Tailwind default `spacing` scale dipakai apa adanya, tanpa custom override — cukup untuk kebutuhan blog).
- **Lebar konten artikel:** maksimal `65ch` agar nyaman dibaca (jangan full-width di desktop).
- **Jarak antar paragraf:** 1.25rem.
- **Container halaman:** maks. `1200px`, padding horizontal `1rem` (mobile) – `2rem` (desktop).

---

## 6. Konvensi Kode (TypeScript/React/Next.js)

| Elemen                     | Konvensi                                                                                                  | Contoh                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Nama file komponen         | PascalCase                                                                                                | `ArticleCard.tsx`                |
| Nama file utilitas/hook    | camelCase                                                                                                 | `useTheme.ts`, `formatDate.ts`   |
| Nama komponen              | PascalCase                                                                                                | `function ArticleCard() {}`      |
| Nama fungsi/variabel       | camelCase                                                                                                 | `getPublishedPosts()`            |
| Konstanta global           | UPPER_SNAKE_CASE                                                                                          | `MAX_UPLOAD_SIZE_MB`             |
| Tipe & interface           | PascalCase, prefix `T`/tanpa prefix konsisten                                                             | `type PostWithRelations = {...}` |
| Server vs Client Component | Default Server Component; tambahkan `"use client"` hanya jika perlu interaktivitas (state, event handler) | —                                |

**Prinsip:**

- Fetch data (Prisma) hanya di Server Component atau API Route — **jangan** import `prisma` di Client Component (lihat `ARCHITECTURE.md` §6, aturan dependensi layer).
- Komponen presentasional (UI murni) dipisah dari komponen yang fetch data, agar mudah di-test & dipakai ulang.
- Hindari prop drilling lebih dari 2 level — pertimbangkan context atau composition.

---

## 7. Konvensi Tailwind CSS

- Gunakan token warna kustom (`bg-accent`, `text-ink`, dst — lihat §2) daripada warna Tailwind default (`bg-green-700`) agar tetap konsisten dengan design tokens dan otomatis ikut berubah saat dark mode.
- Urutan class diotomasi dengan **`prettier-plugin-tailwindcss`** — jangan urutkan manual.
- Hindari nilai arbitrary (`w-[123px]`) kecuali benar-benar tidak ada token yang cocok di scale.
- Komponen berulang (≥3 kali dipakai dengan className sama) sebaiknya diekstrak jadi komponen React, bukan di-copy class-nya berulang.

---

## 8. Linting & Formatting

| Tool                                     | Fungsi                                         |
| ---------------------------------------- | ---------------------------------------------- |
| ESLint (`eslint-config-next`)            | Linting dasar Next.js + aturan React Hooks     |
| Prettier + `prettier-plugin-tailwindcss` | Format kode otomatis + urutan class Tailwind   |
| Husky + lint-staged                      | Jalankan lint & format otomatis sebelum commit |

**Rekomendasi `lint-staged` config:**

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

---

## 9. Konvensi Git

**Commit message** — mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: tambah fitur dark mode toggle
fix: perbaiki bug pagination di halaman kategori
docs: update API.md untuk endpoint subscribers
refactor: pisahkan logic search ke lib/search.ts
chore: update dependency prisma
```

**Branch naming:**

```text
feature/dark-mode
fix/pagination-bug
docs/update-api-md
```

---

## 10. Style Guide Editorial (Menulis Artikel)

### Bahasa & Tone

- Bahasa Indonesia, gaya **santai tapi jelas** — seperti menjelaskan ke teman, bukan jurnal akademik maupun marketing copy yang menjual.
- Istilah teknis bahasa Inggris yang sudah umum (mis. _deploy_, _array_, _state_) boleh dipakai langsung tanpa dipaksa diterjemahkan; istilah yang kurang umum di-_italic_-kan saat pertama disebut.
- Sapaan ke pembaca: gunakan "kamu", konsisten di seluruh artikel (hindari campur "kamu"/"Anda" dalam satu artikel).

### Struktur Artikel

- **H1** hanya judul artikel (otomatis dari field `title`, jangan ditulis manual di body).
- **H2** untuk bagian utama, **H3** untuk sub-bagian — jangan lompat level (H2 langsung ke H4).
- Paragraf pendek, 3–4 kalimat. Gunakan **numbered list** untuk langkah tutorial yang berurutan, **bullet list** untuk poin yang tidak berurutan.
- Setiap artikel tutorial diakhiri bagian **"Kesimpulan"** atau **"Penutup"** singkat — bukan dipotong tiba-tiba.

### Code Block

- Selalu beri label bahasa untuk syntax highlighting: ` ```js `, ` ```python `, dll. — jangan ` ``` ` polos.
- Potongan kode yang merujuk file nyata diberi komentar nama file di baris pertama jika relevan, mis. `// app/page.tsx`.

### Gambar

- **Alt text wajib**, deskriptif (mis. `"Tangkapan layar dashboard admin menampilkan daftar artikel"`), bukan nama file (`image1.png`) — selaras dengan Non-Functional Requirements di PRD §15.
- Format **WebP** disarankan untuk ukuran file lebih kecil; upload lewat Media Manager (lihat `API.md` §10), bukan hotlink dari sumber luar.

### Judul, Slug, Kategori, Tag

- Judul jelas dan deskriptif, hindari clickbait berlebihan (sesuai nada blog: berbagi ilmu, bukan mengejar klik).
- Slug otomatis dari judul (lowercase, dash-separated); edit manual hanya jika judul terlalu panjang atau mengandung karakter ambigu.
- **Satu kategori wajib** per artikel (lihat keputusan di `DATABASE.md` §1), **2–5 tag** relevan — hindari over-tagging yang membuat tag jadi tidak bermakna.

### Tautan Eksternal

- Tautan ke domain luar dibuka di tab baru dengan `rel="noopener noreferrer"`.
- Sumber yang dikutip (statistik, kode pihak ketiga) selalu disebutkan sumbernya.

---

## 11. Aksesibilitas

- Kontras warna token di §2 sudah memenuhi rasio **WCAG AA** untuk teks normal terhadap latar masing-masing mode — verifikasi ulang jika token diubah.
- Semua elemen interaktif (toggle dark mode, tombol share, form komentar) punya **focus state** yang terlihat saat navigasi keyboard.
- Status (komentar pending/approved, artikel draft/published) tidak hanya dibedakan lewat warna — selalu disertai label teks, karena warna saja tidak cukup untuk pembaca dengan gangguan persepsi warna.
- `prefers-reduced-motion` dihormati untuk animasi transisi (mis. animasi toggle dark mode dipercepat/dihilangkan jika user mengaktifkan setting ini di OS).

---

## 12. Catatan & Keputusan yang Diambil

- Palet warna, tipografi, dan komponen signature di dokumen ini adalah **proposal desain awal** — PRD dan ARCHITECTURE.md sebelumnya hanya menyebut "Tailwind CSS" tanpa arah visual konkret. Karena ini menyangkut identitas brand personal Wisnu, sebaiknya direview langsung olehnya sebelum diimplementasikan, terutama pemilihan warna hijau+kuning highlighter sebagai signature.
- Font **Fraunces**, **IBM Plex Sans**, dan **IBM Plex Mono** semuanya tersedia gratis di Google Fonts — tidak ada biaya lisensi tambahan.
- Jika ke depannya dibutuhkan ikon, dokumen ini merekomendasikan **`lucide-react`** karena ringan dan stylenya netral (cocok dikombinasikan dengan identitas visual apa pun), bukan keharusan teknis.
