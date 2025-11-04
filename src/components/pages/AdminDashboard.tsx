import { useState, useEffect } from "react";
import Modal from "../Modal";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  getAdminDashboardStats,
  getAdminUserList,
  getAdminVenueList,
  getAdminBookingList,
} from "../Api/getapi";
import { approveVenue, rejectVenue } from "../Api/venueActions";
import { suspendUser, deleteUser } from "../Api/postapi";
import axiosInstance from "../Api/urls";
import { getAdminAnalytics } from "../Api/analyticsApi";

function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [userFilter, setUserFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getAdminDashboardStats(),
      getAdminUserList(),
      getAdminVenueList(),
      getAdminBookingList(),
      getAdminAnalytics(),
    ]).then(([statsRes, usersRes, venuesRes, bookingsRes, analyticsRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVenues(venuesRes.data);
      setBookings(bookingsRes.data);
      setAnalytics(analyticsRes.data);
    });
  }, []);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "venues",
      label: "Venue Approvals",
      count: venues.filter((v) => v.status === "pending").length,
    },
    {
      id: "users",
      label: "Users",
      count: users.length,
    },
    {
      id: "analytics",
      label: "Analytics",
    },
  ];

  const pendingVenues = venues.filter((v) => v.status === "pending");
  // Booking status filter for recent bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const filteredRecentBookings = bookings
    .filter((b) =>
      bookingStatusFilter === "all" ? true : b.status === bookingStatusFilter
    )
    .slice(0, 5);
  const filteredUsers =
    userFilter === "all"
      ? users
      : users.filter((u) =>
          userFilter === "venue_owner"
            ? u.user_type === "venue_owner"
            : u.user_type !== "venue_owner"
        );

  const handleApprove = async (venueId: number) => {
    setActionLoading(venueId);
    try {
      await approveVenue(venueId);
      setVenues((prev) =>
        prev.map((v) => (v.id === venueId ? { ...v, status: "approved" } : v))
      );
      setStats((prev: any) =>
        prev && typeof prev.pendingApprovals === "number"
          ? {
              ...prev,
              pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
            }
          : prev
      );
      toast.success("Venue approved");
    } catch (e) {
      toast.error("Failed to approve venue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (venueId: number) => {
    setActionLoading(venueId);
    try {
      await rejectVenue(venueId);
      setVenues((prev) =>
        prev.map((v) => (v.id === venueId ? { ...v, status: "rejected" } : v))
      );
      toast.success("Venue rejected");
    } catch (e) {
      toast.error("Failed to reject venue");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId: number) => {
    try {
      await suspendUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );
      toast.success("User suspended");
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      await axiosInstance.patch(`/api/users/${userId}/`, { is_active: true });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u))
      );
      toast.success("User activated");
    } catch {
      toast.error("Failed to activate user");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage platform operations and analytics
              </p>
            </div>
            <div className="flex items-center text-right">
              <div className="mr-6">
                <div className="text-2xl font-bold text-primary-600">
                  {stats.pendingApprovals}
                </div>
                <div className="text-sm text-gray-600">Pending Actions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers?.toLocaleString?.() ?? stats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Venues
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVenues}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{" "}
                  {stats.totalRevenue?.toLocaleString?.() ?? stats.totalRevenue}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingApprovals}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Events
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.activeEvents}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Bookings
                    </h3>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filteredRecentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {booking.venueName || booking.venue_name}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${
                                booking.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                              ${
                                booking.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : ""
                              }
                              ${
                                booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                              }
                            `}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            Customer:{" "}
                            {booking.customerName || booking.customer_name}
                          </p>
                          <p>
                            Date:{" "}
                            {booking.event_date
                              ? new Date(
                                  booking.event_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            Amount: Rs{" "}
                            {booking.amount || booking.total_price || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Platform Health
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="font-medium text-green-900">
                          System Status: Operational
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Growth Metrics
                      </h4>
                      <div className="text-sm text-blue-800">
                        <p>• 15% increase in bookings this month</p>
                        <p>• 8 new venues added this week</p>
                        <p>• 92% customer satisfaction rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Venue Approvals Tab */}
            {activeTab === "venues" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pending Venue Approvals
                  </h2>
                </div>
                <div className="space-y-6">
                  {pendingVenues.map((venue, index) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            venue.images && venue.images.length > 0
                              ? venue.images[0].image
                              : venue.image || "/placeholder.jpg"
                          }
                          alt={venue.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name}
                              </h3>
                              <p className="text-gray-600">
                                Owner:{" "}
                                {venue.owner_details?.name ||
                                  venue.owner_details?.email ||
                                  "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                Rs {venue.price}
                              </div>
                              <div className="text-sm text-gray-600">
                                per event
                              </div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              {venue.location}
                            </div>
                            <div className="flex items-center">
                              Up to {venue.capacity} guests
                            </div>
                            <div className="flex items-center">
                              Submitted{" "}
                              {venue.created_at
                                ? new Date(
                                    venue.created_at
                                  ).toLocaleDateString()
                                : ""}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                              onClick={() => handleApprove(venue.id)}
                              disabled={actionLoading === venue.id}
                            >
                              {actionLoading === venue.id
                                ? "Approving..."
                                : "Approve"}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                              onClick={() => handleReject(venue.id)}
                              disabled={actionLoading === venue.id}
                            >
                              {actionLoading === venue.id
                                ? "Rejecting..."
                                : "Reject"}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                              onClick={() => {
                                setSelectedOwner(venue.owner_details);
                                setOwnerModalOpen(true);
                              }}
                            >
                              View Details
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Management
                  </h2>
                  <div className="flex space-x-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <option value="all">All Users</option>
                      <option value="event_planner">Event Planners</option>
                      <option value="venue_owner">Venue Owners</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {`Bookings / Venues`}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                user.user_type === "venue_owner"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {user.user_type === "venue_owner"
                                ? "Venue Owner"
                                : "Event Planner"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.user_type === "venue_owner"
                              ? `${user.venues ?? 0} venues`
                              : `${user.bookings ?? 0} bookings`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.date_joined
                              ? new Date(user.date_joined).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.is_active ? "active" : "inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.is_active ? (
                              <button
                                className="text-yellow-600 hover:text-yellow-900 mr-3"
                                onClick={() => handleSuspend(user.id)}
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                className="text-green-600 hover:text-green-900 mr-3"
                                onClick={() => handleActivate(user.id)}
                              >
                                Activate
                              </button>
                            )}
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Platform Analytics
                </h2>
                {analytics ? (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Analytics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">This Month</span>
                          <span className="font-semibold text-green-600">
                            Rs {analytics.revenue.this_month}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Month</span>
                          <span className="font-semibold">
                            Rs {analytics.revenue.last_month}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Growth Rate</span>
                          <span className="font-semibold text-green-600">
                            {analytics.revenue.growth_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        User Engagement
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Daily Active Users
                          </span>
                          <span className="font-semibold">
                            {analytics.user_engagement.daily_active_users}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Avg. Session Duration
                          </span>
                          <span className="font-semibold">
                            {analytics.user_engagement.avg_session_duration} min
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Bounce Rate</span>
                          <span className="font-semibold">
                            {analytics.user_engagement.bounce_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Growth Metrics
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Bookings This Month
                          </span>
                          <span className="font-semibold">
                            {analytics.growth_metrics.bookings_this_month}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            New Venues This Week
                          </span>
                          <span className="font-semibold">
                            {analytics.growth_metrics.venues_this_week}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Customer Satisfaction
                          </span>
                          <span className="font-semibold">
                            {analytics.growth_metrics.customer_satisfaction}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Loading analytics...</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Owner Details Modal */}
      <Modal isOpen={ownerModalOpen} onClose={() => setOwnerModalOpen(false)}>
        {selectedOwner && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedOwner.profile_image}
                alt={selectedOwner.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedOwner.name}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedOwner.email}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedOwner.user_type === "venue_owner"
                    ? "Venue Owner"
                    : selectedOwner.user_type}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {selectedOwner.phone || "-"}
              </div>
              <div>
                <span className="font-medium">Address:</span>{" "}
                {selectedOwner.address || "-"}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminDashboard;
