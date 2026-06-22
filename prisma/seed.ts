import { PrismaClient, Role, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding... 🚀');

  // Clean up existing data in reverse order of relations
  await prisma.comment.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.subscriber.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned up existing database tables.');

  // 1. Seed Admin User
  // Default password: adminpassword123 (please change in production)
  const hashedPassword = await bcrypt.hash('adminpassword123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Wisnu Shaputra',
      email: 'wisnu@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 2. Seed Categories
  const tech = await prisma.category.create({
    data: {
      name: 'Teknologi',
      slug: 'teknologi',
      description: 'Artikel seputar dunia IT, pengembangan perangkat lunak, dan teknologi terbaru.',
    },
  });
  await prisma.category.create({
    data: {
      name: 'Pendidikan',
      slug: 'pendidikan',
      description: 'Catatan akademis, pembelajaran, dan tips edukasi.',
    },
  });
  const tutorial = await prisma.category.create({
    data: {
      name: 'Tutorial',
      slug: 'tutorial',
      description: 'Panduan teknis langkah demi langkah yang mudah diikuti.',
    },
  });
  await prisma.category.create({
    data: {
      name: 'Opini',
      slug: 'opini',
      description: 'Opini, pemikiran, dan pandangan pribadi mengenai berbagai topik.',
    },
  });
  await prisma.category.create({
    data: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Gaya hidup, produktivitas, manajemen waktu, dan catatan harian.',
    },
  });
  console.log('Created categories.');

  // 3. Seed Tags
  const js = await prisma.tag.create({
    data: { name: 'JavaScript', slug: 'javascript' },
  });
  const nextjs = await prisma.tag.create({
    data: { name: 'Next.js', slug: 'nextjs' },
  });
  const prod = await prisma.tag.create({
    data: { name: 'Produktivitas', slug: 'produktivitas' },
  });
  console.log('Created tags.');

  // 4. Seed Published Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Membangun Blog Personal dengan Next.js dan Supabase',
      slug: 'membangun-blog-personal-dengan-nextjs-dan-supabase',
      content: `Membangun blog personal merupakan salah satu cara terbaik untuk mendokumentasikan perjalanan belajar Anda. Dalam artikel ini, kita akan membahas cara membuat blog dengan Next.js 15 (App Router) dan Supabase PostgreSQL.\n\nKita menggunakan Prisma ORM untuk interaksi database yang aman dan type-safe, serta Tailwind CSS untuk membuat tampilan visual yang menarik dan responsif. Keuntungan utama dari arsitektur Next.js adalah kemampuannya melakukan rendering statis (SSG) dan revalidasi berkala (ISR), membuat blog kita sangat cepat diakses dan ramah SEO.`,
      excerpt:
        'Panduan lengkap langkah demi langkah membuat blog personal modern menggunakan Next.js App Router, Tailwind CSS, dan Supabase PostgreSQL.',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      categoryId: tech.id, // Use tech category
      publishedAt: new Date(),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Tips Meningkatkan Produktivitas Coding Setiap Hari',
      slug: 'tips-meningkatkan-produktivitas-coding-setiap-hari',
      content: `Menjadi developer yang produktif bukan berarti menulis kode selama 12 jam sehari tanpa henti. Produktivitas adalah tentang bagaimana Anda bekerja secara cerdas dan fokus.\n\nBerikut beberapa tips sederhana yang bisa langsung dicoba:\n1. **Gunakan Shortcut Keyboard**: Kurangi ketergantungan pada mouse.\n2. **Kelola Tugas dengan Task List**: Gunakan dokumen terstruktur seperti TASKS.md untuk melacak progress harian Anda.\n3. **Hindari Multitasking**: Fokus pada satu task/fitur sebelum berpindah ke task berikutnya.\n\nSemoga tips ini membantu Anda tetap fokus dan termotivasi setiap hari!`,
      excerpt:
        'Tiga tips praktis dan mudah diterapkan untuk membantu Anda bekerja lebih efisien sebagai developer.',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      categoryId: tutorial.id, // Use tutorial category
      publishedAt: new Date(),
    },
  });
  console.log('Created sample published posts.');

  // 5. Associate Tags to Posts
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: js.id },
      { postId: post1.id, tagId: nextjs.id },
      { postId: post2.id, tagId: prod.id },
    ],
  });
  console.log('Associated tags with sample posts.');

  console.log('Seeding completed successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
