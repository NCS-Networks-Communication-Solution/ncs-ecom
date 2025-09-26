export interface OrderDto {
    id: string;
    orderNumber: string;
    quoteId?: string;
    poNumber?: string;
    status: OrderStatus;
    items: OrderItemDto[];
    subtotal: number;
    tax: number;
    total: number;
    payment?: PaymentDto;
    shippingAddress?: AddressDto;
    billingAddress?: AddressDto;
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface OrderItemDto {
    id: string;
    productId: string;
    product?: ProductDto;
    quantity: number;
    unitPrice: number;
    total: number;
}
export interface OrderListDto {
    items: OrderDto[];
    total: number;
    page: number;
    limit: number;
}
export interface AddressDto {
    addressLine1: string;
    addressLine2?: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
}
export { ProductDto } from './catalog.dto';
export { PaymentDto } from './payment.dto';
