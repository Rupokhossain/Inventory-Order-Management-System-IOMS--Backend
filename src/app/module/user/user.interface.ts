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