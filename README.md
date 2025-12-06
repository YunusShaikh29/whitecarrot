#  Careers Page Builder

A modern, full-featured careers page builder that helps companies create branded careers pages with customizable sections, job listings, and seamless candidate experience.



##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YunusShaikh29/whitecarrot.git
cd whitecarrot
```

### 2. Install Dependencies

**Using Bun (recommended):**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

**Don't have Bun? Install it:**
```bash
npm install -g bun
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your-random-secret-key-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

```

### 4. Get Your API Keys

#### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type** to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
7. Copy the **Client ID** and **Client Secret** to your `.env` file

#### Supabase Setup
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key** to your `.env` file
4. Create a storage bucket named `company-assets`:
   - Go to **Storage** → **Create bucket**
   - Name: `company-assets`
   - Make it **Public** (or configure policies as needed)

#### Database Setup
1. Create a PostgreSQL database (use [Neon](https://neon.tech/), [Supabase](https://supabase.com/), [Railway](https://railway.app/), or your own server)
2. Copy the connection string to `DATABASE_URL` in your `.env` file
3. **Important:** For Neon and other cloud providers, use the connection pooling URL if available

#### Generate BETTER_AUTH_SECRET
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Run Database Migrations

```bash
# Using Bun
bunx prisma migrate deploy

```

Migrations will create all the necessary tables in your database.

### 6. Generate Prisma Client

```bash
# Using Bun
bunx prisma generate

```

> run it with dev command.

### 7. Start the Development Server

```bash
# Using Bun
bun run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Project Structure

```
whitecarrot/
├── app/
│   ├── [company-slug]/
│   │   ├── careers/          # Public careers page
│   │   ├── edit/             # Recruiter editing interface
│   │   └── preview/          # Preview page
│   ├── api/
│   │   ├── auth/             # Authentication routes
│   │   ├── companies/        # Company CRUD operations
│   │   ├── public/           # Public API routes
│   │   └── upload/           # Image upload handler
│   ├── dashboard/            # Recruiter dashboard
│   └── page.tsx              # Landing page
├── components/
│   ├── CompanyBrandSettings.tsx
│   ├── CompanyImageSettings.tsx
│   ├── JobCard.tsx
│   ├── JobForm.tsx
│   ├── JobManager.tsx
│   ├── SectionCard.tsx
│   ├── SectionEditor.tsx
│   ├── SectionManager.tsx
│   └── SectionRenderer.tsx
├── lib/
│   ├── auth.ts               # Better Auth configuration
│   ├── auth-client.ts        # Client-side auth
│   ├── db.ts                 # Prisma client
│   └── supabase.ts           # Supabase client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── public/                   # Static assets
```

##  Usage - What I built in this project

### For Recruiters

1. **Sign In:** Click "Continue with Google" on the landing page
2. **Create Company:** If you don't have a company, create one from the dashboard
3. **Customize Brand:**
   - Upload logo and banner images
   - Set primary and secondary brand colors
   - Add culture video URL (YouTube/Vimeo)
4. **Manage Sections:**
   - Add Hero, About, or Culture sections
   - Drag and drop to reorder
   - Edit content and toggle visibility
5. **Add Jobs:**
   - Create job listings with details
   - Set salary ranges, location, job type, work mode
   - Toggle active/inactive status
6. **Preview & Share:**
   - Preview your careers page
   - Share the public URL: `/{company-slug}/careers`

### For Candidates

1. Visit the public careers page: `/{company-slug}/careers`
2. Browse company information and culture
3. Search and filter jobs
4. Click "Apply Now" to be redirected to the application URL

