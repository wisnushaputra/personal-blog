-- Wisnu Blog — Seed Data
-- Run this in Supabase SQL Editor to populate initial data

-- 1. Insert Admin User (Password: adminpassword123, hashed with bcrypt)
INSERT INTO "users" ("name", "email", "password", "role", "created_at", "updated_at")
VALUES ('Wisnu Shaputra', 'wisnu@example.com', '$2b$10$redacted_bcrypt_hash', 'ADMIN', NOW(), NOW());

-- 2. Insert Categories
INSERT INTO "categories" ("name", "slug", "description")
VALUES 
  ('Teknologi', 'teknologi', 'Artikel seputar dunia IT, pengembangan perangkat lunak, dan teknologi terbaru.'),
  ('Pendidikan', 'pendidikan', 'Catatan akademis, pembelajaran, dan tips edukasi.'),
  ('Tutorial', 'tutorial', 'Panduan teknis langkah demi langkah yang mudah diikuti.'),
  ('Opini', 'opini', 'Opini, pemikiran, dan pandangan pribadi mengenai berbagai topik.'),
  ('Lifestyle', 'lifestyle', 'Gaya hidup, produktivitas, manajemen waktu, dan catatan harian.');

-- 3. Insert Tags
INSERT INTO "tags" ("name", "slug")
VALUES 
  ('JavaScript', 'javascript'),
  ('Next.js', 'nextjs'),
  ('Produktivitas', 'produktivitas');

-- 4. Insert Sample Published Posts
-- Get the user ID and category IDs (adjust these IDs based on actual inserted values)
INSERT INTO "posts" ("title", "slug", "content", "excerpt", "status", "author_id", "category_id", "published_at", "created_at", "updated_at")
VALUES 
  (
    'Membangun Blog Personal dengan Next.js dan Supabase',
    'membangun-blog-personal-dengan-nextjs-dan-supabase',
    'Membangun blog personal merupakan salah satu cara terbaik untuk mendokumentasikan perjalanan belajar Anda. Dalam artikel ini, kita akan membahas cara membuat blog dengan Next.js 15 (App Router) dan Supabase PostgreSQL.

Kita menggunakan Prisma ORM untuk interaksi database yang aman dan type-safe, serta Tailwind CSS untuk membuat tampilan visual yang menarik dan responsif. Keuntungan utama dari arsitektur Next.js adalah kemampuannya melakukan rendering statis (SSG) dan revalidasi berkala (ISR), membuat blog kita sangat cepat diakses dan ramah SEO.',
    'Panduan lengkap langkah demi langkah membuat blog personal modern menggunakan Next.js App Router, Tailwind CSS, dan Supabase PostgreSQL.',
    'PUBLISHED',
    1,
    1,
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'Tips Meningkatkan Produktivitas Coding Setiap Hari',
    'tips-meningkatkan-produktivitas-coding-setiap-hari',
    'Menjadi developer yang produktif bukan berarti menulis kode selama 12 jam sehari tanpa henti. Produktivitas adalah tentang bagaimana Anda bekerja secara cerdas dan fokus.

Berikut beberapa tips sederhana yang bisa langsung dicoba:
1. **Gunakan Shortcut Keyboard**: Kurangi ketergantungan pada mouse.
2. **Kelola Tugas dengan Task List**: Gunakan dokumen terstruktur seperti TASKS.md untuk melacak progress harian Anda.
3. **Hindari Multitasking**: Fokus pada satu task/fitur sebelum berpindah ke task berikutnya.

Semoga tips ini membantu Anda tetap fokus dan termotivasi setiap hari!',
    'Tiga tips praktis dan mudah diterapkan untuk membantu Anda bekerja lebih efisien sebagai developer.',
    'PUBLISHED',
    1,
    3,
    NOW(),
    NOW(),
    NOW()
  );

-- 5. Associate Tags with Posts
-- Note: Adjust post IDs (1, 2) and tag IDs (1, 2, 3) based on actual inserted values
INSERT INTO "post_tags" ("post_id", "tag_id")
VALUES 
  (1, 1), -- Post 1: JavaScript tag
  (1, 2), -- Post 1: Next.js tag
  (2, 3); -- Post 2: Produktivitas tag

-- Note: For the bcrypt hash of password "adminpassword123", use:
-- $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Gy32S
-- (This is a test hash only - change in production!)
