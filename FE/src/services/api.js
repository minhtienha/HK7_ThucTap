/**
 * DEPRECATED: This file is a proxy for the new modular services.
 * Please import from the specific service files instead.
 */
import { authService } from "./authService";
import { movieService } from "./movieService";
import { bookingService } from "./bookingService";
import { ticketService } from "./ticketService";
import { reviewService } from "./reviewService";

// Auth
export const register = authService.register;
export const login = authService.login;
export const getUsers = authService.getUsers;
export const addUser = authService.addUser;
export const deleteUser = authService.deleteUser;
export const updatePasswordByEmail = authService.updatePasswordByEmail;
export const getUserById = authService.getUserById;
export const updateUser = authService.updateUser;
export const checkPhone = authService.checkPhone;

// Movies
export const getMovies = movieService.getMovies;
export const getFeaturedMovies = movieService.getMovies;
export const getNowShowingMovies = movieService.getNowShowingMovies;
export const getUpcomingMovies = movieService.getUpcomingMovies;
export const getMovieById = movieService.getMovieById;
export const searchMovies = movieService.searchMovies;
export const addMovie = movieService.addMovie;
export const updateMovie = movieService.updateMovie;
export const deleteMovie = movieService.deleteMovie;

// Reviews
export const getReviewsByMovie = reviewService.getReviewsByMovie;
export const upsertReview = reviewService.upsertReview;
export const deleteReview = reviewService.deleteReview;
export const updateReview = reviewService.updateReview;
export const getReviewsByUser = reviewService.getReviewsByUser;

// Booking & Showtimes
export const getShowtimesByMovie = bookingService.getShowtimesByMovie;
export const getShowtimeDetail = bookingService.getShowtimeDetail;
export const getShows = bookingService.getAllShows;
export const getShowDetails = bookingService.getShowtimeDetail;
export const addShow = bookingService.addShow;
export const updateShow = bookingService.updateShow;
export const deleteShow = bookingService.deleteShow;
export const getAllShowDetails = bookingService.getAllShowDetails;
export const getRoomDetail = bookingService.getRoomDetail;
export const getTheaterDetail = bookingService.getTheaterByMarap;
export const getTheaters = bookingService.getTheaters;
export const getTheaterByMarap = bookingService.getTheaterByMarap;
export const addTheater = bookingService.addTheater;
export const updateTheater = bookingService.updateTheater;
export const deleteTheater = bookingService.deleteTheater;
export const getRoomsByTheater = bookingService.getRoomsByTheater;
export const addRoom = bookingService.addRoom;
export const updateRoom = bookingService.updateRoom;
export const deleteRoom = bookingService.deleteRoom;

// Tickets
export const createTicket = ticketService.createTicket;
export const CheckTicketBooked = ticketService.getTicketsByUser;
export const getAllTickets = ticketService.getAllTickets;

// Re-export common filters for compatibility
export const getMoviesForFilter = movieService.getMovies;
export const getTheatersForFilter = bookingService.getTheaters;
