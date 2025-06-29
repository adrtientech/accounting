# Professional Accounting System (AccountingDrien)

## Overview

This is a comprehensive bilingual (Indonesian/English) financial accounting web application built with modern Node.js/Express backend and React frontend. The application provides complete accounting functionality including double-entry bookkeeping, inventory management, financial reporting, sales management, collections, and returns processing. It features a professional, responsive design with data persistence and export capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/UI with Tailwind CSS for modern, responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography

### Backend Architecture
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript for type safety
- **Data Storage**: In-memory storage with JSON file persistence
- **API Design**: RESTful endpoints with comprehensive validation
- **Schema**: Drizzle ORM schema definitions for type safety

### Database Architecture
- **Current**: In-memory storage with file persistence (accounting_data.json)
- **Schema**: Drizzle ORM schema for PostgreSQL compatibility
- **Data Persistence**: Automatic save/load functionality
- **Structure**: Relational data model with proper foreign keys

## Key Features

### 1. Double-Entry Bookkeeping System
- **Journal Entries**: Automatic creation of debit/credit entries for all transactions
- **Chart of Accounts**: Predefined account structure (Assets, Liabilities, Equity, Revenue, Expenses)
- **Balance Sheet**: Real-time balance sheet with proper accounting equation
- **Financial Reporting**: Comprehensive transaction history and account balances

### 2. Sales Management
- **Sales Entry**: Multi-line invoice creation with COGS tracking
- **Payment Methods**: Support for cash and credit sales
- **Customer Management**: Customer information tracking per invoice
- **Automated Journaling**: Automatic journal entries for sales transactions

### 3. Collections Management
- **Outstanding Receivables**: Track and manage unpaid invoices
- **Payment Collection**: Record payments against outstanding receivables
- **Status Tracking**: Automatic status updates (Open, Partial, Paid)
- **Collection Journaling**: Proper debit/credit entries for collections

### 4. Returns Processing
- **Sales Returns**: Handle product returns and sales allowances
- **Return Types**: Support for both product returns and allowances
- **Inventory Restoration**: Automatic inventory adjustment for returns
- **Return Journaling**: Proper accounting for returned merchandise

### 5. Data Persistence & Export
- **File Persistence**: Automatic save/load to JSON file
- **Data Export**: CSV export functionality for journal entries
- **Data Import**: Ability to restore from saved files
- **Backup & Recovery**: Manual save/load capabilities

### 6. User Experience Features
- **Professional Interface**: Clean, modern design with AccountingDrien branding
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Instant balance sheet and statistics updates
- **Form Validation**: Comprehensive client and server-side validation
- **Error Handling**: User-friendly error messages and success notifications

## Data Flow

1. **User Interaction**: User interacts with frontend forms and navigation
2. **Client Processing**: JavaScript handles form validation and UI updates
3. **API Communication**: AJAX requests sent to Flask backend endpoints
4. **Server Processing**: Flask processes requests and updates session data
5. **Response**: JSON responses returned to update frontend display
6. **State Management**: Application state maintained in browser and server sessions

## External Dependencies

### Frontend Dependencies
- **Bootstrap 5**: UI framework for responsive design
- **Font Awesome**: Icon library for consistent visual elements
- **Chart.js**: Charting library for financial data visualization

### Backend Dependencies
- **Flask**: Python web framework
- **Jinja2**: Template engine (included with Flask)
- **Collections**: Python standard library for data structures

### Potential Future Dependencies
- **Drizzle ORM**: For database operations (not currently implemented)
- **@neondatabase/serverless**: For Neon database connectivity
- **Zod**: For schema validation (via drizzle-zod)

## Deployment Strategy

### Development Environment
- **Server**: Flask development server
- **Hot Reload**: Flask auto-reload for development
- **Static Files**: Served directly by Flask

### Production Considerations
- **WSGI Server**: Recommend Gunicorn or uWSGI for production
- **Static Files**: Consider CDN or separate static file server
- **Database**: Migration from in-memory to persistent database (Postgres with Drizzle)
- **Environment Variables**: Use environment variables for configuration
- **Security**: HTTPS, CSRF protection, input sanitization

### Build Process
- **Assets**: Static files served directly
- **Templates**: Jinja2 templates compiled at runtime
- **Configuration**: Environment-based configuration management

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 29, 2025**: Complete system migration from Flask/Python to Node.js/React/TypeScript
  - Built comprehensive double-entry bookkeeping system with automatic journal entries
  - Implemented sales management with multi-line invoices and COGS tracking
  - Created collections system for managing outstanding receivables with payment tracking
  - Added returns processing for both product returns and sales allowances
  - Designed professional dashboard with real-time balance sheet and financial metrics
  - Integrated shadcn/ui component library for modern, responsive interface
  - Configured in-memory storage with JSON file persistence for data reliability
  - Successfully deployed on port 5000 with full API endpoints operational

## Changelog

- June 29, 2025: Initial setup and complete system implementation