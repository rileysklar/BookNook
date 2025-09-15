# BookNook 📚

A mobile-first, map-based application that creates a global network of tiny libraries. Users seamlessly discover nearby libraries, contribute books through AI-powered photo parsing, and rate both literature and library craftsmanship.

## 🚀 Live Demo

**Production URL**: [https://booknook.vercel.app](https://booknook.vercel.app)

## ✨ Features

### Core Functionality
- **Interactive Map**: Mapbox-powered map with library markers
- **Library Management**: Create, edit, and delete tiny libraries
- **User Authentication**: Secure sign-in/sign-up with Clerk
- **Activity Tracking**: Complete user activity logging system
- **Crosshairs Integration**: One-click library creation workflow
- **Mobile Optimized**: Touch-friendly interface and responsive design

### Technical Features
- **Real-time Updates**: Map updates with new libraries instantly
- **Geolocation**: Automatic user location detection
- **Search Integration**: Location-based search with Mapbox Geocoding
- **Database Integration**: Supabase with PostGIS for geospatial queries
- **Error Handling**: Comprehensive error handling throughout

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** + ShadCN UI
- **Mapbox GL JS** for interactive maps
- **Clerk** for authentication

### Backend
- **Supabase** (PostgreSQL with PostGIS)
- **Next.js API Routes** for serverless functions
- **Row Level Security** for data protection

### Development
- **ESLint** + **Prettier** for code quality
- **GitHub** for version control
- **Vercel** for deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- Mapbox account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rileysklar/BookNook.git
   cd BookNook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   
   # Mapbox
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Run the complete schema migration
   # Copy and paste the SQL from supabase/complete-schema.sql into your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Guide

### Getting Started
1. **Sign up** for a new account
2. **Allow location access** when prompted
3. **Explore the map** to see existing libraries
4. **Click "Add Library"** to create your first library

### Creating Libraries
1. **Click "Add Library"** in QuickActions
2. **Position crosshairs** on the map where you want the library
3. **Click "Add Library"** on the crosshairs
4. **Fill out the form** with library details
5. **Submit** to create the library

### Managing Libraries
- **Click on library markers** to view details
- **Edit libraries** you've created
- **Delete libraries** you no longer need
- **View your activity** in the activity feed

## 🏗 Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── map/               # Main map page
│   └── (auth)/            # Authentication pages
├── components/            # React components
│   ├── maps/              # Map-related components
│   ├── library/           # Library management
│   └── ui/                # UI components
├── lib/                   # Utility libraries
│   ├── supabase/          # Database client
│   └── mapbox/            # Map utilities
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
└── types/                 # TypeScript definitions
```

### Database Schema
- **users**: User profiles (extends Clerk user data)
- **libraries**: Tiny library locations with PostGIS coordinates
- **activities**: User activity tracking
- **ratings**: User reviews and ratings

### API Endpoints
- `GET /api/libraries` - Fetch all libraries
- `POST /api/libraries` - Create new library
- `PUT /api/libraries/[id]` - Update library
- `DELETE /api/libraries/[id]` - Delete library
- `GET /api/activities` - Fetch user activities
- `POST /api/activities` - Log user activity

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Set Environment Variables**
   Add all your environment variables in Vercel dashboard

4. **Deploy**
   Click "Deploy" and wait for completion

5. **Update Clerk Settings**
   Add your Vercel domain to Clerk's allowed origins

### Environment Variables for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript strict mode** enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Zero build errors** - production ready

### Testing
- **Manual testing** of all user flows
- **Cross-browser compatibility** verified
- **Mobile responsiveness** tested
- **Error handling** comprehensive

## 📊 Current Status

### ✅ Completed Features
- **Authentication**: Complete Clerk integration
- **Map Integration**: Interactive Mapbox map with markers
- **Library CRUD**: Full create, read, update, delete operations
- **Activity Tracking**: Complete user activity logging
- **Crosshairs Integration**: One-click library creation
- **Error Handling**: Comprehensive error handling
- **Mobile Optimization**: Touch-friendly interface
- **Database Migration**: Activities table properly configured

### 🚀 Production Ready
- **Build Status**: ✅ Clean build with zero errors
- **TypeScript**: ✅ 100% type coverage
- **Linting**: ✅ All ESLint rules satisfied
- **Performance**: ✅ Optimized for production
- **Security**: ✅ Proper authentication and data protection

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mapbox** for mapping services
- **Supabase** for backend infrastructure
- **Clerk** for authentication
- **Vercel** for deployment platform
- **Next.js** team for the amazing framework

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Issues](https://github.com/rileysklar/BookNook/issues)** page
2. **Create a new issue** if your problem isn't already reported
3. **Include detailed information** about your environment and the problem

---

**Built with ❤️ for book lovers everywhere**