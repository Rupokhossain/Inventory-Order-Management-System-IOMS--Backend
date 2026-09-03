export interface ICreateCategoryPayload {
  name: string;
  description?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  description?: string;
}