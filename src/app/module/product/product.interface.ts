export interface ICreateProductPayload {
  name: string;
  description?: string;
  price: string | number;
  stockQuantity?: string | number;
  categoryId: string;
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  price?: string | number;
  categoryId?: string;
}

export interface IUpdateStockPayload {
  quantity: string | number;
}


export interface IProductQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
}