# Wisnu Blog

Personal knowledge blog — sharing insights, tutorials, and thoughts on technology, productivity, and lifestyle.

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **NextAuth**.

---

## ✨ Features

- 📝 **Fast & SEO-Optimized** — SSG/ISR rendering for great performance and search visibility
- 🎨 **Beautiful Design** — Custom design system with dark mode support
- 🛡️ **Secure** — NextAuth authentication with bcrypt password hashing
- 📱 **Responsive** — Mobile-first design that works on all devices
- ♿ **Accessible** — WCAG AA compliant with keyboard navigation
- 🗂️ **Content Management** — Admin dashboard for managing articles, categories, tags, and comments
- 📧 **Newsletter Ready** — Subscriber management for email campaigns

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Husky

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design and tech decisions
- **[DATABASE.md](docs/DATABASE.md)** — Database schema and migrations
- **[API.md](docs/API.md)** — REST API endpoints
- **[STYLEGUIDE.md](docs/STYLEGUIDE.md)** — Design system and coding standards
- **[PRD.md](docs/PRD.md)** — Product requirements and features
- **[TASKS.md](docs/TASKS.md)** — Development roadmap

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/wisnushaputra/personal-blog.git
cd personal-blog
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Development

```bash
# Linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build for production
npm run build
```

---

## 🎨 Design System

- **Colors**: Green ink (#1F6F4A) + Yellow highlighter (#F5C84C)
- **Typography**: Fraunces (headers) + IBM Plex Sans (body)
- **Dark Mode**: System preference with manual toggle
- See [STYLEGUIDE.md](docs/STYLEGUIDE.md) for complete details

---

## 🤝 Contributing

Contributions welcome! Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe your feature"
git push origin feature/your-feature
```

---

## 📝 License

MIT License — feel free to use this project as a template for your own blog.

---

**Made with ❤️ by [Wisnu](https://github.com/wisnushaputra)**
