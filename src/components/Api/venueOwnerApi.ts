import axiosInstance from "./urls";

export const getVenueOwnerProfile = () => {
  return axiosInstance.get("/api/user-dashboard/profile/");
};
