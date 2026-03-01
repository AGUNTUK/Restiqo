# Restiqa - Premium Travel & Accommodation Booking Platform

A modern, premium travel and accommodation booking web application built with Next.js, featuring a beautiful Claymorphism UI design.

![Restiqa](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200)

## 🌟 Features

### Core Features
- **🏠 Apartments** - Browse and book premium apartments
- **🏨 Hotels** - Discover luxury hotels and resorts
- **🎯 Tours & Experiences** - Explore curated tours and adventures
- **🔍 Advanced Search** - Search properties with filters and sorting
- **🖼️ Image Lightbox** - Full-screen image gallery with zoom

### User Features
- **Authentication System** - Sign up, login, logout with Supabase Auth
- **User Roles** - Guest, Host, and Admin roles
- **Dashboard** - Manage bookings, wishlist, and profile settings
- **Wishlist** - Save and share favorite properties
- **Reviews & Ratings** - Leave and view property reviews
- **Real-time Notifications** - Instant booking and message alerts
- **Chat System** - Direct messaging between hosts and guests
- **Multi-language Support** - English and Bengali (বাংলা)

### Host Features
- **Property Management** - Add, edit, and manage listings
- **Booking Management** - Handle guest bookings
- **Earnings Overview** - Track revenue and performance
- **Analytics Dashboard** - View property performance metrics
- **Pending Approvals** - Manage property approval requests

### Admin Features
- **User Management** - Manage all users
- **Property Approval** - Approve or reject listings
- **Review Moderation** - Moderate flagged reviews
- **Analytics Dashboard** - View platform statistics

## 🎨 Design

### Neomorphism UI
Restiqa features a modern Neomorphism design with:
- Soft rounded surfaces
- Subtle shadows
- Floating card-like elements
- Smooth gradients
- Premium minimalistic feel

### Brand Colors
- **Primary**: `#fc9905` (Orange)
- **Accent**: `#88C51C` (Green)
- **Secondary**: `#218877`
- **Background**: `#F4E2AD` / Soft light neutral

## 🛠 Technology Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Design**: Claymorphism Style
- **Backend**: Supabase
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (Chat & Notifications)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **i18n**: next-intl

## 📁 Project Structure

```
restiqo/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin panel
│   │   ├── apartments/         # Apartments listing
│   │   ├── auth/               # Authentication pages
│   │   ├── bookings/           # User bookings page
│   │   ├── dashboard/          # User dashboard
│   │   ├── hotels/             # Hotels listing
│   │   ├── host/               # Host dashboard & management
│   │   ├── property/           # Property details
│   │   ├── search/             # Search page
│   │   ├── tours/              # Tours listing
│   │   └── wishlist/           # User wishlist
│   ├── components/
│   │   ├── booking/            # Booking components (Calendar)
│   │   ├── chat/               # Real-time chat & notifications
│   │   ├── dashboard/          # Dashboard tabs
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   ├── mobile/             # Mobile-specific components
│   │   ├── reviews/            # Review form & list
│   │   ├── seo/                # SEO components
│   │   ├── ui/                 # Reusable UI components
│   │   └── wishlist/           # Wishlist components
│   ├── lib/
│   │   ├── auth/               # Auth context & hooks
│   │   ├── pricing/            # Pricing & discounts
│   │   ├── query/              # React Query provider
│   │   ├── realtime/           # Real-time subscriptions
│   │   ├── supabase/           # Supabase client config
│   │   └── validations/        # Zod schemas
│   ├── types/
│   │   └── database.ts         # TypeScript types
│   └── i18n/                   # Internationalization
│       └── messages/           # Translation files (en.json, bn.json)
├── supabase/
│   ├── schema.sql              # Database schema & RLS policies
│   └── realtime-schema.sql     # Realtime subscriptions
├── public/                     # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/restiqo.git
cd restiqo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the contents of `supabase/schema.sql`
   - Run `supabase/realtime-schema.sql` for real-time features
   - Enable Google OAuth in Authentication > Providers (optional)

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Restiqa
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

### Tables
- **users** - User profiles and roles
- **properties** - All property listings
- **property_images** - Property image gallery
- **tours** - Tour-specific details
- **bookings** - Booking records
- **reviews** - Property reviews
- **wishlists** - User wishlists
- **amenities** - Available amenities
- **conversations** - Chat conversations
- **messages** - Chat messages

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies for:
- Public read access for approved content
- User-specific access for personal data
- Role-based access for admin functions

### Realtime Subscriptions
Enabled for:
- New booking notifications
- Chat messages
- Review updates
- Property status changes

## 🔐 Authentication

Restiqa uses Supabase Auth with:
- Email/Password authentication
- Google OAuth (optional)
- Protected routes via middleware
- Role-based access control

### User Roles
- **Guest** - Can browse, book, and review
- **Host** - Can list and manage properties
- **Admin** - Full platform management

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Mobile navigation (bottom nav)
- Mobile gestures support
- Tablet-optimized layouts
- Desktop premium experience
- Smooth animations and transitions

## 🔄 Real-time Features

- **Chat** - Instant messaging between hosts and guests
- **Notifications** - Real-time booking and message alerts
- **Live Updates** - Property availability and booking status

## 🌍 Internationalization

Restiqa supports multiple languages:
- **English** (en) - Default
- **Bengali** (bn) - বাংলা

Language switcher available in the UI.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Restiqa
```

## 🎯 Target Audience

- **Primary**: Bangladesh market
- **Secondary**: Global travelers interested in Bangladesh

## 🔮 Future Enhancements

- [x] Real-time chat between hosts and guests
- [x] Multi-language support (English & Bengali)
- [ ] Payment integration (Stripe, bKash)
- [ ] Map integration with property locations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] SMS verification
- [ ] AI-powered search recommendations

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email hello@restiqa.com or join our Discord channel.

---

Built with ❤️ in Bangladesh
