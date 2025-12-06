Assumptions: We are using bun as the runtime, and nextjs as the framework

### Architecture
We are using the following architecture:
- Nextjs as the framework
- Nextjs routes for api routes and pages
- Bun as the runtime
- Prisma as the ORM
- Postgresql as the database(i.e NeonDB)
- Tailwind CSS as the styling
- @shadcn/ui as the component library
- Dnd-kit as the drag and drop library
- Zod as the validation library
- Better Auth as the authentication library
- Supabase as the storage(uploading images and videos) library



### Features:
- Authentication
- Company Management
- Job Management
- Preview and Share
- Drag and Drop sections and reordering
- SEO Optimized
- Mobile Responsive
- Accessible


### Database Schema:

The database consists of 7 main tables organized into two categories: authentication tables and business logic tables.

### Authentication Tables (Better Auth):
- user: Stores user account information including name, email, and profile image. Each user can have one company.
- session: Stores active user sessions with tokens, expiration dates, and device information. Related to user via userId.
- account: Stores OAuth provider accounts (like Google) linked to users. Contains access tokens and refresh tokens. Related to user via userId.
- verification: Stores email verification tokens and other verification codes. Standalone table.

### Business Logic Tables:
- Company: Stores company information including name, slug (URL identifier), branding (logo, banner, colors), culture video URL, and description. Each company belongs to one user (one-to-one relationship via userId).

- section: Stores customizable content sections for companies (Hero, About, Culture, Jobs). Each section belongs to one company (many-to-one relationship via companyId). Sections have an order field for drag-and-drop reordering and an isVisible flag for toggling visibility.

- job: Stores job listings with details like title, description, location, job type, work mode, department, salary range (stored as JSON), and application URL. Each job belongs to one company (many-to-one relationship via companyId). Has an isActive flag to control visibility.

### Relationships:
- user (1) -> (1) Company: One user can manage one company
- user (1) -> (many) session: One user can have multiple active sessions
- user (1) -> (many) account: One user can have multiple OAuth accounts
- Company (1) -> (many) section: One company can have multiple sections
- Company (1) -> (many) job: One company can have multiple job listings

All relationships use cascade delete, meaning if a user is deleted, their company, sessions, and accounts are also deleted. If a company is deleted, all its sections and jobs are deleted.

### Indexes:
- section table has a composite index on (companyId, order) for efficient section ordering queries
- job table has a composite index on (companyId, isActive) for efficient job filtering queries
- user.email is unique
- Company.slug is unique
- session.token is unique
- account has a unique constraint on (providerId, accountId)

