  <h3 align="center">Rayan Academy </h3>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)

## <a name="introduction">🤖 Introduction</a>

Rayan Academy is dedicated to guiding non-Arabic speakers on their journey toward understanding the Quran, mastering the Arabic language, and exploring various Islamic topics. The academy offers a structured and supportive learning environment, aiming to foster both spiritual and intellectual growth.

With a focus on personalized education, Rayan Academy tailors its courses to meet the needs of each student, ensuring that learners of all backgrounds can connect deeply with the teachings of Islam. The academy’s mission is to equip students with the tools they need to recite the Quran with precision, comprehend the Arabic language fluently, and develop a strong foundation in Islamic knowledge.

Through expert instructors and a well-rounded curriculum, Rayan Academy aspires to nurture a global community of learners who embody the values of the Quran and the teachings of Islam.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- TypeScript
- Prisma
- Zustand
- React Hook Form
- Zod
- TailwindCSS

## <a name="backend-integration">🧩 Backend Integration</a>

This project now integrates with a separate backend service running at `NEXT_PUBLIC_BACKEND_URL`.

Add the following to your local environment file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

The contact form and several schedule/attendance flows now call the backend directly and forward the Supabase auth access token.
