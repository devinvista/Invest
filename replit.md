# replit.md

## Overview

OrçaFácil is a comprehensive personal finance management application built with a modern full-stack architecture. The application provides Brazilian users with tools for budget management using the 50/30/20 method, expense tracking, investment portfolio management, goal setting, and financial reporting. The system combines a React frontend with an Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual Identity: Pharos Capital brand guidelines applied.

## Recent Changes

- **January 28, 2025**: Fixed income categories classification - removed from 50/30/20 system
  - Income categories (Salário, Renda Extra, Rendimentos, Outras Receitas) no longer have 50/30/20 classification
  - Updated database schema to allow null type for income categories
  - Income categories now properly excluded from budget methodology visualization
  - Only expense categories (necessities, wants, savings) appear in 50/30/20 budget system
- **January 28, 2025**: Migration from Replit Agent completed and default categories created
  - Successfully migrated project from Replit Agent to standard Replit environment
  - All required packages installed and working properly with Node.js 20
  - PostgreSQL database connected successfully using existing Neon configuration
  - Application running on port 5000 with environment protection system active
  - Created comprehensive default category system in database (21 categories total)
  - Implemented complete 50/30/20 methodology with proper categorization:
    - Necessities (50%): 7 essential categories (housing, food, transport, health, utilities, education, taxes)
    - Wants (30%): 7 lifestyle categories (entertainment, dining, travel, hobbies, personal care, subscriptions, shopping)
    - Savings (20%): 3 investment categories (emergency fund, investments, future goals)
    - Income: 4 revenue sources (salary, extra income, investment returns, other income)
  - All categories include proper colors, icons, and detailed descriptions
  - Categories marked as default templates for new user registration
- **January 28, 2025**: Comprehensive 50/30/20 categorization system revision
  - Created detailed default categories following proper 50/30/20 methodology
  - Necessities (50%): 7 essential categories including housing, food, transport, health, utilities
  - Wants (30%): 7 lifestyle categories including entertainment, dining, travel, hobbies  
  - Savings (20%): 3 investment categories including emergency fund, investments, goals
  - Income categories: 4 revenue sources including salary, extra income, investment returns
  - Added comprehensive category descriptions explaining the 50/30/20 methodology
  - Enhanced category interface with color-coded badges and visual explanations
  - Updated new user registration to create robust default category structure
- **January 28, 2025**: Enhanced credit card management with action buttons
  - Added "Adicionar Despesa" and "Pagar Fatura" buttons to each credit card
  - Implemented expense tracking dialog for direct card expense registration
  - Created payment dialog for recording card invoice payments with account selection
  - Fixed SelectItem error by replacing empty values with "none" to comply with Radix UI
  - Added proper form validation and error handling for both actions
  - Integrated with existing transaction and account systems for real-time updates
- **January 28, 2025**: Implemented temporal logic for default budgets
  - Default budgets now only apply to months equal or later than their creation date
  - Fixed budget update cache issues with proper React Query invalidation
  - Added comprehensive server-side logging for budget retrieval and temporal logic
  - Implemented upsert functionality for budget creation (update existing or create new)
  - Added anti-cache headers to prevent stale data issues
  - Enhanced debug logs to track temporal budget application
- **January 28, 2025**: Implemented comprehensive account management features
  - Added PUT endpoint for updating account information (name, type, bank)
  - Created transfer API endpoint with balance validation and atomic updates
  - Implemented DELETE endpoint with balance verification for account deletion
  - Enhanced accounts component with edit, transfer, and delete dialogs
  - Added form validation for transfers including same-account prevention
  - Real-time balance updates and error handling for insufficient funds
  - Safety measures for account deletion (requires zero balance, confirmation dialog)
- **January 28, 2025**: Enhanced credit card bank selection with account integration
  - Modified credit card creation form to use dropdown with existing bank accounts
  - Replaced free text input with Select component linking to user's registered accounts
  - Improved data consistency by connecting credit cards to existing account banks
  - Added accounts query to credit cards component for real-time bank selection
- **January 28, 2025**: Enhanced budget system with default/specific options
  - Implemented flexible budget system: default (all months) vs specific month
  - Added visual selection interface with cards for budget type choice
  - Created database column 'isDefault' to differentiate budget types
  - Default budgets apply to all months when no specific budget exists
  - Visual indicator shows when using default budget across months
  - Date selectors now default to current month/year for better UX
- **January 28, 2025**: Implemented flexible login system and phone field
  - Added phone field to user schema with unique constraint
  - Updated login to accept username, email, or phone as identifier
  - Modified registration form to include phone field with proper formatting
  - Enhanced backend storage methods to support multi-type user lookup
  - Updated admin user creation script with phone number
- **January 28, 2025**: Database schema updated and cleaned
  - Recreated PostgreSQL database with complete investment transfer functionality
  - Implemented isInvestmentTransfer flag in transactions table for proper categorization
  - Added transferToAccountId field for tracking investment account transfers
  - Investment transfers are excluded from profit/loss calculations in dashboard
  - All tables updated with current schema including phone field in users table
  - Database reset ensures clean state with all current features working properly
