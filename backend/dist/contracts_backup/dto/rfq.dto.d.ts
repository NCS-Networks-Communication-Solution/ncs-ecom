export interface CreateQuoteRequestDto {
    notes?: string;
    requestedDeliveryDate?: string;
}
export interface QuoteDto {
    id: string;
    quoteNumber: string;
    status: QuoteStatus;
    items: QuoteItemDto[];
    subtotal: number;
    tax: number;
    total: number;
    validUntil?: string;
    notes?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt?: string;
}
export declare enum QuoteStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export interface QuoteItemDto {
    id: string;
    productId: string;
    product?: ProductDto;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    total: number;
}
export interface QuoteListDto {
    items: QuoteDto[];
    total: number;
    page: number;
    limit: number;
}
export interface UpdateQuoteRequestDto {
    status?: QuoteStatus;
    items?: UpdateQuoteItemDto[];
    adminNotes?: string;
    validUntil?: string;
}
export interface UpdateQuoteItemDto {
    id: string;
    unitPrice?: number;
    discountPercent?: number;
}
export interface AcceptQuoteRequestDto {
    poNumber?: string;
}
export { ProductDto } from './catalog.dto';
