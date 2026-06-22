# Wisnu Blog

Personal knowledge blog built with modern web technologies. Share insights, tutorials, and thoughts on technology, productivity, and lifestyle.

## 🚀 Features

- **Fast & SEO-Optimized**: Next.js App Router with SSG/ISR for blazing-fast page loads
- **Beautiful Design System**: Custom design tokens, dark mode support, and premium typography (Fraunces + IBM Plex Sans)
- **Content Management**: Rich article editor with categories, tags, and media manager
- **Admin Dashboard**: Secure admin panel for managing content, comments, and subscribers
- **Responsive**: Mobile-first design with perfect responsive behavior
- **Accessible**: WCAG AA compliant with keyboard navigation and semantic HTML
- **Secure Authentication**: NextAuth with bcrypt password hashing
- **Newsletter Ready**: Subscriber management with email integration support

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **React 19** - Latest React features

### Backend & Database

- **Next.js API Routes** - Serverless backend
- **PostgreSQL** (Supabase) - Relational database
- **Prisma ORM** - Type-safe database access with migrations
- **NextAuth** - Authentication & authorization

### DevOps & Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky + lint-staged** - Git pre-commit hooks
- **Vercel** - Production deployment with preview environments

### Additional Tools

- **Vercel Blob / Cloudinary** - Media storage
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js 18+ & npm/yarn
- GitHub account (for version control)
- Supabase account (PostgreSQL database)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/wisnushaputra/personal-blog.git
cd personal-blog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-key-here"
VERCEL_BLOB_STORAGE_API_TOKEN=""
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Setup Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed initial data (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog.

## 📁 Project Structure

```
wisnu-blog/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── DATABASE.md               # Database schema & design
│   ├── API.md                    # API endpoints documentation
│   ├── STYLEGUIDE.md             # Design system & coding standards
│   ├── PRD.md                    # Product requirements
│   └── TASKS.md                  # Development tasks & roadmap
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Initial seed data
│
├── src/
│   ├── app/
│   │   ├── (public)/             # Public pages (homepage, articles, etc)
│   │   ├── (admin)/              # Admin dashboard (protected)
│   │   ├── (auth)/               # Auth pages (login)
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── page.tsx              # Homepage
│   │
│   ├── components/               # React components
│   │   ├── layout/               # Header, Footer, Navigation
│   │   ├── article/              # Article-related components
│   │   ├── admin/                # Admin-specific components
│   │   └── ui/                   # Reusable UI components
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── seo.ts                # SEO utilities
│   │   └── utils.ts              # Helper functions
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── middleware.ts             # Next.js middleware (route protection)
│   └── types/                    # TypeScript type definitions
│
├── public/
│   └── uploads/                  # Media uploads (fallback)
│
├── .env.example                  # Environment variables template
├── .env.local                    # Environment variables (local dev)
├── .eslintrc.json                # ESLint configuration
├── .prettierrc.json              # Prettier configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies & scripts
```

## 🔧 Development Workflow

### Code Quality

- **Linting**: `npm run lint`
- **Format**: `npm run format`
- **Format check**: `npm run format:check`
- **Type check**: `npm run type-check`

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit with conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update documentation"
   ```
3. Push and create Pull Request
4. Vercel will automatically create a preview deployment

### Conventional Commits

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `chore:` - Dependencies, build tools
- `style:` - Code style (formatting, etc)

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture, tech decisions, and deployment strategy
- **[DATABASE.md](docs/DATABASE.md)** - Database schema, migrations, and example queries
- **[API.md](docs/API.md)** - REST API endpoints and request/response formats
- **[STYLEGUIDE.md](docs/STYLEGUIDE.md)** - Design system, typography, colors, and coding conventions
- **[PRD.md](docs/PRD.md)** - Product requirements and feature roadmap
- **[TASKS.md](docs/TASKS.md)** - Development task breakdown and progress tracking

## 🚀 Deployment

### Preview Deployments

Every Pull Request automatically gets a preview deployment via Vercel. Share the preview URL with team members for testing before merging.

### Production Deployment

```bash
# Merge to main branch
git checkout main
git pull origin main

# Vercel automatically deploys production
```

Environment variables for production are managed in Vercel Project Settings.

## 🔐 Security

- **Passwords**: Hashed with bcrypt before storage
- **Sessions**: JWT-based with httpOnly cookies
- **Rate Limiting**: Applied to authentication endpoints
- **Input Validation**: Server-side validation on all API routes
- **CSRF Protection**: Built-in NextAuth CSRF tokens
- **SQL Injection**: Protected via Prisma ORM parameterized queries

## 📦 Database Setup (Supabase)

### Create Database

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project with PostgreSQL
3. Note your connection credentials
4. Copy connection string to `.env.local`

### Run Migrations

```bash
npx prisma migrate dev --name init
```

### Seed Initial Data

```bash
npx prisma db seed
```

## 📖 Content Management

### Writing Articles

1. Login to admin dashboard (`/dashboard`)
2. Go to Articles → Create New
3. Fill in title, content, category, tags
4. Save as draft or publish immediately
5. Articles support markdown formatting

### Managing Categories & Tags

- Categorize articles for better organization
- Add tags for cross-article discovery
- Edit or delete categories/tags from admin panel

## 🎨 Design System

The blog follows a custom design system with:

- **Colors**: Green ink (#1F6F4A) + Yellow highlighter (#F5C84C)
- **Typography**: Fraunces (headers) + IBM Plex Sans (body)
- **Dark Mode**: Automatic based on system preference with manual toggle
- **Spacing**: 4px base grid system

See [STYLEGUIDE.md](docs/STYLEGUIDE.md) for complete design documentation.

## 📱 Responsive Design

Optimized for all screen sizes:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Wisnu Shaputra**

- GitHub: [@wisnushaputra](https://github.com/wisnushaputra)
- Blog: [wisnu.dev](https://wisnu.dev)

## 🆘 Support

For issues, bugs, or feature requests, please [create an issue](https://github.com/wisnushaputra/personal-blog/issues) on GitHub.

---

**Happy blogging! 🚀**
