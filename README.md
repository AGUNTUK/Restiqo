# Restiqa - Premium Travel & Accommodation Booking Platform

<p align="center">
  <img src="public/logo.png" alt="Restiqa Logo" width="200" />
</p>

<p align="center">
  <a href="https://restiqa.com">
    <img src="https://img.shields.io/website-up-down-green-red/http/restiqa.com.svg" alt="Website" />
  </a>
  <a href="https://github.com/facebook/react">
    <img src="https://img.shields.io/badge/React-19.2-blue.svg" alt="React" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16.1-black.svg" alt="Next.js" />
  </a>
  <a href="https://firebase.google.com">
    <img src="https://img.shields.io/badge/Firebase-12.10-orange.svg" alt="Firebase" />
  </a>
  <a href="https://typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind CSS-4-cyan.svg" alt="Tailwind CSS" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/Restiqa/restiqa.svg" alt="License" />
  </a>
</p>

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Supabase Setup](#supabase-setup)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Internationalization](#internationalization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## About

Restiqa is a modern, full-stack vacation rental and travel booking platform built with Next.js, Firebase, and Supabase. It allows users to discover and book apartments, hotels, and tours while providing hosts with powerful tools to manage their listings.

The platform is designed with a focus on user experience, featuring real-time messaging, wishlists, booking management, reviews, and a comprehensive host dashboard.

---

## Features

### 🏠 Property Listings
- Browse apartments, hotels, and tours
- Advanced search with filters (location, price, amenities)
- Property detail pages with image galleries
- Map-based property discovery
- Wishlist functionality

### 💳 Booking System
- Date-based availability calendar
- Booking request and confirmation flow
- Booking management (view, cancel)
- Booking history

### 👤 User Accounts
- Email/password authentication
- Google OAuth sign-in
- Facebook OAuth sign-in
- Phone number verification
- Email verification
- User profile management
- Profile photo upload

### 💬 Communication
- Real-time chat system
- In-app notifications
- Message notifications
- Chat read receipts

### ⭐ Reviews & Ratings
- Submit reviews for properties
- View property ratings and reviews
- Host responses to reviews

### 📊 Host Dashboard
- Host registration
- Property listings management
- Booking analytics
- Earnings overview
- Pending bookings approval

### 🛡️ Legal & Compliance
- Privacy policy
- Terms of service
- Cookie policy
- Data deletion policy
- COVID-19 response policy

### 🌐 Additional Features
- Multi-language support (English, Bengali)
- Dark/light theme toggle
- Push notifications
- PWA (Progressive Web App) support
- SEO optimization
- Analytics integration

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Validation**: Zod
- **Date Handling**: date-fns

### Backend & Services
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Real-time Database**: Firebase Realtime Database
- **Storage**: Firebase Storage
- **Analytics**: Firebase Analytics, Vercel Analytics
- **Serverless**: Supabase Edge Functions

### Developer Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **PWA**: Service Workers, Web App Manifest

---

## Project Structure

```
restiqa/
├── public/                     # Static assets
│   ├── logo.png               # App logo
│   ├── manifest.json         # PWA manifest
│   └── *.svg                 # SVG icons
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx          # Homepage
│   │   ├── search/           # Search page
│   │   ├── property/[id]/    # Property detail page
│   │   ├── apartments/        # Apartments listing
│   │   ├── hotels/           # Hotels listing
│   │   ├── tours/            # Tours listing
│   │   ├── bookings/         # User bookings
│   │   ├── wishlist/         # User wishlist
│   │   ├── profile/          # User profile
│   │   ├── dashboard/        # User dashboard
│   │   ├── host/             # Host dashboard
│   │   ├── chat/             # Chat system
│   │   ├── auth/             # Authentication pages
│   │   ├── admin/            # Admin panel
│   │   └── legal/            # Legal pages
│   ├── components/           # React components
│   │   ├── booking/          # Booking components
│   │   ├── chat/             # Chat components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/           # Layout components
│   │   ├── mobile/           # Mobile-specific components
│   │   ├── reviews/          # Review components
│   │   ├── seo/              # SEO components
│   │   └── ui/               # UI components
│   ├── lib/                   # Library functions
│   │   ├── auth/             # Authentication context
│   │   ├── firebase/         # Firebase services
│   │   ├── notifications/    # Notification services
│   │   ├── pricing/          # Pricing logic
│   │   ├── query/            # React Query provider
│   │   ├── realtime/         # Real-time services
│   │   ├── recommendations/  # Recommendation engine
│   │   ├── supabase/         # Supabase client
│   │   ├── theme/            # Theme provider
│   │   └── validations/      # Zod schemas
│   ├── i18n/                 # Internationalization
│   │   ├── messages/         # Translation files
│   │   │   ├── en.json       # English
│   │   │   └── bn.json       # Bengali
│   │   └── config.ts         # i18n configuration
│   └── types/                # TypeScript types
├── firebase/                  # Firebase configuration
│   ├── SETUP.md             # Firebase setup guide
│   ├── firestore-schema.md  # Firestore schema
│   └── firestore.rules      # Firestore security rules
├── supabase/                  # Supabase configuration
│   ├── schema.sql           # Database schema
│   ├── functions/           # Edge functions
│   └── *.sql               # Additional schemas
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

---

## Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**: 18.x or later
- **npm**: 9.x or later
- **Firebase Account**: For authentication and database
- **Supabase Account**: For serverless functions (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/restiqa.git
   cd restiqa
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com

   # Supabase Configuration (optional)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID | No |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | No |
| `NEXT_PUBLIC_SITE_URL` | Site URL for SEO | Yes |

---

## Firebase Setup

Restiqa uses Firebase for authentication, database, and storage. Follow these steps to set up Firebase:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional but recommended)

### 2. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google
   - Facebook
   - Phone (optional)

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Choose a location near your users
3. Start in **Test Mode** (you can configure rules later)

### 4. (Optional) Create Realtime Database

If you want real-time chat:
1. Go to **Realtime Database** → **Create Database**
2. Choose the same location as Firestore
3. Start in **Test Mode**

### 5. Configure Security Rules

Deploy the security rules from `firebase/firestore.rules`:

```bash
 firebase deploy --only firestore:rules
```

### 6. Enable Storage

1. Go to **Storage** → **Get Started**
2. Start in **Test Mode**

### 7. Get Configuration

1. Go to **Project Settings** → **General**
2. Register a web app
3. Copy the Firebase config values

For detailed setup instructions, see [Firebase Setup Guide](firebase/SETUP.md).

---

## Supabase Setup

Supabase is used for serverless functions (email/SMS notifications).

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project

### 2. Run Database Schema

1. Go to **SQL Editor** in Supabase
2. Copy and run the contents of `supabase/schema.sql`

### 3. Configure Environment Variables

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy send-email
supabase functions deploy send-sms
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## API Documentation

### Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured properties |
| `/search` | Search and filter properties |
| `/property/[id]` | Property detail page |
| `/apartments` | Apartments listing |
| `/hotels` | Hotels listing |
| `/tours` | Tours listing |
| `/bookings` | User's bookings |
| `/wishlist` | User's wishlist |
| `/profile` | User profile |
| `/dashboard` | User dashboard |
| `/host` | Host dashboard |
| `/host/listings` | Host property listings |
| `/host/analytics` | Host analytics |
| `/chat` | Chat inbox |
| `/chat/[id]` | Chat conversation |
| `/auth/login` | Login page |
| `/auth/signup` | Signup page |
| `/auth/verify-email` | Email verification |
| `/admin` | Admin panel |

### API Endpoints (Supabase Functions)

| Endpoint | Description |
|----------|-------------|
| `/send-email` | Send email notifications |
| `/send-sms` | Send SMS notifications |

---

## Internationalization

Restiqa supports multiple languages using `next-intl`. Currently supported languages:

- **English** (`en`) - Default
- **Bengali** (`bn`)

### Adding New Languages

1. Add translation messages to `src/i18n/messages/`
2. Update `src/i18n/config.ts` with the new locale
3. Update the metadata in `src/app/layout.tsx`

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Configure environment variables
5. Deploy

```bash
npm run build
```

### Deploy to Other Platforms

The application can be deployed to any platform supporting Next.js:

- **AWS**: Using Amplify or ECS
- **Google Cloud**: Using Cloud Run
- **Azure**: Using Container Instances

---

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

If you encounter any issues or have questions:

- 📧 Email: support@restiqa.com
- 💬 Live Chat: Available on the website
- 📖 Documentation: [docs.restiqa.com](https://docs.restiqa.com)

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

<p align="center">
  Made with ❤️ by <a href="https://restiqa.com">Restiqa Team</a>
</p>
