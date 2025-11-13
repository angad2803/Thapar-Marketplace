# University Marketplace - Client

Frontend React application for the University Marketplace platform.

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form handling

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── Navbar.tsx   # Navigation bar
│   └── NavLink.tsx  # Navigation links
├── pages/           # Page components
│   ├── Landing.tsx  # Landing page
│   ├── Login.tsx    # Login page
│   ├── Register.tsx # Registration page
│   ├── Dashboard.tsx # User dashboard
│   ├── PostItem.tsx # Post new item
│   └── ProductDetails.tsx # Product details
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
│   └── utils.ts     # Helper functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
# or
bun install
```

### Environment Variables

Create a `.env` file in the client folder:

```env
VITE_API_URL=http://localhost:3000/api
```

### Development Server

```bash
npm run dev
```

The app will be available at http://localhost:8080

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## 📝 Code Style

- ESLint is configured for code quality
- Run linting: `npm run lint`
- TypeScript strict mode is enabled

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## 📦 Key Dependencies

- `react` & `react-dom` - UI framework
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form management
- `lucide-react` - Icon library
- `date-fns` - Date utilities
- `clsx` & `tailwind-merge` - Utility classes

## 🔗 API Integration

The client communicates with the backend API at the URL specified in `VITE_API_URL`. All API calls should be prefixed with this base URL.

Example:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/products`);
```
