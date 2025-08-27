import axiosInstance from "./urls";

export const postRegisterApi = (data: any) => {
  return axiosInstance.post("/auth/register/user/", data);
};

export const postLoginApi = (data: any) => {
  return axiosInstance.post("/auth/login/", data);
};

export const postVenuelist = (data: any) => {
  return axiosInstance.post("/api/venues/", data);
};

export const updateVenue = (id: string | number, data: any) => {
  return axiosInstance.put(`/api/venues/${id}/`, data);
};

export const deleteVenue = (id: string | number) => {
  return axiosInstance.delete(`/api/venues/${id}/`);
};