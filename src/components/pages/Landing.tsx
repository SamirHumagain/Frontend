// This page likely needs to fetch a list of venues, featured events, or general info from the backend.
// API Needed: GET /api/venues/ (list venues), GET /api/events/ (list events)
import { motion } from "framer-motion";
// Icons removed for lint cleanup

interface LandingProps {
  onPageChange: (page: string) => void;
}

export function Landing({ onPageChange }: LandingProps) {
  const features = [
    {
      title: "Secure Bookings",
      description: "Safe and secure payment processing with full protection",
    },
    {
      title: "Verified Venues",
      description: "All venues are verified and quality-checked by our team",
    },
    {
      title: "Expert Support",
      description: "24/7 customer support to help you plan the perfect event",
    },
    {
      title: "Easy Scheduling",
      description: "Simple booking process with real-time availability",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Lee",
      role: "Wedding Planner",
      content:
        "Outstanding service and beautiful venues. Our corporate events have never looked better.",
      rating: 5,
      avatar:
        "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      name: "Emily Rodriguez",
      role: "Birthday Party Host",
      content:
        "From booking to the actual event, everything was seamless. Highly recommend!",
      rating: 5,
      avatar:
        "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1920')] opacity-5 bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
                Find Your
                <span className="bg-luxury-gradient bg-clip-text text-transparent block">
                  Explore Venues
                </span>
              </h1>
              <p className="text-xl text-text/70 mb-8 leading-relaxed">
                Discover and book stunning venues for weddings, corporate
                events, birthdays, and special celebrations. Make your event
                unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange("venues")}
                  className="px-8 py-4 bg-luxury-gradient text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Explore Venues
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange("planning")}
                  className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all duration-300"
                >
                  Start Planning
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Beautiful venue"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
              </div>
              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-background rounded-xl shadow-xl p-6 border border-secondary-200"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      500+
                    </div>
                    <div className="text-sm text-text/60">Venues</div>
                  </div>
                  <div className="w-px h-12 bg-primary-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-500">
                      10K+
                    </div>
                    <div className="text-sm text-text/60">Events</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">
              Why Choose VenueBook?
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              {/* Icon removed: {feature.title} */}
              comprehensive platform
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-xl border border-primary-100 hover:border-secondary-300 hover:shadow-lg transition-all duration-300 bg-background"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl mb-4">
                  {/* Icon removed */}
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-text/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-text/70">
              Join thousands of happy customers who trusted us with their
              special events
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-background rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary-100"
              >
                <div className="flex items-center mb-4">
                  {/* Star icons removed */}
                </div>
                <p className="text-text/80 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-text">
                      {testimonial.name}
                    </div>
                    <div className="text-text/60 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
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
            className=""
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers and make your next event
              unforgettable
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange("venues")}
              className="px-8 py-4 bg-background text-primary-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
