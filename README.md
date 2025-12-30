This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

This project uses **PostgreSQL** with **Prisma ORM**.

#### Configure Database Connection

Edit the `.env` file and add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Example for local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/entrenador_db?schema=public"
```

**Example for Vercel Postgres or cloud database:**
```env
DATABASE_URL="your_connection_string_here"
```

#### Run Database Migrations

```bash
# Create the database tables
pnpm prisma migrate dev --name init

# Generate Prisma Client
pnpm prisma generate
```

#### Seed Database (Optional)

Create sample data for testing:

```bash
pnpm prisma db seed
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Models

The application includes the following models:

- **User**: Admin and user accounts (no public registration)
- **Plan**: 5 fitness plans displayed publicly
- **Enrollment**: User's active plan cycle with start/end dates
- **Progress**: Weight/measurements tracked every 15 days
- **Media**: Initial photos and progress videos (day 1 & final)
- **Document**: PDF files for diet and exercise routines
- **TrainerComment**: Admin observations visible to users
- **Exercise**: Exercise catalog (for future features)
- **ExerciseLog**: Daily exercise tracking with sets/reps/weight

## Prisma Commands

```bash
# Open Prisma Studio (visual database editor)
pnpm prisma studio

# Create a new migration after schema changes
pnpm prisma migrate dev --name description_of_changes

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Pull schema from existing database
pnpm prisma db pull

# Push schema without migrations (for prototyping)
pnpm prisma db push
```

## Project Structure

```
app/                    # Next.js App Router pages
  ├── page.tsx         # Home page (public)
  └── reto-fitness/    # Challenge landing page
components/            # Reusable UI components
lib/
  ├── prisma.ts       # Prisma client singleton
  └── utils.ts        # Utility functions
prisma/
  └── schema.prisma   # Database schema definition
public/               # Static assets
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
