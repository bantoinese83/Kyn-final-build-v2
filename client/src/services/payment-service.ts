// Payment Service - Handles all payment-related data operations
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

export interface Payment extends FamilyEntity {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod:
    | "credit_card"
    | "debit_card"
    | "paypal"
    | "stripe"
    | "apple_pay"
    | "google_pay"
    | "bank_transfer"
    | "cash"
    | "other";
  paymentType:
    | "authorization"
    | "capture"
    | "refund"
    | "chargeback"
    | "dispute";
  status:
    | "pending"
    | "authorized"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "disputed";
  gatewayResponse: {
    success: boolean;
    message: string;
    code?: string;
    transactionId?: string;
    authorizationCode?: string;
    avsResult?: string;
    cvvResult?: string;
  };
  billingAddress: {
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
    email: string;
  };
  cardDetails?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    fingerprint?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentWithDetails extends Payment {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
  };
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
  refunds: Refund[];
  disputes: Dispute[];
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason:
    | "customer_request"
    | "duplicate_charge"
    | "fraudulent"
    | "product_not_received"
    | "product_defective"
    | "other";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  processedAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Dispute {
  id: string;
  paymentId: string;
  reason:
    | "duplicate_charge"
    | "fraudulent"
    | "product_not_received"
    | "product_defective"
    | "credit_not_processed"
    | "general"
    | "other";
  status: "open" | "under_review" | "won" | "lost" | "closed";
  amount: number;
  currency: string;
  evidence?: string[];
  responseDeadline?: string;
  resolvedAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentData {
  orderId: string;
  familyId: string;
  authorId: string;
  amount: number;
  currency: string;
  paymentMethod:
    | "credit_card"
    | "debit_card"
    | "paypal"
    | "stripe"
    | "apple_pay"
    | "google_pay"
    | "bank_transfer"
    | "cash"
    | "other";
  paymentType:
    | "authorization"
    | "capture"
    | "refund"
    | "chargeback"
    | "dispute";
  billingAddress: {
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
    email: string;
  };
  cardDetails?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    fingerprint?: string;
  };
  metadata?: Record<string, any>;
}

export interface UpdatePaymentData {
  status?:
    | "pending"
    | "authorized"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "disputed";
  gatewayResponse?: {
    success: boolean;
    message: string;
    code?: string;
    transactionId?: string;
    authorizationCode?: string;
    avsResult?: string;
    cvvResult?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentFilters extends FamilyFilters {
  paymentMethod?:
    | "credit_card"
    | "debit_card"
    | "paypal"
    | "stripe"
    | "apple_pay"
    | "google_pay"
    | "bank_transfer"
    | "cash"
    | "other";
  paymentType?:
    | "authorization"
    | "capture"
    | "refund"
    | "chargeback"
    | "dispute";
  status?:
    | "pending"
    | "authorized"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "disputed";
  dateRange?: "all" | "today" | "week" | "month" | "year";
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

export interface PaymentSearchParams {
  query: string;
  filters?: PaymentFilters;
  sortBy?: "recent" | "amount" | "status" | "date" | "transaction_id";
  sortOrder?: "asc" | "desc";
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  paymentsByStatus: Record<string, number>;
  paymentsByMethod: Record<string, number>;
  paymentsByType: Record<string, number>;
  averagePaymentAmount: number;
  successRate: number;
  recentPayments: number;
  pendingPayments: number;
  refundedAmount: number;
  disputedAmount: number;
}

class PaymentService extends FamilyService<
  Payment,
  CreatePaymentData,
  UpdatePaymentData
> {
  protected tableName = "payments";
  protected selectFields = `
    *,
    author:users!payments_author_id_fkey(
      id,
      name,
      email,
      avatar,
      initials
    ),
    family:families!payments_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get payments with full details for a family
   */
  async getPaymentsWithDetails(
    familyId: string,
    filters?: PaymentFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<PaymentWithDetails[]>> {
    const cacheKey = `payments_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<PaymentWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPaymentsWithDetails",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!payments_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!payments_family_id_fkey(
            id,
            name,
            avatar
          ),
          order:orders!payments_order_id_fkey(
            id,
            order_number,
            total_amount,
            currency
          ),
          refunds:refunds(
            id,
            amount,
            currency,
            reason,
            status,
            processed_at,
            notes
          ),
          disputes:disputes(
            id,
            reason,
            status,
            amount,
            currency,
            evidence,
            response_deadline,
            resolved_at,
            notes
          )
        `,
          )
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.paymentMethod) {
          query = query.eq("payment_method", filters.paymentMethod);
        }
        if (filters?.paymentType) {
          query = query.eq("payment_type", filters.paymentType);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.minAmount) {
          query = query.gte("amount", filters.minAmount);
        }
        if (filters?.maxAmount) {
          query = query.lte("amount", filters.maxAmount);
        }
        if (filters?.currency) {
          query = query.eq("currency", filters.currency);
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

        const payments = (data || []) as any[];

        // Transform and enrich payments
        const enrichedPayments = payments.map((payment) => ({
          ...payment,
          refunds: payment.refunds || [],
          disputes: payment.disputes || [],
        })) as PaymentWithDetails[];

        cacheSet(cacheKey, enrichedPayments, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedPayments, error: null };
      },
      "custom",
    );
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(
    transactionId: string,
  ): Promise<ServiceResponse<PaymentWithDetails | null>> {
    const cacheKey = `payment_by_transaction_${transactionId}`;
    const cached = cacheGet<PaymentWithDetails | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPaymentByTransactionId",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!payments_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!payments_family_id_fkey(
            id,
            name,
            avatar
          ),
          order:orders!payments_order_id_fkey(
            id,
            order_number,
            total_amount,
            currency
          ),
          refunds:refunds(
            id,
            amount,
            currency,
            reason,
            status,
            processed_at,
            notes
          ),
          disputes:disputes(
            id,
            reason,
            status,
            amount,
            currency,
            evidence,
            response_deadline,
            resolved_at,
            notes
          )
        `,
          )
          .eq("transaction_id", transactionId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const payment = data as any;
        const enrichedPayment: PaymentWithDetails = {
          ...payment,
          refunds: payment.refunds || [],
          disputes: payment.disputes || [],
        };

        cacheSet(cacheKey, enrichedPayment, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: enrichedPayment, error: null };
      },
      "custom",
    );
  }

