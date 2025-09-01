import {
  Calendar,
  Users,
  Star,
  Camera,
  Utensils,
  Settings,
  Package,
} from "lucide-react";

export function Services() {
  // Static services for a venue reservation platform
  const services = [
    {
      name: "Venue Booking",
      description:
        "Book premium venues for weddings, conferences, birthdays, and more. Easy search, instant booking, and transparent pricing.",
      price: "Varies by venue",
      icon: <Calendar size={32} className="text-primary-600" />,
    },
    {
      name: "Event Planning Assistance",
      description:
        "Get expert help with event planning, vendor coordination, and on-site management for a seamless experience.",
      price: "Custom Packages",
      icon: <Settings size={32} className="text-primary-600" />,
    },
    {
      name: "Catering Services",
      description:
        "Choose from a variety of catering partners to suit your event’s needs, from snacks to full-course meals.",
      price: "On Request",
      icon: <Utensils size={32} className="text-primary-600" />,
    },
    {
      name: "Decoration & Setup",
      description:
        "Professional decoration and event setup services to match your theme and preferences.",
      price: "On Request",
      icon: <Star size={32} className="text-primary-600" />,
    },
    {
      name: "Audio/Visual Equipment Rental",
      description:
        "Rent projectors, sound systems, lighting, and more for your event.",
      price: "On Request",
      icon: <Users size={32} className="text-primary-600" />,
    },
    {
      name: "Photography & Videography",
      description:
        "Capture your special moments with our trusted photography and videography partners.",
      price: "On Request",
      icon: <Camera size={32} className="text-primary-600" />,
    },
    {
      name: "Custom Event Packages",
      description:
        "Bundle multiple services for a discounted rate and a hassle-free experience.",
      price: "Contact us for details",
      icon: <Package size={32} className="text-primary-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-luxury-gradient py-16 mb-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Everything you need to make your event a success, from venue booking
            to full event management.
          </p>
        </div>
      </section>
      {/* Services Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {service.name}
              </h2>
              <p className="text-gray-600 mb-3 flex-1">{service.description}</p>
              <div className="text-primary-700 font-bold mb-1 text-base">
                {service.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
