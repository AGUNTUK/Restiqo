export const GUEST_OPTIONS = [
  { key: "adults", label: "Adults", sub: "Ages 13+", min: 1 },
  { key: "children", label: "Children", sub: "Ages 2–12", min: 0 },
  { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
] as const;

export type GuestType = typeof GUEST_OPTIONS[number]["key"];

export const POPULAR_LOCATIONS = [
  { 
    name: "Cox’s Bazar", 
    image: "https://images.unsplash.com/photo-1590001158193-790130ae8f2a?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Dhaka", 
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sajek", 
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sylhet", 
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Bandarban", 
    image: "https://images.unsplash.com/photo-1623944889288-cd147dbb517c?q=80&w=300&auto=format&fit=crop" 
  },
] as const;
