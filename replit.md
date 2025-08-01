# replit.md

## Overview

OrçaFácil is a comprehensive personal finance management application designed for Brazilian users. Its main purpose is to provide tools for budget management using the 50/30/20 method, expense tracking, investment portfolio management, goal setting, and financial reporting. The project aims to offer a modern and professional user experience, combining robust financial features with an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual Identity: Pharos Capital brand guidelines applied.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS for styling, supplemented by Shadcn/ui for consistent styling.
- **State Management**: TanStack Query (React Query) for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Design**: Emphasizes a professional banking interface with a light theme (clean white background, subtle light gray accents, Pharos Capital blue gradient for headers) and a modern dark theme (deep dark blue-gray). Includes responsive design, Brazilian localization (currency formatting, Portuguese language), and accessibility features. Visual elements include professional typography, enhanced card styling, and color-coded badges for financial indicators. Investment charts feature professional bar and donut chart designs with category filtering.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design.
- **Database**: PostgreSQL with Neon serverless connection.
- **ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: JWT-based authentication with bcrypt password hashing and connect-pg-simple for session management.

### Key Features and Technical Implementations
- **Budget Management**: Implements the 50/30/20 methodology, allowing for default (all months) or specific month budgets, and personalized category allocation. Income calculation is automatic based on income categories.
- **Transaction Tracking**: Comprehensive income, expense, and transfer tracking with categorization. Includes features like automatic installment description, pending transaction confirmation with account selection, and full-screen transaction dialogs with filtering and sorting.
- **Investment Portfolio**: Asset tracking with real-time price updates, integrated asset search (including Brazilian stocks like B3) and manual asset creation. Features portfolio evolution and asset distribution charts.
- **Goal Setting**: Allows for financial goal setting and progress tracking.
- **Credit Card Management**: Features limit and usage tracking, direct expense registration, and invoice payment recording.
- **Account Management**: Supports updating account information, transfers between accounts, and account deletion with balance verification.
- **Default Categories**: Comprehensive default category system based on the 50/30/20 methodology is automatically created for new users.

## External Dependencies

- **@neondatabase/serverless**: For PostgreSQL connections.
- **drizzle-orm**: For database interactions.
- **@tanstack/react-query**: For server state management.
- **@radix-ui/***: For accessible UI components.
- **react-hook-form**: For form handling.
- **@hookform/resolvers**: For Zod integration with forms.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For JWT token management.
- **tailwindcss**: For styling.
- **class-variance-authority**: For component variants.
- **clsx**: For conditional class names.
- **lucide-react**: For icons.
- **recharts**: For charting and data visualization.
- **Alpha Vantage API**: For real-time financial data and asset search.
- **CoinGecko API**: For cryptocurrency data.