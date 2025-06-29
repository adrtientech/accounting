# Financial Accounting Application

## Overview

This is a web-based financial accounting application built with Flask and JavaScript. The application provides a comprehensive accounting system with multilingual support (Indonesian and English), featuring inventory management, financial statements, and various accounting operations. The system is designed to handle complete accounting workflows from product stocking to financial reporting.

## System Architecture

### Frontend Architecture
- **Framework**: Vanilla JavaScript with Bootstrap 5 for UI components
- **Styling**: Custom CSS with Bootstrap integration
- **Structure**: Single Page Application (SPA) with dynamic page switching
- **Language Support**: Client-side internationalization (i18n) system

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Session Management**: Flask's built-in session handling
- **Data Storage**: In-memory data structures using Python collections
- **API Design**: RESTful endpoints returning JSON responses

### Template Engine
- **Engine**: Jinja2 (Flask's default templating engine)
- **Structure**: Base template with content blocks for reusability

## Key Components

### 1. Multi-language Support
- **Implementation**: Dictionary-based translation system
- **Languages**: Indonesian (default) and English
- **Scope**: Complete UI translation including forms, labels, and messages

### 2. Financial Management Modules
- **Product Stocking**: Inventory management with purchase/selling prices
- **Share Capital**: Capital investment tracking
- **Journal Entries**: Double-entry bookkeeping system
- **Financial Statements**: Income statement, balance sheet, trial balance
- **General Ledger**: Account-based transaction tracking

### 3. User Interface Components
- **Navigation**: Sidebar-based navigation with categorized sections
- **Forms**: Dynamic forms with client-side validation
- **Data Display**: Tables and charts for financial data visualization
- **Responsive Design**: Bootstrap-based responsive layout

### 4. Data Management
- **Storage**: Server-side session storage for temporary data
- **Structure**: Nested dictionaries and lists for financial data organization
- **Processing**: Real-time calculations for financial metrics

## Data Flow

1. **User Interaction**: User interacts with frontend forms and navigation
2. **Client Processing**: JavaScript handles form validation and UI updates
3. **Server Communication**: AJAX requests sent to Flask backend
4. **Data Processing**: Flask processes requests and updates session data
5. **Response**: JSON responses sent back to update frontend
6. **UI Update**: JavaScript updates the interface with new data

## External Dependencies

### Frontend Dependencies
- **Bootstrap 5**: UI framework and responsive design
- **Font Awesome 6**: Icon library
- **Chart.js**: Data visualization for financial charts

### Backend Dependencies
- **Flask**: Web framework
- **Python Standard Library**: Collections, datetime, os modules

### Development Dependencies
- No specific build tools or package managers identified
- Static file serving through Flask

## Deployment Strategy

### Configuration
- **Secret Key**: Environment variable with fallback default
- **Static Files**: Served through Flask's static file handling
- **Templates**: Jinja2 templates with inheritance structure

### Environment Setup
- **Production**: Environment variable configuration for secrets
- **Development**: Local Flask development server
- **Assets**: Static CSS, JavaScript, and template files

### Scalability Considerations
- **Data Storage**: Currently in-memory (suitable for single-user/session)
- **Session Management**: Flask sessions (server-side storage recommended for production)
- **Database Migration**: Architecture supports future database integration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 28, 2025. Initial setup
- June 28, 2025. Added lending/borrowing functionality with settlement options
- June 28, 2025. Fixed Share Capital calculation to automatically include Net Income/Loss
- June 28, 2025. Added sales receivable payment functionality with separate tracking for sales vs other receivables

## Notes for Development

### Current Limitations
- **Data Persistence**: No permanent storage - data lost on server restart
- **Multi-user Support**: Single-session design needs enhancement for multiple users
- **Database Integration**: Ready for database integration (likely with Drizzle ORM)

### Recommended Enhancements
- **Database Integration**: Add persistent storage with proper database schema
- **User Authentication**: Implement user login and company-specific data isolation
- **Data Export**: Add PDF/Excel export functionality for financial reports
- **Audit Trail**: Implement transaction logging and modification tracking

### Technical Debt
- **Error Handling**: Limited error handling in current implementation
- **Input Validation**: Basic client-side validation needs server-side backup
- **Code Organization**: Some JavaScript functions need modularization