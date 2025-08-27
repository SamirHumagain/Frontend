import { Venue, Service } from '../types';

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Grand Ballroom Palace',
    description: 'Elegant ballroom perfect for weddings and corporate events',
    location: 'New York, NY',
    images: [
      'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    price: 2500,
    capacity: 300,
    rating: 4.8,
    reviews: 127,
    amenities: ['Parking', 'Catering', 'Sound System', 'Lighting', 'Dance Floor'],
    availability: [],
    ownerId: '2',
    approved: true,
    type: 'wedding'
  },
  {
    id: '2',
    name: 'Rooftop Garden Venue',
    description: 'Beautiful outdoor venue with city skyline views',
    location: 'Los Angeles, CA',
    images: [
      'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    price: 1800,
    capacity: 150,
    rating: 4.6,
    reviews: 89,
    amenities: ['Outdoor Space', 'Bar', 'Lounge Area', 'City Views'],
    availability: [],
    ownerId: '2',
    approved: true,
    type: 'corporate'
  },
  {
    id: '3',
    name: 'Modern Conference Center',
    description: 'State-of-the-art facility for business events',
    location: 'Chicago, IL',
    images: [
      'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    price: 1200,
    capacity: 200,
    rating: 4.7,
    reviews: 156,
    amenities: ['AV Equipment', 'WiFi', 'Parking', 'Catering Kitchen'],
    availability: [],
    ownerId: '2',
    approved: true,
    type: 'conference'
  },
  {
    id: '4',
    name: 'Intimate Garden Party Space',
    description: 'Charming garden setting for smaller celebrations',
    location: 'Austin, TX',
    images: [
      'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    price: 800,
    capacity: 80,
    rating: 4.9,
    reviews: 45,
    amenities: ['Garden Setting', 'String Lights', 'Pergola', 'Fire Pit'],
    availability: [],
    ownerId: '2',
    approved: true,
    type: 'birthday'
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Event Planning',
    description: 'Complete event coordination and management',
    icon: 'Calendar',
    price: 500,
    category: 'Planning'
  },
  {
    id: '2',
    name: 'Catering Services',
    description: 'Gourmet food and beverage service',
    icon: 'Chef',
    price: 50,
    category: 'Food & Beverage'
  },
  {
    id: '3',
    name: 'Photography',
    description: 'Professional event photography',
    icon: 'Camera',
    price: 800,
    category: 'Documentation'
  },
  {
    id: '4',
    name: 'Live Music',
    description: 'Professional musicians and entertainment',
    icon: 'Music',
    price: 600,
    category: 'Entertainment'
  },
  {
    id: '5',
    name: 'Floral Design',
    description: 'Beautiful floral arrangements and centerpieces',
    icon: 'Flower',
    price: 300,
    category: 'Decoration'
  },
  {
    id: '6',
    name: 'Sound & Lighting',
    description: 'Professional audio-visual equipment',
    icon: 'Volume2',
    price: 400,
    category: 'Technical'
  }
];