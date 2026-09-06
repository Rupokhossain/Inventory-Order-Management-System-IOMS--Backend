export interface IBkashGrantTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  statusCode: string;
  statusMessage: string;
}

export interface IBkashCreatePaymentResponse {
  paymentID: string;
  createTime?: string;
  updateTime?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  bkashURL: string;
  callbackURL?: string;
  statusCode: string;
  statusMessage: string;
}

export interface IBkashExecutePaymentResponse {
  paymentID: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  statusCode: string;
  statusMessage: string;
}