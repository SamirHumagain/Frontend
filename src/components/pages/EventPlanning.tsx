// Event planning page will need to create and view events, possibly book venues.
// API Needed: POST /api/events/, GET /api/venues/, POST /api/reservations/
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { EventPlan } from "../../types";
import { useEffect } from "react";

export function EventPlanning() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventPlan, setEventPlan] = useState<Partial<EventPlan>>({
    date: undefined,
    guests: 50,
    eventType: "",
    budget: 2000,
    services: [],
    specialRequests: "",
  });

  useEffect(() => {
    // getEventList() can be used here if needed for future features
  }, []);

  const eventTypes = [
    { value: "wedding", label: "Wedding", icon: "💒" },
    { value: "corporate", label: "Corporate Event", icon: "🏢" },
    { value: "birthday", label: "Birthday Party", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💕" },
    { value: "graduation", label: "Graduation", icon: "🎓" },
    { value: "other", label: "Other", icon: "🎉" },
  ];

  const budgetRanges = [
    { value: 1000, label: "Under $1,000" },
    { value: 2000, label: "$1,000 - $2,000" },
    { value: 5000, label: "$2,000 - $5,000" },
    { value: 10000, label: "$5,000 - $10,000" },
    { value: 20000, label: "Over $10,000" },
  ];

  const steps = [
    { number: 1, title: "Event Details", icon: Calendar },
    { number: 2, title: "Services", icon: CheckCircle },
    { number: 3, title: "Summary", icon: ArrowRight },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getRecommendations = () => {
    if (!eventPlan.eventType || !eventPlan.guests) return [];

    const recommendations = [];

    if (eventPlan.eventType === "wedding") {
      recommendations.push(
        "Consider our Photography & Videography service to capture your special day"
      );
      recommendations.push(
        "Floral Design will add elegance to your wedding venue"
      );
    } else if (eventPlan.eventType === "corporate") {
      recommendations.push(
        "Audio Visual Equipment is essential for presentations"
      );
      recommendations.push(
        "Professional catering will impress your colleagues"
      );
    }

    if ((eventPlan.guests || 0) > 100) {
      recommendations.push(
        "Event Planning service recommended for larger events"
      );
    }

    return recommendations;
  };

  // Example: Render events somewhere in your UI
  // <ul>{events.map(event => <li key={event.id}>{event.name}</li>)}</ul>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-luxury-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plan Your Perfect Event
            </h1>
            <p className="text-xl opacity-90">
              Let us help you create an unforgettable experience with our
              interactive planning tool
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.number
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon size={20} />
                </div>
                <div className="ml-3 hidden sm:block">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  >
                    Step {step.number}
                  </div>
                  <div
                    className={`text-sm ${
                      currentStep >= step.number
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ml-6 ${
                      currentStep > step.number
                        ? "bg-primary-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tell us about your event
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={
                      eventPlan.date
                        ? eventPlan.date.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEventPlan((prev) => ({
                        ...prev,
                        date: new Date(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={eventPlan.guests}
                    onChange={(e) =>
                      setEventPlan((prev) => ({
                        ...prev,
                        guests: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Event Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eventTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setEventPlan((prev) => ({
                          ...prev,
                          eventType: type.value,
                        }))
                      }
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        eventPlan.eventType === type.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Budget Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetRanges.map((range) => (
                    <motion.button
                      key={range.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setEventPlan((prev) => ({
                          ...prev,
                          budget: range.value,
                        }))
                      }
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        eventPlan.budget === range.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <DollarSign className="inline mr-2" size={20} />
                      {range.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Choose your services
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Render services from API here if needed */}
              </div>

              {/* Recommendations */}
              {getRecommendations().length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    💡 Recommendations for your event:
                  </h3>
                  <ul className="space-y-2">
                    {getRecommendations().map((rec, index) => (
                      <li
                        key={index}
                        className="text-blue-800 text-sm flex items-start"
                      >
                        <CheckCircle
                          size={16}
                          className="text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                        />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Event Summary
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Event Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {eventPlan.date
                          ? eventPlan.date.toLocaleDateString()
                          : "Not selected"}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users size={16} className="mr-2" />
                        {eventPlan.guests} guests
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {eventTypes.find((t) => t.value === eventPlan.eventType)
                          ?.label || "Not selected"}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={16} className="mr-2" />
                        Budget: ${eventPlan.budget?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Selected Services
                    </h3>
                    <div className="space-y-2">
                      {/* Render selected services from API here if needed */}
                    </div>

                    {/* Show total here if needed */}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={eventPlan.specialRequests}
                  onChange={(e) =>
                    setEventPlan((prev) => ({
                      ...prev,
                      specialRequests: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any special requirements or requests for your event..."
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                  <h3 className="font-semibold text-green-900">
                    Ready to submit your event plan!
                  </h3>
                </div>
                <p className="text-green-800 text-sm">
                  Our team will review your requirements and get back to you
                  within 24 hours with a detailed proposal.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={
                currentStep === 3
                  ? () => alert("Event plan submitted!")
                  : handleNext
              }
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {currentStep === 3 ? "Submit Plan" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
