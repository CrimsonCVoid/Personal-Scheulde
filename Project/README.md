# Personal Scheduling App

A comprehensive, production-ready personal scheduling application built with React, TypeScript, and modern web technologies.

## Features

### 📅 Calendar Management
- **Multiple Views**: Month, Week, and Day views with smooth transitions
- **Event Creation**: Click or drag to create events with rich details
- **Event Editing**: Full CRUD operations with form validation
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurrence
- **Color Coding**: Organize events with customizable colors
- **All-Day Events**: Support for full-day events
- **Conflict Detection**: Visual warnings for overlapping events

### ✅ Task Management
- **Task Lists**: Today, Upcoming, Overdue, and Completed task views
- **Priority Levels**: Low, Medium, and High priority assignments
- **Due Dates**: Deadline tracking with overdue notifications
- **Progress Tracking**: Visual progress indicators and completion stats
- **Drag & Drop**: Drag tasks to calendar to schedule them

### 🕒 Availability Management
- **Weekly Templates**: Set regular availability hours
- **Date Exceptions**: Override availability for specific dates
- **Visual Overlay**: See availability directly on calendar views

### 🔔 Reminders & Notifications
- **Multiple Reminders**: Set multiple reminders per event
- **Browser Notifications**: Native notification support with fallback
- **Smart Scheduling**: Automatic reminder calculations

### 🎨 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: System-aware theme switching
- **Accessibility**: WCAG compliant with keyboard navigation
- **Reduced Motion**: Respects user preferences for motion
- **Quick Actions**: Keyboard shortcuts and quick-add functionality

### 🔧 Settings & Customization
- **Time Format**: 12/24 hour time display
- **Week Start**: Choose Sunday or Monday start
- **Slot Duration**: Customizable calendar time slots
- **Data Export/Import**: Full data backup and restore functionality

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: shadcn/ui (Radix primitives)
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Animation**: Framer Motion
- **Date Handling**: date-fns
- **Testing**: Vitest + Testing Library
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-scheduling-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # App configuration
│   ├── layout.tsx          # Main app layout
│   └── routes.tsx          # Route definitions
├── components/             # Reusable components
│   ├── calendar/           # Calendar-specific components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature modules
│   ├── availability/       # Availability management
│   ├── events/             # Event management
│   ├── settings/           # App settings
│   └── tasks/              # Task management
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   ├── api.ts              # Mock API layer
│   ├── seed-data.ts        # Development seed data
│   ├── time.ts             # Date/time utilities
│   └── utils.ts            # General utilities
├── pages/                  # Page components
├── styles/                 # Global styles
└── test/                   # Test files
```

## Key Features Implementation

### State Management
The app uses Zustand for state management with localStorage persistence:
- Events store (`useEventsStore`)
- Tasks store (`useTasksStore`)
- Availability store (`useAvailabilityStore`)
- Settings store (`useSettingsStore`)

### Calendar Implementation
Custom calendar implementation without heavy dependencies:
- Grid-based layout for all views
- Event overlap detection and column calculation
- Drag-and-drop event creation and editing
- Real-time "now" indicator
- Responsive design with proper touch targets

### Authentication
Mock authentication system for demo purposes:
- Email-based sign-in (accepts any valid email)
- JWT-like token storage
- Protected routes with auth gate
- User session management

### Data Persistence
- All data stored in localStorage
- Export/import functionality for backups
- Automatic data seeding for new users
- Migration-ready data structure

## Testing

The app includes comprehensive tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

Test coverage includes:
- Component rendering and interactions
- Form validation and submission
- Utility functions (time, events, etc.)
- Store actions and selectors

## Accessibility

The app follows WCAG 2.1 guidelines:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Reduced motion support
- Screen reader compatibility

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be generated in the `dist` directory.

### Deploy to Static Hosting

The app can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Google Cloud Storage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Screenshots

### Dashboard
![Dashboard showing today's events and tasks](docs/dashboard.png)

### Calendar Views
![Calendar with month, week, and day views](docs/calendar.png)

### Task Management
![Task management with priority and due dates](docs/tasks.png)

### Settings
![Customizable settings and preferences](docs/settings.png)

## Demo

Try the live demo at: [Your deployed URL]

Use any valid email address to sign in and explore the app with pre-seeded data.