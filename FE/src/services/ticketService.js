import { apiRequest } from "./axiosInstance";

export const ticketService = {
  createTicket: (ticketData) => apiRequest("POST", "/ve/dat-ve", ticketData),
  getTicketsByUser: (makh) => apiRequest("GET", `/ve/lay-ve-theo-makh/${makh}`),
  getAllTickets: () => apiRequest("GET", "/ve/danh-sach"),
};
