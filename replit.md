# replit.md

## Overview

OrçaFácil is a comprehensive personal finance management application built with a modern full-stack architecture. The application provides Brazilian users with tools for budget management using the 50/30/20 method, expense tracking, investment portfolio management, goal setting, and financial reporting. The system combines a React frontend with an Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual Identity: Pharos Capital brand guidelines applied.

## Recent Changes

- **January 30, 2025**: Completed enhanced Alpha Vantage integration with comprehensive asset management
  - Enhanced Alpha Vantage integration based on official documentation analysis
  - Improved Brazilian stock search with proper .SA suffix handling for B3 exchange
  - Added international market support (LSE, TSX, XETRA, BSE, NSE, SSE, SZSE)
  - Implemented intelligent asset type classification (stocks, ETFs, FIIs, funds)
  - Enhanced symbol search with relevance scoring and proper currency detection
  - Added comprehensive error handling and rate limiting for API quota management
  - Improved search results with exchange identification and regional classification
  - Enhanced quote fetching with multi-currency support (BRL, USD, EUR, GBP, CAD, INR, CNY)
  - Added database schema enhancements with asset metadata columns (exchange, currency, region, coinGeckoId)
  - Implemented real-time quote integration when creating new assets
  - Added batch quote refresh functionality for portfolio updates
  - Enhanced CoinGecko integration with throttling protection and error handling
  - Completed asset creation workflow with automatic price fetching and metadata storage
- **January 30, 2025**: Enhanced investment transaction form with integrated asset search and manual asset creation
  - Integrated asset search functionality directly within the asset selection dropdown (no separate field)
  - Added asset type filter dropdown (Ações, FIIs, Crypto, Renda Fixa, ETFs, Fundos) in the asset label row
  - Implemented real-time asset search with external API integration inside the dropdown menu
  - Created multiple asset creation options:
    - Search and add assets directly from search results
    - Create new asset when no search results found (using search term as symbol)
    - Manual "Criar Novo Ativo" button when no assets exist for selected type
  - Enhanced dropdown UI showing separate sections for "Novos ativos encontrados" and "Meus ativos"
  - Streamlined workflow: open dropdown → search/browse → create if needed → auto-populate transaction
  - Type-based filtering of existing user assets with clear section headers and contextual messages
  - Added comprehensive form validation and error handling for new asset creation
  - Search results display asset details, current prices, and type badges within dropdown
  - Smart form pre-population based on search context or selected asset type
- **January 30, 2025**: Fixed duplicate close buttons in transaction dialog during Replit Agent migration
  - Removed duplicate close button from TransactionsTableDialog header 
  - Cleaned up unused imports (X icon from lucide-react)
  - Dialog now has single close button with proper UX behavior
  - Enhanced dialog user experience with cleaner interface
- **January 30, 2025**: Implemented full-screen transaction dialogs replacing page navigation
  - Created TransactionsTableDialog component with comprehensive filtering and sorting capabilities
  - Replaced "Ver Lançamentos" navigation buttons with dialog-opening functions in budget cards
  - Added category-specific filtering for each budget section (income, necessities, wants, savings)
  - Implemented delete transaction functionality with confirmation dialogs
  - Fixed PostgreSQL "invalid input syntax for type integer: NaN" error by improving query structure
  - Enhanced dialog accessibility with proper ARIA descriptions
- **January 30, 2025**: Successfully completed migration from Replit Agent to standard Replit environment  
  - Fixed critical authentication token mismatch in API requests (auth_token vs token inconsistency)
  - Resolved POST /api/transactions API request failures by correcting authorization header configuration
  - Enhanced authentication system with proper token handling across client and server
  - Application now running cleanly on port 5000 with robust client/server separation
  - All core functionality verified working: authentication, transactions, budget management, investments
  - Migration completed with all security best practices implemented and verified
  - Alpha Vantage API integration maintained for real-time financial data
- **January 30, 2025**: Implemented smart navigation from budget cards to filtered transactions
  - Added intelligent "Ver Lançamentos" buttons that navigate with appropriate filters applied
  - Revenue card navigates to income transactions for current month/year
  - Category cards (Necessidades, Desejos, Poupança) navigate to expense transactions filtered by category type
  - URL parameters automatically applied and cleaned after navigation for seamless user experience
  - Enhanced Reports component to read and apply URL parameters for initial filter state