  /**
   * Process a new payment
   */
  async processPayment(
    paymentData: CreatePaymentData,
  ): Promise<ServiceResponse<Payment>> {
    return measureAsync(
      "processPayment",
      async () => {
        // Generate transaction ID
        const transactionId = this.generateTransactionId();

        // Create the payment record
        const { data: payment, error } = await supabase
          .from(this.tableName)
          .insert({
            transaction_id: transactionId,
            order_id: paymentData.orderId,
            family_id: paymentData.familyId,
            author_id: paymentData.authorId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            payment_method: paymentData.paymentMethod,
            payment_type: paymentData.paymentType,
            status: "pending",
            gateway_response: {
              success: false,
              message: "Payment processing initiated",
            },
            billing_address: paymentData.billingAddress,
            card_details: paymentData.cardDetails,
            metadata: paymentData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: payment as unknown as Payment,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    gatewayResponse?: any,
  ): Promise<ServiceResponse<Payment>> {
    return measureAsync(
      "updatePaymentStatus",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            status: status,
            gateway_response: gatewayResponse || {},
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: data as unknown as Payment, error: null };
      },
      "custom",
    );
  }

  /**
   * Process refund for a payment
   */
  async processRefund(
    paymentId: string,
    refundData: {
      amount: number;
      reason:
        | "customer_request"
        | "duplicate_charge"
        | "fraudulent"
        | "product_not_received"
        | "product_defective"
        | "other";
      notes?: string;
    },
  ): Promise<ServiceResponse<Refund>> {
    return measureAsync(
      "processRefund",
      async () => {
        // Create refund record
        const { data: refund, error: refundError } = await supabase
          .from("refunds")
          .insert({
            payment_id: paymentId,
            amount: refundData.amount,
            currency: "USD", // This should match the payment currency
            reason: refundData.reason,
            status: "pending",
            notes: refundData.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (refundError) {
          return { success: false, error: refundError.message, data: null };
        }

        // Update payment status to refunded
        await this.updatePaymentStatus(paymentId, "refunded");

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: refund as unknown as Refund,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Create dispute for a payment
   */
  async createDispute(
    paymentId: string,
    disputeData: {
      reason:
        | "duplicate_charge"
        | "fraudulent"
        | "product_not_received"
        | "product_defective"
        | "credit_not_processed"
        | "general"
        | "other";
      amount: number;
      evidence?: string[];
      notes?: string;
    },
  ): Promise<ServiceResponse<Dispute>> {
    return measureAsync(
      "createDispute",
      async () => {
        // Create dispute record
        const { data: dispute, error } = await supabase
          .from("disputes")
          .insert({
            payment_id: paymentId,
            reason: disputeData.reason,
            status: "open",
            amount: disputeData.amount,
            currency: "USD", // This should match the payment currency
            evidence: disputeData.evidence || [],
            response_deadline: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days
            notes: disputeData.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Update payment status to disputed
        await this.updatePaymentStatus(paymentId, "disputed");

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: dispute as unknown as Dispute,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get payment statistics for a family
   */
  async getPaymentStats(
    familyId: string,
  ): Promise<ServiceResponse<PaymentStats>> {
    const cacheKey = `payment_stats_${familyId}`;
    const cached = cacheGet<PaymentStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPaymentStats",
      async () => {
        const [paymentsResult, refundsResult, disputesResult] =
          await Promise.all([
            supabase
              .from(this.tableName)
              .select(
                "status, payment_method, payment_type, amount, created_at",
              )
              .eq("family_id", familyId),
            supabase
              .from("refunds")
              .select("amount, status")
              .eq("family_id", familyId),
            supabase
              .from("disputes")
              .select("amount, status")
              .eq("family_id", familyId),
          ]);

        if (
          paymentsResult.error ||
          refundsResult.error ||
          disputesResult.error
        ) {
          return {
            success: false,
            error: "Failed to fetch payment statistics",
            data: null,
          };
        }

        const payments = paymentsResult.data || [];
        const refunds = refundsResult.data || [];
        const disputes = disputesResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: PaymentStats = {
          totalPayments: payments.length,
          totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          paymentsByStatus: payments.reduce(
            (acc, p) => {
              const status = p.status || "pending";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          paymentsByMethod: payments.reduce(
            (acc, p) => {
              const method = p.payment_method || "other";
              acc[method] = (acc[method] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          paymentsByType: payments.reduce(
            (acc, p) => {
              const type = p.payment_type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averagePaymentAmount:
            payments.length > 0
              ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) /
                payments.length
              : 0,
          successRate:
            payments.length > 0
              ? payments.filter((p) => p.status === "completed").length /
                payments.length
              : 0,
          recentPayments: payments.filter(
            (p) => new Date(p.created_at) >= thirtyDaysAgo,
          ).length,
          pendingPayments: payments.filter((p) => p.status === "pending")
            .length,
          refundedAmount: refunds
            .filter((r) => r.status === "completed")
            .reduce((sum, r) => sum + (r.amount || 0), 0),
          disputedAmount: disputes
            .filter((d) => d.status === "open" || d.status === "under_review")
            .reduce((sum, d) => sum + (d.amount || 0), 0),
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Search payments by text content and filters
   */
  async searchPayments(
    familyId: string,
    searchParams: PaymentSearchParams,
  ): Promise<ServiceResponse<Payment[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `payment_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Payment[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchPayments",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `transaction_id.ilike.%${query}%,gateway_response.message.ilike.%${query}%`,
          );

        // Apply filters
        if (filters?.paymentMethod) {
          queryBuilder = queryBuilder.eq(
            "payment_method",
            filters.paymentMethod,
          );
        }
        if (filters?.paymentType) {
          queryBuilder = queryBuilder.eq("payment_type", filters.paymentType);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.minAmount) {
          queryBuilder = queryBuilder.gte("amount", filters.minAmount);
        }
        if (filters?.maxAmount) {
          queryBuilder = queryBuilder.lte("amount", filters.maxAmount);
        }
        if (filters?.currency) {
          queryBuilder = queryBuilder.eq("currency", filters.currency);
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
            orderBy = "amount";
            break;
          case "status":
            orderBy = "status";
            break;
          case "date":
            orderBy = "created_at";
            break;
          case "transaction_id":
            orderBy = "transaction_id";
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

        const payments = (data || []) as unknown as Payment[];
        cacheSet(cacheKey, payments, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: payments, error: null };
      },
      "custom",
    );
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Invalidate cache for payments
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`payments_family_${familyId}`),
      new RegExp(`payments_with_details_${familyId}`),
      new RegExp(`payment_by_transaction_`),
      new RegExp(`payment_search_${familyId}`),
      new RegExp(`payment_stats_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const paymentService = new PaymentService();

// Legacy export for backward compatibility
export const paymentsService = paymentService;
