export interface ICreateInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface IInquiryQuery {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}
