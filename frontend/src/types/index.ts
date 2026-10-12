export type Role = 'CUSTOMER' | 'ADMIN';
export type Gender = 'UNISEX' | 'MEN' | 'WOMEN';
export type ScentFamily =
  | 'ORIENTAL'
  | 'WOODY'
  | 'FLORAL'
  | 'FRESH'
  | 'CITRUS'
  | 'SPICY'
  | 'GOURMAND'
  | 'AMBER'
  | 'MUSK'
  | 'OUD'
  | 'AROMATIC'
  | 'LEATHER';

export type CodMode = 'INHERIT' | 'ENABLE' | 'DISABLE';
export type DiscountType = 'PERCENT' | 'FIXED';
export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'PAYMOB';

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  displayPosition: number;
  published: boolean;
  imageUrl?: string | null;
  description?: string | null;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sizeMl: number;
  priceEgp: number;
  stockQuantity: number;
  skuVariant?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  r2Key: string;
  imageUrl: string;
  position: number;
}

export interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  descriptionAr: string;
  descriptionEn?: string | null;
  scentNotes: string;
  gender: Gender;
  scentFamily: ScentFamily;
  categoryId: string;
  published: boolean;
  archivedAt?: string | null;
  codMode: CodMode;
  category?: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  authenticityStatement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & {
    product: Product;
  };
}

export interface CartSummary {
  cartId?: string;
  items: CartItem[];
  appliedDiscountCode?: string | null;
  subtotalEgp: number;
  discountEgp: number;
  shippingFeeEgp: number;
  totalEgp: number;
  appliedCodeDetails?: {
    code: string;
    type: DiscountType;
    value: number;
  } | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  addressDetails: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productNameSnapshot: string;
  sizeMlSnapshot: number;
  unitPriceEgp: number;
  quantity: number;
  variant?: ProductVariant & { product?: Product };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  notes?: string | null;
  changedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotalEgp: number;
  discountEgp: number;
  shippingFeeEgp: number;
  totalEgp: number;
  shippingAddress: ShippingAddress;
  codCollectedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

export interface User {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  password?: string;
  role: Role;
  verifiedAt?: string | null;
}

export interface PaymentSettings {
  id: string;
  codEnabledGlobal: boolean;
  codMaxOrderEgp?: number | null;
  updatedBy?: string | null;
  updatedAt: string;
}

