# Racing League Management System

## Overview

This is a comprehensive racing league management application built with React (frontend) and Express.js (backend). The system allows users to manage drivers, race schedules, race results, championship standings, and points configurations for a racing league. It features a modern UI built with shadcn/ui components and Tailwind CSS, with PostgreSQL as the database using Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation
- **Component Structure**: Modular component architecture with reusable UI components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with route-based organization
- **Database**: In-memory storage with MemStorage implementation
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Development Setup**: Hot reloading with Vite integration in development mode
- **Error Handling**: Centralized error handling middleware

### Database Design
- **Storage**: In-memory storage implementation (MemStorage)
- **Schema Structure**: 
  - Drivers table (name, team, nationality, active status)
  - Races table (name, date, weather conditions)
  - Qualifying Results table (linking drivers to races with positions and lap times)
  - Race Results table (linking drivers to races with positions, points, status)
  - Points Configuration table (position points, bonus rules, penalty rules)
- **Data Relationships**: Foreign key relationships between races, drivers, qualifying results, and race results
- **Points System**: Flexible points configuration with position points, bonuses (fastest lap, pole position, fairness bonus), and penalties
- **Fairness Points**: Default 5 fairness points awarded to all drivers per race

### Key Features
- **Driver Management**: CRUD operations for driver profiles with team assignments
- **Race Scheduling**: Create and manage race events with date and weather tracking
- **Qualifying Results**: Record qualifying sessions with lap times and starting positions
- **Results Entry**: Record race results with finishing positions, DNF/DSQ status, and point calculations
- **Championship Standings**: Automatic calculation of driver standings based on accumulated points
- **Points Configuration**: Customizable points system with fairness bonus instead of most overtakes
- **Fairness Points System**: All drivers receive 5 fairness points by default per race
- **Responsive Design**: Mobile-friendly interface with sidebar navigation

### Development Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas between frontend and backend
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Component Composition**: Reusable UI components with consistent design patterns
- **Query Management**: Optimistic updates and cache invalidation with React Query
- **Form Validation**: Client and server-side validation using shared Zod schemas

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon database
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Database migration and schema management tools
- **express**: Node.js web framework for API server
- **react**: Frontend UI library
- **@tanstack/react-query**: Server state management and caching

### UI and Styling
- **@radix-ui/***: Primitive UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers for Zod
- **zod**: Schema validation library
- **wouter**: Lightweight routing library for React

### Database and Backend
- **connect-pg-simple**: PostgreSQL session store for Express
- **date-fns**: Date manipulation library
- **nanoid**: Unique ID generation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Build and Deployment
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for development
- **autoprefixer**: CSS vendor prefixing
- **postcss**: CSS processing tool