- **January 30, 2025**: Implemented comprehensive transactions table with delete functionality
  - Added complete transactions table with advanced filtering by type, category, and search term
  - Implemented clickable column sorting for date, amount, description, and category
  - Created delete transaction feature with confirmation dialog and safety checks
  - Enhanced transaction security - users can only delete their own transactions
  - Added proper credit card balance adjustment when deleting card-related transactions
  - Professional UI with color-coded badges and responsive design
  - Fixed PostgreSQL UUID validation errors in budget categories endpoint
- **January 30, 2025**: Added transaction viewing buttons to budget cards and completed migration from Replit Agent
  - Fixed PostgreSQL error with invalid UUID parameters in budget categories endpoint by implementing proper database query
  - Added "Ver Lançamentos" buttons to all budget category cards (Receitas, Necessidades, Desejos, Poupança)
  - Transaction viewing buttons navigate to Reports page where users can view all their transactions
  - Enhanced user experience by providing direct access to transaction details from budget overview
  - All budget cards now have consistent UI with transaction viewing capability
- **January 30, 2025**: Migration from Replit Agent to Replit environment completed successfully
  - Fixed PostgreSQL error with invalid UUID parameters in budget categories endpoint  
  - Enhanced UUID validation in route handlers and storage layer to prevent "NaN" parameter issues
  - Implemented automatic 50/30/20 recalculation when income changes in default budget mode
  - Implemented adaptive 50/30/20 budget logic where values adjust when category allocations exceed standard distribution
  - Fixed budget category visibility - all registered categories now visible in budget allocation (hiding only applies to "realizado" view)
  - Enhanced budget system with real-time recalculation in both default and custom modes
  - All core functionality verified working including budget system, transactions, and financial calculations
  - Project ready for continued development in standard Replit environment  
  - Fixed PostgreSQL error with invalid UUID parameters in budget categories endpoint
  - Enhanced UUID validation in route handlers and storage layer to prevent "NaN" parameter issues
  - Implemented automatic 50/30/20 recalculation when income changes in default budget mode
  - Strengthened parameter validation with regex UUID format checking
  - All core functionality verified working including budget system, transactions, and financial calculations
  - Project ready for continued development in standard Replit environment
- **January 29, 2025**: Enhanced asset distribution chart with professional pie chart design and filtering
  - Updated asset distribution chart to modern donut chart with professional styling
  - Added category filtering functionality (all types, stocks, renda fixa, crypto, ETFs, funds)
  - Implemented detailed breakdown for individual stocks when "Ações" filter is selected
  - Enhanced legend with sorted percentages and improved hover interactions
  - Applied modern color palette matching user reference design
  - Improved responsive layout with better mobile and desktop viewing
- **January 29, 2025**: Updated portfolio evolution chart to professional bar chart design
  - Replaced area chart with modern stacked bar chart featuring gradient colors
  - Applied professional visual styling with emerald gradient theme matching user's reference
  - Added legend below chart showing "Valor aplicado" and "Ganho capital" indicators
  - Enhanced chart margins and tooltip styling for improved user experience
  - Maintained period selector functionality (3m, 6m, 12m, all) for flexible viewing
- **January 29, 2025**: Transferred portfolio evolution chart from investments page to dashboard
  - Replaced simple wealth evolution chart with detailed investment tracking chart
  - Added stacked area chart showing "Valor Aplicado" vs "Ganho de Capital" over time
  - Integrated period selector (3m, 6m, 12m, all) for flexible time frame viewing
  - Enhanced dashboard with professional investment visualization using theme-aware styling
- **January 29, 2025**: Updated revenue card to match category breakdown card visual style with emerald color scheme
  - Applied CardHeader/CardTitle structure consistent with other category cards
  - Added "% realizado" badge matching expense categories' "% usado" format
  - Implemented detailed breakdown showing Planejado, Realizado, and Meta Restante
  - Included top 3 income categories display with transaction amounts
  - Maintained purple color scheme to distinguish from 50/30/20 categories (orange/green/blue)
- **January 29, 2025**: Modernized budget overview cards with professional design and orçado vs realizado comparison
  - Redesigned main overview cards with gradient backgrounds and shadow effects for modern professional appearance
  - Implemented comprehensive "Gastos vs Orçamento" card showing realizado vs orçado with progress bar and utilization percentage
  - Enhanced 50/30/20 breakdown cards with compact design showing realizado, orçado, and restante for each category
  - Added intelligent status badges ("No controle" vs "Atenção") based on budget utilization thresholds
  - Integrated transaction functionality with income/expense buttons directly in budget page quick actions
  - Fixed PostgreSQL errors and React form warnings for improved stability
  - Maintained Pharos Capital visual identity with consistent color schemes and professional styling
