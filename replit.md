# replit.md

## Overview

OrçaFácil is a comprehensive personal finance management application designed for Brazilian users. Its main purpose is to provide tools for budget management using the 50/30/20 method, expense tracking, investment portfolio management, goal setting, and financial reporting. The project aims to offer a modern and professional user experience, combining robust financial features with an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual Identity: Pharos Capital brand guidelines applied.

## Recent Changes

- **August 1, 2025**: Added edit and delete functionality for pending transactions
  - Users can now edit pending transactions through a comprehensive dialog interface
  - Delete functionality with confirmation for pending transactions
  - Only pending transactions can be edited/deleted, confirmed transactions remain protected
  - Added proper error handling and user feedback for all operations
  - New `EditPendingTransactionDialog` component with full form validation
  - Backend API endpoints: PUT `/api/transactions/:id` and enhanced DELETE validation
  - Fixed recurrence creation: first pending transaction now uses start date instead of next execution date
  - Enhanced delete logic: when deleting pending transactions from "forever" recurrences, automatically creates next pending transaction
  - Fixed recurrence date calculation: all transactions calculated from original start date + period number, maintaining original planning regardless of confirmations/deletions

- **August 1, 2025**: Implemented confirmation date logic for pending transactions
  - When a pending transaction is confirmed, its date is automatically updated to the confirmation date (current date/time)
  - Applies to both `confirmTransactionWithAccount` and `updateTransactionStatus` methods
  - Ensures accurate financial records showing when transactions actually occurred
  - Added detailed logging for date changes during confirmation process

- **January 31, 2025**: Implemented automatic pending transaction management for "forever" recurrences
  - "Forever" recurrences (no end date) automatically create the first pending transaction when created
  - When a recurrence transaction is confirmed, the next pending transaction is automatically created
  - System maintains exactly one pending transaction visible for each active forever recurrence
  - Intelligent recurrence update logic: only pending transactions are modified while confirmed transactions remain unchanged
  - Created specialized `updateRecurrenceAndPendingTransactions` method that maps recurrence changes to related pending transactions
  - Fixed date validation issues in recurrence updates with dedicated `updateRecurrenceSchema` and proper ISO string to Date transformation
  - Enhanced backend response to show how many pending transactions were updated and provides clear user feedback
  - Preserves financial integrity by keeping confirmed transaction history intact

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