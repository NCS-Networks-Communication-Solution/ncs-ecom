// Payment DTOs aligned with OpenAPI spec

export interface PaymentRequestDto {
  method: PaymentMethod;
  returnUrl?: string;
}

export enum PaymentMethod {
  PROMPTPAY = 'PROMPTPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET'
}

export interface PaymentResponseDto {
  paymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  qrCode?: string; // Base64 encoded for PromptPay
  bankAccount?: BankAccountDto;
  amount: number;
}

export interface PaymentDto {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  slipUrl?: string;
  createdAt: string;
  paidAt?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PromptPayWebhookDto {
  transactionId: string;
  amount: number;
  status: string;
  timestamp: string;
}

export interface BankAccountDto {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
}

export interface UploadSlipResponseDto {
  payment: PaymentDto;
  slipUrl: string;
}