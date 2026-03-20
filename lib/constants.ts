export const GUEST_OPTIONS = [
  { key: "adults", label: "Adults", sub: "Ages 13+", min: 1 },
  { key: "children", label: "Children", sub: "Ages 2–12", min: 0 },
  { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
] as const;

export type GuestType = typeof GUEST_OPTIONS[number]["key"];
