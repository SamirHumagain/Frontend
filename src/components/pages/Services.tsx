import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChefHat as Chef,
  Camera,
  Music,
  Flower,
  Volume2,
  Palette,
  Utensils,
  Mic,
  Gift,
} from "lucide-react";

export function Services() {
  const services = [
    {
      icon: Calendar,
      title: "Event Planning & Coordination",
      description: "Complete event management from concept to execution",
      features: [
        "Timeline creation",
        "Vendor coordination",
        "Day-of management",
        "Budget planning",
      ],
      price: "From $500",
      popular: true,
    },
    {
      icon: Chef,
      title: "Catering Services",
      description: "Gourmet cuisine and professional catering staff",
      features: [
        "Custom menus",
        "Dietary accommodations",
        "Professional service",
        "Cleanup included",
      ],
      price: "From $50/person",
      popular: false,
    },
    {
      icon: Camera,
      title: "Photography & Videography",
      description: "Capture every precious moment of your special day",
      features: [
        "Event photography",
        "Video recording",
        "Photo editing",
        "Online gallery",
      ],
      price: "From $800",
      popular: false,
    },
    {
      icon: Music,
      title: "Entertainment & DJ Services",
      description: "Professional DJs and live entertainment options",
      features: [
        "Professional DJ",
        "Sound system",
        "Lighting effects",
        "Music curation",
      ],
      price: "From $600",
      popular: false,
    },
    {
      icon: Flower,
      title: "Floral Design & Decoration",
      description: "Beautiful floral arrangements and venue decoration",
      features: ["Centerpieces", "Bouquets", "Venue styling", "Custom designs"],
      price: "From $300",
      popular: false,
    },
    {
      icon: Volume2,
      title: "Audio Visual Equipment",
      description: "Professional sound and lighting equipment rental",
      features: [
        "Sound systems",
        "Microphones",
        "Projectors",
        "Lighting setup",
      ],
      price: "From $400",
      popular: false,
    },
    {
      icon: Palette,
      title: "Event Design & Styling",
      description: "Transform your venue with stunning design concepts",
      features: [
        "Theme development",
        "Color coordination",
        "Decor rental",
        "Setup service",
      ],
      price: "From $350",
      popular: false,
    },
    {
      icon: Utensils,
      title: "Bar Services",
      description: "Professional bartending and beverage service",
      features: [
        "Licensed bartenders",
        "Cocktail menu",
        "Bar setup",
        "Glassware included",
      ],
      price: "From $300",
      popular: false,
    },
    {
      icon: Mic,
      title: "MC & Host Services",
      description: "Professional event hosting and coordination",
      features: [
        "Event hosting",
        "Announcements",
        "Timeline management",
        "Guest coordination",
      ],
      price: "From $250",
      popular: false,
    },
  ];

  const packages = [
    {
      name: "Essential Package",
      price: "$1,200",
      description: "Perfect for intimate gatherings",
      features: [
        "Event coordination",
        "Basic catering (up to 50 guests)",
        "Photography (4 hours)",
        "Basic decorations",
      ],
      color: "from-blue-500 to-primary-500",
    },
    {
      name: "Premium Package",
      price: "$2,800",
      description: "Complete event solution",
      features: [
        "Full event planning",
        "Premium catering (up to 150 guests)",
        "Photography & videography",
        "DJ services",
        "Floral arrangements",
        "Lighting & sound",
      ],
      color: "from-purple-500 to-pink-600",
      popular: true,
    },
    {
      name: "Luxury Package",
      price: "$5,500",
      description: "Ultimate premium experience",
      features: [
        "Dedicated event manager",
        "Gourmet catering (up to 300 guests)",
        "Professional photography team",
        "Live entertainment",
        "Custom floral design",
        "Full AV setup",
        "Event styling",
      ],
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Event Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From planning to execution, we offer comprehensive services to
              make your event unforgettable. Choose individual services or
              complete packages tailored to your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Professional services to elevate your event experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                  service.popular
                    ? "border-indigo-200 shadow-lg"
                    : "border-gray-100 hover:border-indigo-200"
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-luxury-gradient text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${
                      service.popular ? "bg-indigo-100" : "bg-gray-100"
                    }`}
                  >
                    <service.icon
                      className={
                        service.popular ? "text-primary-600" : "text-gray-600"
                      }
                      size={32}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-2xl font-bold text-primary-500">
                    {service.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    service.popular
                      ? "bg-luxury-gradient text-white hover:bg-indigo-700"
                      : "border-2 border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-primary-500"
                  }`}
                >
                  Get Quote
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Service Packages
            </h2>
            <p className="text-xl text-gray-600">
              Complete solutions designed for different event sizes and budgets
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  pkg.popular ? "ring-2 ring-indigo-500 scale-105" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}

                <div
                  className={`h-32 bg-gradient-to-r ${pkg.color} ${
                    pkg.popular ? "mt-10" : ""
                  }`}
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <div className="text-3xl font-bold">{pkg.price}</div>
                      <div className="opacity-90">{pkg.name}</div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-gray-600 mb-6 text-center">
                    {pkg.description}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    Choose Package
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-luxury-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Plan Your Event?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Let our expert team help you create an unforgettable experience.
              Get a custom quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-500 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
              >
                Get Custom Quote
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-500 transition-all duration-300"
              >
                Schedule Consultation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
