// This page may need to fetch general information about the service or company from the backend.
// API Needed: GET /api/about/
import { motion } from "framer-motion";

export function About() {
  const team = [
    {
      name: "Sarah Mitchell",
      role: "CEO & Founder",
      bio: "Former event planner with 15 years of experience in luxury events",
      image:
        "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      name: "David Chen",
      role: "CTO",
      bio: "Tech expert passionate about creating seamless user experiences",
      image:
        "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Operations",
      bio: "Operations specialist ensuring smooth venue partnerships",
      image:
        "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      name: "James Wilson",
      role: "Customer Success Manager",
      bio: "Dedicated to making every customer experience exceptional",
      image:
        "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
  ];

  const stats = [
    { number: "500+", label: "Verified Venues" },
    { number: "10,000+", label: "Successful Events" },
    { number: "50+", label: "Cities Covered" },
    { number: "98%", label: "Customer Satisfaction" },
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description:
        "VenueBook was founded with a vision to simplify event planning",
    },
    {
      year: "2021",
      title: "Platform Launch",
      description: "Launched our comprehensive venue booking platform",
    },
    {
      year: "2022",
      title: "Rapid Growth",
      description: "Expanded to 25 cities and partnered with 200+ venues",
    },
    {
      year: "2023",
      title: "Innovation Focus",
      description: "Introduced AI-powered event planning and mobile app",
    },
    {
      year: "2025",
      title: "Market Leader",
      description: "Now serving 50+ cities with 500+ premium venues",
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
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About VenueBook
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're passionate about making event planning effortless and
              enjoyable. Our mission is to connect people with the perfect
              venues for their most important moments.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-6">
                {/* Icon removed: Target */}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize event planning by creating a seamless platform
                that connects event organizers with exceptional venues, making
                every celebration memorable and stress-free.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
                {/* Icon removed: Heart */}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's most trusted event planning platform,
                where every venue is verified, every booking is secure, and
                every event becomes an unforgettable experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
                {/* Icon removed: Award */}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Values
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in excellence, transparency, and putting our
                customers first. Every venue is carefully vetted, and every
                booking is protected by our satisfaction guarantee.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              From a simple idea to transforming the event planning industry
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-purple-200"></div>

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative flex items-center mb-12"
              >
                <div className="absolute left-6 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="ml-20 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-primary-600 font-bold text-lg mb-2">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate people behind VenueBook's success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-600/20"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-primary-600 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
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
              Join Our Story
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Whether you're planning an event or own a venue, become part of
              the VenueBook community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
              >
                List Your Venue
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Plan Your Event
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
