// Order Service - Handles all order-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface Order extends FamilyEntity {
  orderNumber: string;
  orderType: "subscription" | "one_time" | "renewal" | "upgrade" | "downgrade";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  totalAmount: number;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "authorized" | "paid" | "failed" | "refunded";
  billingAddress: Address;
  shippingAddress?: Address;
  items: OrderItem[];
  notes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  metadata?: Record<string, any>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  metadata?: Record<string, any>;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface OrderWithDetails extends Order {
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  family: {
    id: string;
    name: string;
    avatar?: string;
  };
  items: OrderItemWithProduct[];
  paymentHistory: PaymentRecord[];
  statusHistory: StatusUpdate[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    category: string;
  };
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "authorized" | "paid" | "failed" | "refunded";
  transactionId?: string;
  processedAt: string;
  metadata?: Record<string, any>;
}

export interface StatusUpdate {
  id: string;
  orderId: string;
  status: string;
  previousStatus?: string;
  updatedBy: string;
  updatedAt: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderData {
  familyId: string;
  authorId: string;
  orderType: "subscription" | "one_time" | "renewal" | "upgrade" | "downgrade";
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  billingAddress: Address;
  shippingAddress?: Address;
  paymentMethod: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrderData {
  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus?: "pending" | "authorized" | "paid" | "failed" | "refunded";
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface OrderFilters extends FamilyFilters {
  orderType?: "subscription" | "one_time" | "renewal" | "upgrade" | "downgrade";
  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus?: "pending" | "authorized" | "paid" | "failed" | "refunded";
  dateRange?: "all" | "today" | "week" | "month" | "year";
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

export interface OrderSearchParams {
  query: string;
  filters?: OrderFilters;
  sortBy?: "recent" | "amount" | "status" | "date" | "order_number";
  sortOrder?: "asc" | "desc";
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  ordersByType: Record<string, number>;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: number;
  pendingOrders: number;
}

class OrderService extends FamilyService<
  Order,
  CreateOrderData,
  UpdateOrderData
> {
  protected tableName = "orders";
  protected selectFields = `
    *,
    author:users!orders_author_id_fkey(
      id,
      name,
      email,
      avatar,
      initials
    ),
    family:families!orders_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get orders with full details for a family
   */
  async getOrdersWithDetails(
    familyId: string,
    filters?: OrderFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<OrderWithDetails[]>> {
    const cacheKey = `orders_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<OrderWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getOrdersWithDetails",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!orders_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!orders_family_id_fkey(
            id,
            name,
            avatar
          ),
          items:order_items(
            *,
            product:products(
              id,
              name,
              description,
              image_url,
              category
            )
          ),
          payments:payment_records(
            id,
            amount,
            currency,
            payment_method,
            status,
            transaction_id,
            processed_at
          ),
          status_updates:order_status_updates(
            id,
            status,
            previous_status,
            updated_by,
            updated_at,
            notes
          )
        `,
          )
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.orderType) {
          query = query.eq("order_type", filters.orderType);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.paymentStatus) {
          query = query.eq("payment_status", filters.paymentStatus);
        }
        if (filters?.minAmount) {
          query = query.gte("total_amount", filters.minAmount);
        }
        if (filters?.maxAmount) {
          query = query.lte("total_amount", filters.maxAmount);
        }
        if (filters?.paymentMethod) {
          query = query.eq("payment_method", filters.paymentMethod);
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte("created_at", startDate.toISOString());
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const orders = (data || []) as any[];

        // Transform and enrich orders
        const enrichedOrders = orders.map((order) => ({
          ...order,
          items: order.items || [],
          paymentHistory: order.payments || [],
          statusHistory: order.status_updates || [],
        })) as OrderWithDetails[];

        cacheSet(cacheKey, enrichedOrders, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedOrders, error: null };
      },
      "custom",
    );
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(
    orderNumber: string,
  ): Promise<ServiceResponse<OrderWithDetails | null>> {
    const cacheKey = `order_by_number_${orderNumber}`;
    const cached = cacheGet<OrderWithDetails | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getOrderByNumber",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!orders_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!orders_family_id_fkey(
            id,
            name,
            avatar
          ),
          items:order_items(
            *,
            product:products(
              id,
              name,
              description,
              image_url,
              category
            )
          ),
          payments:payment_records(
            id,
            amount,
            currency,
            payment_method,
            status,
            transaction_id,
            processed_at
          ),
          status_updates:order_status_updates(
            id,
            status,
            previous_status,
            updated_by,
            updated_at,
            notes
          )
        `,
          )
          .eq("order_number", orderNumber)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const order = data as any;
        const enrichedOrder: OrderWithDetails = {
          ...order,
          items: order.items || [],
          paymentHistory: order.payments || [],
          statusHistory: order.status_updates || [],
        };

        cacheSet(cacheKey, enrichedOrder, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: enrichedOrder, error: null };
      },
      "custom",
    );
  }

  /**
   * Create a new order
   */
  async createOrder(
    orderData: CreateOrderData,
  ): Promise<ServiceResponse<Order>> {
    return measureAsync(
      "createOrder",
      async () => {
        // Calculate totals
        const subtotal = orderData.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        const taxAmount = subtotal * 0.1; // 10% tax - this should be configurable
        const shippingAmount = 0; // Free shipping for now
        const discountAmount = 0; // No discounts for now
        const totalAmount =
          subtotal + taxAmount + shippingAmount - discountAmount;

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Create the order
        const { data: order, error: orderError } = await supabase
          .from(this.tableName)
          .insert({
            order_number: orderNumber,
            family_id: orderData.familyId,
            author_id: orderData.authorId,
            order_type: orderData.orderType,
            status: "pending",
            total_amount: totalAmount,
            currency: "USD",
            subtotal: subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            shipping_amount: shippingAmount,
            payment_method: orderData.paymentMethod,
            payment_status: "pending",
            billing_address: orderData.billingAddress,
            shipping_address: orderData.shippingAddress,
            notes: orderData.notes,
            metadata: orderData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          return { success: false, error: orderError.message, data: null };
        }

        // Create order items
        const orderItems = orderData.items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: "", // This would be fetched from products table
          product_type: "", // This would be fetched from products table
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity,
          discount_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          // Rollback order creation if items fail
          await supabase.from(this.tableName).delete().eq("id", order.id);
          return { success: false, error: itemsError.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: order as unknown as Order, error: null };
      },
      "custom",
    );
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string,
    updatedBy?: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "updateOrderStatus",
      async () => {
        // Get current order status
        const { data: currentOrder, error: fetchError } = await supabase
          .from(this.tableName)
          .select("status")
          .eq("id", orderId)
          .single();

        if (fetchError) {
          return { success: false, error: fetchError.message, data: null };
        }

        // Update order status
        const { error: updateError } = await supabase
          .from(this.tableName)
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Create status update record
        const { error: statusError } = await supabase
          .from("order_status_updates")
          .insert({
            order_id: orderId,
            status: status,
            previous_status: currentOrder.status,
            updated_by: updatedBy || "system",
            updated_at: new Date().toISOString(),
            notes: notes,
          });

        if (statusError) {
          return { success: false, error: statusError.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Process payment for an order
   */
  async processPayment(
    orderId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      transactionId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<ServiceResponse<PaymentRecord>> {
    return measureAsync(
      "processPayment",
      async () => {
        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from("payment_records")
          .insert({
            order_id: orderId,
            amount: paymentData.amount,
            currency: "USD",
            payment_method: paymentData.paymentMethod,
            status: "paid",
            transaction_id: paymentData.transactionId,
            processed_at: new Date().toISOString(),
            metadata: paymentData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (paymentError) {
          return { success: false, error: paymentError.message, data: null };
        }

        // Update order payment status
        const { error: updateError } = await supabase
          .from(this.tableName)
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Update order status to confirmed
        await this.updateOrderStatus(
          orderId,
          "confirmed",
          "Payment processed successfully",
        );

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: payment as unknown as PaymentRecord,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get order statistics for a family
   */
  async getOrderStats(familyId: string): Promise<ServiceResponse<OrderStats>> {
    const cacheKey = `order_stats_${familyId}`;
    const cached = cacheGet<OrderStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getOrderStats",
      async () => {
        const [ordersResult, itemsResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select("status, order_type, total_amount, created_at")
            .eq("family_id", familyId),
          supabase
            .from("order_items")
            .select("product_id, product_name, quantity, total_price")
            .eq("family_id", familyId),
        ]);

        if (ordersResult.error || itemsResult.error) {
          return {
            success: false,
            error: "Failed to fetch order statistics",
            data: null,
          };
        }

        const orders = ordersResult.data || [];
        const items = itemsResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: OrderStats = {
          totalOrders: orders.length,
          totalRevenue: orders.reduce(
            (sum, o) => sum + (o.total_amount || 0),
            0,
          ),
          ordersByStatus: orders.reduce(
            (acc, o) => {
              const status = o.status || "pending";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          ordersByType: orders.reduce(
            (acc, o) => {
              const type = o.order_type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageOrderValue:
            orders.length > 0
              ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) /
                orders.length
              : 0,
          topProducts: items
            .reduce(
              (acc, item) => {
                const existing = acc.find(
                  (p) => p.productId === item.product_id,
                );
                if (existing) {
                  existing.quantity += item.quantity || 0;
                  existing.revenue += item.total_price || 0;
                } else {
                  acc.push({
                    productId: item.product_id,
                    name: item.product_name || "Unknown Product",
                    quantity: item.quantity || 0,
                    revenue: item.total_price || 0,
                  });
                }
                return acc;
              },
              [] as Array<{
                productId: string;
                name: string;
                quantity: number;
                revenue: number;
              }>,
            )
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5),
          recentOrders: orders.filter(
            (o) => new Date(o.created_at) >= thirtyDaysAgo,
          ).length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Search orders by text content and filters
   */
  async searchOrders(
    familyId: string,
    searchParams: OrderSearchParams,
  ): Promise<ServiceResponse<Order[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `order_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Order[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchOrders",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%`);

        // Apply filters
        if (filters?.orderType) {
          queryBuilder = queryBuilder.eq("order_type", filters.orderType);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.paymentStatus) {
          queryBuilder = queryBuilder.eq(
            "payment_status",
            filters.paymentStatus,
          );
        }
        if (filters?.minAmount) {
          queryBuilder = queryBuilder.gte("total_amount", filters.minAmount);
        }
        if (filters?.maxAmount) {
          queryBuilder = queryBuilder.lte("total_amount", filters.maxAmount);
        }
        if (filters?.paymentMethod) {
          queryBuilder = queryBuilder.eq(
            "payment_method",
            filters.paymentMethod,
          );
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          queryBuilder = queryBuilder.gte(
            "created_at",
            startDate.toISOString(),
          );
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "amount":
            orderBy = "total_amount";
            break;
          case "status":
            orderBy = "status";
            break;
          case "date":
            orderBy = "created_at";
            break;
          case "order_number":
            orderBy = "order_number";
            break;
          default:
            orderBy = "created_at";
        }

        const { data, error } = await queryBuilder.order(orderBy, {
          ascending: sortOrder === "asc",
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const orders = (data || []) as unknown as Order[];
        cacheSet(cacheKey, orders, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: orders, error: null };
      },
      "custom",
    );
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Invalidate cache for orders
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`orders_family_${familyId}`),
      new RegExp(`orders_with_details_${familyId}`),
      new RegExp(`order_by_number_`),
      new RegExp(`order_search_${familyId}`),
      new RegExp(`order_stats_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const orderService = new OrderService();

// Legacy export for backward compatibility
export const ordersService = orderService;
