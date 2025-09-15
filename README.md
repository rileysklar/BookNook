# 📚 BookNook

A mobile-first, map-based application that creates a global network of tiny libraries. Users seamlessly discover nearby libraries, contribute books through AI-powered photo parsing, and rate both literature and library craftsmanship.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mapbox account and access token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booknook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Mapbox access token:
   ```env
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_mapbox_token_here
   ```

4. **Get a Mapbox access token**
   - Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
   - Create a new token or use your default public token
   - Copy the token to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The app uses Supabase for the database. To set up the database:

1. **Create a Supabase project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Add Supabase credentials to environment**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the database schema**
   - Open your Supabase SQL Editor
   - Copy and paste the contents of `supabase/complete-schema.sql`
   - Execute the SQL to create all tables, indexes, and functions
   - The schema includes the `activities` table for tracking user actions and search history

## 🗂 Project Structure

```
booknook/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── map/                      # Map interface (main screen)
│   │   │   └── page.tsx             # Map page component
│   │   ├── globals.css               # SINGLE SOURCE OF TRUTH for styling
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page (redirects to map)
│   ├── components/                    # Reusable UI components
│   │   └── maps/                     # Map-related components
│   │       ├── Map.tsx               # Main Mapbox component
│   │       └── BottomSheet.tsx       # Bottom sheet menu
│   ├── lib/                          # Utility libraries
│   │   └── mapbox/                   # Mapbox utilities
│   │       ├── mapbox-client.ts      # Mapbox client & utilities
│   │       └── mapbox.css            # Mapbox styling
│   └── types/                        # TypeScript definitions
├── env.example                       # Environment variables template
└── README.md                         # This file
```

## 🗺 Mapbox Integration

The application uses Mapbox GL JS for the interactive map interface. Key features include:

- **Full-screen map** (100dvh × 100dvw)
- **Geolocation** with automatic user positioning
- **Interactive controls** (zoom, compass, locate me)
- **Bottom sheet menu** with smooth animations
- **Mobile-first design** optimized for touch interactions

### Mapbox Configuration

The map is configured in `src/lib/mapbox/mapbox-client.ts` with:
- Default center coordinates
- Zoom levels
- Map style (streets-v12)
- Custom controls and interactions

## 🎨 Design System

The application follows a **Single Source of Truth** philosophy where `src/app/globals.css` contains all design tokens including:

- Color palette
- Spacing scale
- Border radius values
- Shadow definitions
- Typography settings

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Standards

- **TypeScript strict mode** - Comprehensive type coverage
- **DRY principles** - No code duplication
- **Component composition** - Reusable UI primitives
- **Mobile-first** - Responsive design approach

## 🚧 Next Steps

The current implementation includes:
- ✅ Mapbox integration with full-screen map
- ✅ Bottom sheet menu with smooth animations
- ✅ Geolocation and user positioning
- ✅ Basic map controls and interactions

Upcoming features:
- [ ] Authentication with Clerk
- [ ] Database integration with Supabase
- [ ] Book contribution workflow
- [ ] AI-powered image parsing
- [ ] Search and discovery features

## 📱 Mobile Experience

The application is designed for mobile-first usage with:
- Touch-optimized interactions
- Full-screen map experience
- Native-like bottom sheet animations
- Responsive design patterns

## 🤝 Contributing

1. Follow the established file structure
2. Maintain DRY principles
3. Use design tokens from `globals.css`
4. Write self-documenting code
5. Test on mobile devices

## 📄 License

[Add your license here]
