<h1 align="center">🧑‍💻 DevConnect</h1>

<p align="center">
  <b>A Developer Community Platform</b><br>
  Built with <code>Turborepo</code>, <code>Next.js</code>, <code>Express</code>, <code>Prisma</code>, <code>Cloudinary</code> and more.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Monorepo-Turborepo-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-informational?style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-Express-lightgrey?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma" />
</p>

---

## ✨ Overview

**DevConnect** is a full-stack developer platform inspired by **LinkedIn**, **Medium**, and **GitHub Discussions**. It allows developers to:

- Connect via profiles
- Share markdown-based blogs
- Participate in Q&A discussions
- Schedule & attend virtual events
- Chat in real time

---

## 🧱 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Monorepo     | Turborepo  |
| Frontend     | Next.js, Tailwind CSS, React Query |
| Backend      | Node.js, Express, Prisma |
| Database     | PostgreSQL |
| Auth         | JWT, Google OAuth (WIP) |
| Images       | Cloudinary + Multer |
| Realtime     | WebSocket / Socket.IO |
| Deployment   | Vercel (web), Railway/Render (api) |
| DevOps       | Docker, GitHub Actions (CI/CD) |

---

## 📁 Folder Structure


---

## ✅ Features

### 👤 Authentication
- JWT-based auth
- Role-based permissions (Admin, User, Moderator)
- Google OAuth (planned)
- Password reset via email (planned)

### 📝 Blogging
- Markdown blog editor
- Edit/delete posts
- Likes, bookmarks, comments

### 💬 Discussions
- Q&A similar to StackOverflow
- Upvote/downvote answers

### 📅 Events
- Create & RSVP to events
- Google Meet/Zoom support
- Calendar view (frontend)

### 📸 Image Uploads
- Profile pictures, banners, blog images
- Cloudinary with file type/size validation
- Stored via Multer and stream upload

### 🔔 Notifications
- Real-time WebSocket notifications (likes, follows, etc.)
- Dismissible and persistent

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone (https://github.com/Aditya-rajput200/Dev-flow.git)
cd devconnect
