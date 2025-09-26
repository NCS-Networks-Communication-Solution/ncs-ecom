// Product catalog DTOs aligned with OpenAPI spec

export interface CategoryDto {
  id: string;
  nameEn: string;
  nameTh: string;
  parentId?: string;
  level: number;
  productCount: number;
}

export interface ProductDto {
  id: string;
  sku: string;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: CategoryDto;
  specifications?: Record<string, any>;
  images?: string[];
}

export interface ProductListDto {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductSearchParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  product?: ProductDto;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AddToCartRequestDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequestDto {
  quantity: number;
}

export interface BulkImportResultDto {
  success: number;
  failed: number;
  errors?: BulkImportError[];
  cart: CartDto;
}

export interface BulkImportError {
  row: number;
  error: string;
}