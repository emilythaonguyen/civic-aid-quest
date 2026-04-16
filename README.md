# Civic Aid Quest
**An AI-Orchestrated Community Service Portal**

Civic Aid Quest is a modern, full-stack application designed to bridge the gap between citizens and local government services. This project highlights a cutting-edge **AI-first development workflow**, utilizing AI orchestration for rapid prototyping followed by manual human refactoring for security and production readiness.

## 🚀 The AI-Human Workflow
This repository demonstrates professional **AI Orchestration**:
- **Scaffolding:** Initial UI components and database schemas were generated via **Lovable**, allowing the team to iterate on the product vision in record time.
- **Refinement:** Following the export, our team performed critical "last-mile" engineering, including:
  - **Security Hardening:** Migrated hardcoded Supabase credentials to protected environment variables.
  - **Dependency Optimization:** Removed proprietary AI-tracking packages to streamline the build process.
  - **Metadata & SEO:** Customized the application manifest, social sharing tags, and branding for a unique project identity.

## 🛠 Tech Stack
- **Frontend:** React + TypeScript + Vite
- **UI Architecture:** Tailwind CSS + shadcn/ui (Radix Primitives)
- **State Management:** TanStack Query (React Query)
- **Backend-as-a-Service:** Supabase (Auth, Database, & Edge Functions)
- **Testing:** Vitest (Unit) & Playwright (E2E)

## 🏗 High-Level Architecture
- **Auth & Role-Based Access:** Managed via `src/contexts/AuthContext.tsx`. Users are routed based on roles (`citizen`, `staff`, or `manager`) stored in the Supabase `profiles` table.
- **Translation Pipeline:** Leverages Supabase Edge Functions to provide real-time multilingual support, ensuring accessibility for all citizens.
- **Protected Routing:** A centralized router in `App.tsx` handles complex permission logic for staff-only dashboards.

## 👥 Contributors
- **Emily Nguyen** - AI & Automation
- **Eli Dross** - UI/UX & Component Styling
- **Connor Doyle** - Database Architect & Supabase Integration
- **Nicholas Varghese** - QA & Analytics

## ⚙️ Setup Instructions
1. **Clone the repository.**
2. **Install dependencies:** `npm install`
3. **Configure Environment Variables:** Create a `.env` file in the root directory and add your Supabase credentials:
   ```text
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. **Run development server:** `npm run dev`