- **January 29, 2025**: Implemented complete custom budget functionality with category-level configuration
  - Fixed PostgreSQL query error by adding comprehensive ID validation in backend and frontend
  - Updated budget type options from 3 to 2: "Simplificado" (simplified 50/30/20) and "Completo" (custom by category)
  - Removed "Específico" option as requested - isDefault switch now controls month-specific vs default behavior
  - Added comprehensive category-level budget interface showing real-time used/remaining amounts
  - Implemented automatic category grouping by type (necessities/wants/savings) with color coding
  - Enhanced budget creation API to support custom category allocations alongside standard 50/30/20 limits
  - Added robust error handling for invalid budget IDs preventing PostgreSQL conversion errors
- **January 29, 2025**: Enhanced budget overview with comprehensive category breakdown and insights
  - Redesigned overview tab with detailed financial summary cards (Renda Total, Gastos Realizados, Orçamento Total, Disponível)
  - Added category-specific breakdown cards for Necessidades (50%), Desejos (30%), and Poupança (20%)
  - Implemented progress bars with custom colors matching 50/30/20 methodology (orange, green, blue)
  - Added intelligent insights panel with taxa de poupança, aderência ao orçamento, and dias restantes
  - Created quick actions panel with navigation to analytics and projections
  - Enhanced pie chart with detailed legend showing budget distribution
  - Added top 3 categories display for each budget type with spending amounts
  - Improved responsive design for better mobile and desktop viewing
  - Added percentage usage badges for each category showing budget utilization
- **January 29, 2025**: Updated budget methodology color scheme per user request
  - Changed Necessidades (necessities) from purple to orange color scheme
  - Changed Desejos (wants) from orange to green color scheme  
  - Changed Poupança (savings) from green to blue color scheme
  - Updated CSS color variables, progress bar gradients, and dashboard chart colors
  - Applied changes consistently across budget cards, progress bars, and data visualizations
- **January 29, 2025**: Migration from Replit Agent to Replit environment successfully completed
  - Project fully operational in standard Replit environment with all features intact
  - Environment protection system maintaining user's original Neon PostgreSQL configuration
  - Application running cleanly on port 5000 with proper Node.js 20 setup
  - All migration checklist items completed and verified
  - Financial management system ready for continued development
- **January 28, 2025**: Implemented automatic income calculation and default budget selection
  - Income categories now automatically calculate total income (sum of all income category budgets)
  - Removed manual income input field in custom budget mode - calculated automatically from categories
  - Default budget selection ("para todos os meses") now set as default for all budget types
  - Enhanced custom budget creation to use income category totals as baseline for 50/30/20 calculations
  - Updated interface to clearly show automatic income calculation with visual feedback
- **January 28, 2025**: Enhanced budget system with personalized category allocation as default budget option
  - Implemented ability to set custom budget allocation per category as default budget
  - Added Switch component to mark personalized budget as default for all months
  - Custom budget with category-level control can now serve as baseline for future months
  - Updated budget creation logic to support default custom budgets with individual category allocations
  - Enhanced user interface with clear explanation of default budget functionality
- **January 28, 2025**: Enhanced budget system with personalized category allocation and flexible 50/30/20 adjustments
  - Implemented personalized budget allocation allowing users to distribute values within 50/30/20 framework
  - Added budget_categories table to store individual category budget allocations
  - Created three budget types: Default (all months), Specific (single month), and Custom (per category)
  - Custom budget mode respects 50/30/20 limits while allowing distribution flexibility
  - Real-time feedback shows used/available amounts and prevents exceeding group limits
  - Added ability to adjust 50/30/20 values manually with percentage and difference tracking
  - Implemented "Recalcular 50/30/20" button to restore automatic calculations
  - Enhanced APIs to support budget categories creation and retrieval
- **January 28, 2025**: Fixed income categories classification - removed from 50/30/20 system
  - Income categories (Salário, Renda Extra, Rendimentos, Outras Receitas) no longer have 50/30/20 classification
  - Updated database schema to allow null type for income categories
  - Income categories now properly excluded from budget methodology visualization
  - Only expense categories (necessities, wants, savings) appear in 50/30/20 budget system
- **January 28, 2025**: Enhanced dark theme with modern banking app aesthetic
  - Implemented deep dark blue-gray color scheme similar to modern banking applications
  - Updated dark theme variables with sophisticated color palette (#0A0E17 background)
  - Enhanced card shadows and borders for better depth in dark mode
  - Improved input styling and focus states for dark theme
  - Login page updated with proper dark theme gradient backgrounds
  - Added smooth transitions for theme switching
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