- **January 28, 2025**: Migration from Replit Agent to Replit environment completed
  - Successfully migrated project from Replit Agent to standard Replit environment
  - Configured PostgreSQL database to prioritize .env configuration (preserving user's Neon setup)
  - Enhanced database configuration to respect existing Neon PostgreSQL connection
  - Installed missing postgres package and other required dependencies using Node.js 20
  - Pushed database schema successfully using Drizzle Kit to existing Neon database
  - Created admin user account (tom/tom123) with working authentication
  - Verified application functionality including login system and database connectivity
  - All core features operational: authentication, PostgreSQL database, API endpoints
  - Project now uses user's original Neon PostgreSQL database from .env exclusively
  - **Environment Protection System implemented**:
    - Created env-protection.ts module to prevent Replit from overwriting DATABASE_URL
    - Added .envprotect file with protection configuration
    - Implemented protection script that runs automatically to detect and block overwrites
    - System always prioritizes .env file over system environment variables
    - Protection logs show successful blocking of system overwrite attempts
- **January 28, 2025**: Improved visual experience with soft gradient background
  - Replaced harsh white background with soft blue-gray gradient (from-background via-slate-50 to-blue-50/30)
  - Applied consistent gradient background across all pages (dashboard, investments, accounts, budget, cards, goals, reports, education)
  - Enhanced overall visual comfort while maintaining professional light tone
  - Updated root CSS background color to soft light blue-gray (hsl(210, 20%, 98%))
- **January 28, 2025**: Created comprehensive investments page
  - Developed modern investments dashboard with glassmorphism design
  - Implemented portfolio overview with real-time data visualization
  - Added asset distribution pie chart and evolution area chart
  - Created tabbed interface for different asset categories (Ações, Crypto, ETFs, Fundos)
  - Built detailed asset table with performance metrics and variations
  - Added investment API endpoint with portfolio calculations
- **January 28, 2025**: Applied Pharos Capital visual identity
  - Implemented official color palette (#195AB4 primary, complementary colors)
  - Changed typography to DM Sans (Moderat alternative)
  - Added Pharos Capital logo component to header
  - Updated all UI components with Pharos Capital styling
- **January 28, 2025**: Updated branding from BTG Pactual to Pharos Capital
  - Changed all logos and references
  - Updated "powered by" text to Pharos Capital
  - Renamed components and CSS classes
- **January 28, 2025**: Created admin user account
  - Username: tom
  - Password: tom123
  - Email: tom@admin.com
Language: Portuguese (Brazilian)

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Development Environment
- **Development Server**: Express with Vite integration for hot reloading
- **Package Manager**: npm with ES modules
- **TypeScript Configuration**: Strict mode with path aliases for clean imports
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: User accounts with authentication credentials
- **Accounts**: Bank accounts (checking, savings, investment)
- **Credit Cards**: Credit card management with limits and usage tracking
- **Categories**: Expense categorization following 50/30/20 methodology
- **Transactions**: Income, expense, and transfer records
- **Assets**: Investment portfolio tracking (stocks, FIIs, crypto, etc.)
- **Goals**: Financial goal setting and progress tracking
- **Budgets**: Monthly budget planning and spending analysis

### Authentication System
- JWT token-based authentication stored in localStorage
- Protected routes with middleware authentication
- User registration and login with encrypted passwords
- Session management for persistent login state

### Financial Features
- **Budget Management**: Implementation of 50/30/20 budgeting method
- **Transaction Tracking**: Income and expense categorization
- **Investment Portfolio**: Asset tracking with real-time price updates
- **Goal Setting**: Progress tracking toward financial objectives
- **Credit Card Management**: Balance and usage monitoring
- **Financial Reporting**: Charts and analytics using Recharts library

### UI/UX Design
- **Design System**: Shadcn/ui components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Support for light/dark theme switching
- **Brazilian Localization**: Currency formatting and Portuguese language support
- **Accessibility**: ARIA-compliant components from Radix UI

## Data Flow

### Client-Server Communication
1. **API Requests**: TanStack Query manages all server communications
2. **Authentication Flow**: JWT tokens included in API request headers
3. **Data Fetching**: Automatic caching and background updates
4. **Form Submissions**: React Hook Form with server-side validation
5. **Error Handling**: Centralized error management with toast notifications

### Database Operations
1. **Connection Management**: Neon serverless PostgreSQL with connection pooling
2. **Query Building**: Drizzle ORM provides type-safe database operations
3. **Schema Management**: Drizzle Kit for migrations and schema synchronization
4. **Data Validation**: Zod schemas for runtime type checking
5. **Transaction Handling**: ACID compliance for financial operations

### State Management
1. **Server State**: TanStack Query for API data caching and synchronization
2. **Client State**: React hooks for local component state
3. **Authentication State**: Context API for user session management
4. **Form State**: React Hook Form for controlled form inputs
5. **UI State**: Local state for modals, sidebars, and interactive elements

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Performant form library with validation
- **@hookform/resolvers**: Zod integration for form validation
- **bcrypt**: Password hashing for secure authentication
- **jsonwebtoken**: JWT token generation and verification

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **lucide-react**: Icon library for consistent iconography
- **recharts**: Charting library for financial data visualization

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: esbuild compiles TypeScript server code to `dist/index.js`
3. **Environment**: NODE_ENV=production for optimized runtime
4. **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Development Environment
1. **Hot Reloading**: Vite middleware integrated with Express server
2. **TypeScript**: Real-time compilation and type checking
3. **Database**: Drizzle Kit for schema pushing and development migrations
4. **Environment**: NODE_ENV=development with debug logging

### Configuration Management
1. **Environment Variables**: DATABASE_URL and JWT_SECRET required
2. **Path Aliases**: TypeScript paths for clean import statements
3. **Asset Handling**: Vite manages static assets and public files
4. **CORS**: Development-only configuration for cross-origin requests

The application is designed for deployment on platforms supporting Node.js with PostgreSQL, such as Replit, Vercel, or Railway, with automatic database provisioning and environment variable management.