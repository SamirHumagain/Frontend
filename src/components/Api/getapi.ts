import axiosInstance from "./urls";

export const getVenueList = () => {
	return axiosInstance.get("/api/venues/");
};

