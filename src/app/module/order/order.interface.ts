export interface ICreateOrderItem {
  productId: string;
  quantity: number;
}

export interface ICreateOrderPayload {
  items: ICreateOrderItem[];
}

export interface IOrderQuery {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string | number;
  limit?: string | number;
}

export interface IUpdateOrderStatusPayload {
  status: string;
}