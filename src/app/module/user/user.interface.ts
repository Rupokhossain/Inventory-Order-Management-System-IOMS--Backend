export interface IUpdateProfilePayload {
  name?: string;
  profileImg?: string;
}


export interface IUpdateProfilePayload {
  name?: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface IUpdateUserStatusPayload {
  status: "ACTIVE" | "BLOCKED" | "DELETED";
}


export interface IUserQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
}