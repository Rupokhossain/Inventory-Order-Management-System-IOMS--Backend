export interface ICreateCategoryPayload {
  name: string;
  description?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  description?: string;
}

export interface ICategoryQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
}