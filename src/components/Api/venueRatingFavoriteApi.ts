import axiosInstance from "./urls";

export const getVenueRatings = (venueId: string | number) => {
  return axiosInstance.get(`/api/venue-ratings/?venue=${venueId}`);
};

export const postVenueRating = (
  venueId: string | number,
  rating: number,
  comment: string
) => {
  return axiosInstance.post(`/api/venue-ratings/`, {
    venue: venueId,
    rating,
    comment,
  });
};

export const updateVenueRating = (
  ratingId: string | number,
  rating: number,
  comment: string
) => {
  return axiosInstance.patch(`/api/venue-ratings/${ratingId}/`, {
    rating,
    comment,
  });
};

export const getFavoriteVenues = () => {
  return axiosInstance.get(`/api/favorite-venues/venues/`);
};

export const postFavoriteVenue = (venueId: string | number) => {
  return axiosInstance.post(`/api/favorite-venues/`, {
    venue: venueId,
  });
};

export const deleteFavoriteVenue = (favoriteId: string | number) => {
  return axiosInstance.delete(`/api/favorite-venues/${favoriteId}/`);
};
