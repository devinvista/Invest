## Overview

InvestON is a comprehensive personal financial management application designed for Brazilian users. Its primary goal is to provide tools for budget management using the 50/30/20 method, expense tracking, investment portfolio management, goal setting, and financial reporting. The project aims to offer a modern and professional user experience, combining robust financial features with an intuitive interface.

## User Preferences

Preferred communication style: Simple and everyday language.
Visual Identity: Pharos Capital brand guidelines applied.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, Vite build tool.
- **UI Library**: Radix UI components with Tailwind CSS, complemented by Shadcn/ui for consistent styling.
- **State Management**: TanStack Query (React Query) for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Design**: Emphasizes a professional banking interface with a clean light theme (clean white background, subtle light grey accents, Pharos Capital blue gradient for headers) and a modern dark theme (deep dark blue-gray). Includes responsive design, Brazilian localization (currency formatting, Portuguese language), and accessibility features. Visual elements include professional typography, enhanced card styling, and color-coded badges for financial indicators. Investment charts feature professional bar and donut designs with category filtering.

### Backend Architecture
- **Runtime**: Node.js with TypeScript.
- **Framework**: Express.js with a RESTful API design.
- **Database**: PostgreSQL with Neon serverless connection.
- **ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: JWT-based authentication with bcrypt password hashing and connect-pg-simple for session management.

### Key Features and Technical Implementations
- **Budget Management**: Implements the 50/30/20 methodology, allowing standard (all months) or specific month budgets, and custom category allocation. Income calculation is automatic based on revenue categories.
- **Transaction Tracking**: Comprehensive tracking of income, expenses, and transfers with categorization. Includes features like automatic installment description, confirmation of pending transactions with account selection, and full-screen transaction dialogues with filtering and sorting. Credit card expenses are recorded directly on the card, and payments are handled as transfers from a bank account to the credit card.
- **Investment Portfolio**: Asset tracking with real-time price updates, integrated asset search (including Brazilian stocks like B3), and manual asset creation. Features portfolio evolution charts and asset distribution.
- **Goal Setting**: Allows defining financial goals and tracking progress.
- **Credit Card Management**: Features limit and usage tracking, direct expense recording, and bill payment recording.
- **Account Management**: Supports account information updates, transfers between accounts, and account deletion with balance verification.
- **Standard Categories**: A comprehensive system of standard categories based on the 50/30/20 methodology is automatically created for new users.
- **Financial Simulators**: Includes enhanced compound interest, emergency reserve, financial goals, retirement, and financing calculators, along with an investment comparison tool. All simulators feature responsive design, professional color-coded results, and educational tips.
- **Responsive Design**: Implemented with a responsive grid system, adaptive charts, and optimized components for mobile devices. All interfaces adapt from small screens (320px+) to ultrawide monitors. Header and Sidebar include a collapsible mobile navigation with a hamburger menu.
- **Collapsible Sidebar**: Features a collapse button in the desktop header with PanelLeftClose/PanelLeftOpen icons. The responsive sidebar shows only icons and tooltips when collapsed, with its state persisted in localStorage.

## External Dependencies

- **@neondatabase/serverless**: For PostgreSQL connections.
- **drizzle-orm**: For database interactions.
- **@tanstack/react-query**: For server state management.
- **@radix-ui/**: For accessible UI components.
- **react-hook-form**: For form handling.
- **@hookform/resolvers**: For Zod integration with forms.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For JWT token management.
- **tailwindcss**: For styling.
- **class-variance-authority**: For component variants.
- **clsx**: For conditional class names.
- **lucide-react**: For icons.
- **recharts**: For charts and data visualization.
- **Alpha Vantage API**: For real-time financial data and asset search.
- **CoinGecko API**: For cryptocurrency data.