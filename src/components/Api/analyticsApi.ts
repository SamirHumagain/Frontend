import axiosInstance from "./urls";

export const getAdminAnalytics = () => {
  return axiosInstance.get("/api/admin-dashboard/analytics/");
};
