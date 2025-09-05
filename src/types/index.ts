export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "venue_owner" | "admin";
  avatar?: string;
}

export interface VenueImage {
  id: string;
  venue: string;
  image: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  location?: string;
  location_name?: string;
  image: string;
  price: number;
  capacity: number;
  rating?: number;
  reviews?: number;
  bayesian_rating?: number;
  amenities?: string[];
  availability?: Date[];
  owner?: string;
  status: string; // e.g., 'approved', 'pending'
  eventType?: string;
  type?: string;
  lat?: number;
  lng?: number;
  created_at?: string;
  updated_at?: string;
  services?: Service[];
  images?: VenueImage[];
}

export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  date: Date;
  duration: number;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  specialRequests?: string;
}

export interface Service {
  id: string;
  venue?: string;
  name: string;
  description?: string;
  icon?: string;
  price: number;
  category?: string;
  type?: string; // snack, main, etc.
}

export interface EventPlan {
  date: Date;
  guests: number;
  eventType: string;
  budget: number;
  services: string[];
  specialRequests: string;
}
