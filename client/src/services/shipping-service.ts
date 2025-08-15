// Shipping Service - Handles all shipping-related data operations
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

export interface Shipment extends FamilyEntity {
  trackingNumber: string;
  orderId: string;
  carrier: "fedex" | "ups" | "usps" | "dhl" | "amazon" | "other";
  service: "ground" | "express" | "overnight" | "2day" | "standard" | "economy";
  status:
    | "pending"
    | "label_created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  originAddress: Address;
  destinationAddress: Address;
  packageDetails: PackageDetails;
  shippingCost: number;
  currency: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  pickupDate?: string;
  inTransitDate?: string;
  outForDeliveryDate?: string;
  deliveryAttempts: number;
  signatureRequired: boolean;
  insuranceAmount?: number;
  specialInstructions?: string;
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

export interface PackageDetails {
  weight: number;
  weightUnit: "lbs" | "kg" | "oz" | "g";
  length: number;
  width: number;
  height: number;
  dimensionUnit: "in" | "cm";
  packageType: "box" | "envelope" | "tube" | "pallet" | "custom";
  contents: string;
  declaredValue?: number;
}

export interface ShipmentWithDetails extends Shipment {
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
  trackingEvents: TrackingEvent[];
  deliveryConfirmation?: DeliveryConfirmation;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  eventType:
    | "pickup"
    | "in_transit"
    | "out_for_delivery"
    | "delivery"
    | "exception"
    | "return"
    | "other";
  metadata?: Record<string, any>;
}

export interface DeliveryConfirmation {
  id: string;
  shipmentId: string;
  deliveredAt: string;
  deliveredBy: string;
  signature?: string;
  notes?: string;
  photoUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreateShipmentData {
  orderId: string;
  familyId: string;
  authorId: string;
  carrier: "fedex" | "ups" | "usps" | "dhl" | "amazon" | "other";
  service: "ground" | "express" | "overnight" | "2day" | "standard" | "economy";
  originAddress: Address;
  destinationAddress: Address;
  packageDetails: PackageDetails;
  shippingCost: number;
  currency: string;
  estimatedDelivery: string;
  signatureRequired?: boolean;
  insuranceAmount?: number;
  specialInstructions?: string;
  metadata?: Record<string, any>;
}

export interface UpdateShipmentData {
  status?:
    | "pending"
    | "label_created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  pickupDate?: string;
  inTransitDate?: string;
  outForDeliveryDate?: string;
  deliveryAttempts?: number;
  specialInstructions?: string;
  metadata?: Record<string, any>;
}

export interface ShipmentFilters extends FamilyFilters {
  carrier?: "fedex" | "ups" | "usps" | "dhl" | "amazon" | "other";
  service?:
    | "ground"
    | "express"
    | "overnight"
    | "2day"
    | "standard"
    | "economy";
  status?:
    | "pending"
    | "label_created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  dateRange?: "all" | "today" | "week" | "month" | "year";
  minCost?: number;
  maxCost?: number;
  signatureRequired?: boolean;
}

export interface ShipmentSearchParams {
  query: string;
  filters?: ShipmentFilters;
  sortBy?: "recent" | "cost" | "status" | "date" | "tracking_number";
  sortOrder?: "asc" | "desc";
}

export interface ShipmentStats {
  totalShipments: number;
  totalShippingCost: number;
  shipmentsByStatus: Record<string, number>;
  shipmentsByCarrier: Record<string, number>;
  shipmentsByService: Record<string, number>;
  averageShippingCost: number;
  onTimeDeliveryRate: number;
  recentShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
}

class ShippingService extends FamilyService<
  Shipment,
  CreateShipmentData,
  UpdateShipmentData
> {
  protected tableName = "shipments";
  protected selectFields = `
    *,
    author:users!shipments_author_id_fkey(
      id,
      name,
      email,
      avatar,
      initials
    ),
    family:families!shipments_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get shipments with full details for a family
   */
  async getShipmentsWithDetails(
    familyId: string,
    filters?: ShipmentFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<ShipmentWithDetails[]>> {
    const cacheKey = `shipments_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<ShipmentWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getShipmentsWithDetails",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!shipments_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!shipments_family_id_fkey(
            id,
            name,
            avatar
          ),
          order:orders!shipments_order_id_fkey(
            id,
            order_number,
            total_amount,
            currency
          ),
          tracking_events:tracking_events(
            id,
            timestamp,
            location,
            status,
            description,
            event_type
          ),
          delivery_confirmation:delivery_confirmations(
            id,
            delivered_at,
            delivered_by,
            signature,
            notes,
            photo_url
          )
        `,
          )
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.carrier) {
          query = query.eq("carrier", filters.carrier);
        }
        if (filters?.service) {
          query = query.eq("service", filters.service);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.minCost) {
          query = query.gte("shipping_cost", filters.minCost);
        }
        if (filters?.maxCost) {
          query = query.lte("shipping_cost", filters.maxCost);
        }
        if (filters?.signatureRequired !== undefined) {
          query = query.eq("signature_required", filters.signatureRequired);
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

        const shipments = (data || []) as any[];

        // Transform and enrich shipments
        const enrichedShipments = shipments.map((shipment) => ({
          ...shipment,
          trackingEvents: shipment.tracking_events || [],
          deliveryConfirmation: shipment.delivery_confirmation || null,
        })) as ShipmentWithDetails[];

        cacheSet(cacheKey, enrichedShipments, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedShipments, error: null };
      },
      "custom",
    );
  }

  /**
   * Get shipment by tracking number
   */
  async getShipmentByTrackingNumber(
    trackingNumber: string,
  ): Promise<ServiceResponse<ShipmentWithDetails | null>> {
    const cacheKey = `shipment_by_tracking_${trackingNumber}`;
    const cached = cacheGet<ShipmentWithDetails | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getShipmentByTrackingNumber",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!shipments_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!shipments_family_id_fkey(
            id,
            name,
            avatar
          ),
          order:orders!shipments_order_id_fkey(
            id,
            order_number,
            total_amount,
            currency
          ),
          tracking_events:tracking_events(
            id,
            timestamp,
            location,
            status,
            description,
            event_type
          ),
          delivery_confirmation:delivery_confirmations(
            id,
            delivered_at,
            delivered_by,
            signature,
            notes,
            photo_url
          )
        `,
          )
          .eq("tracking_number", trackingNumber)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const shipment = data as any;
        const enrichedShipment: ShipmentWithDetails = {
          ...shipment,
          trackingEvents: shipment.tracking_events || [],
          deliveryConfirmation: shipment.delivery_confirmation || null,
        };

        cacheSet(cacheKey, enrichedShipment, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: enrichedShipment, error: null };
      },
      "custom",
    );
  }

  /**
   * Create a new shipment
   */
  async createShipment(
    shipmentData: CreateShipmentData,
  ): Promise<ServiceResponse<Shipment>> {
    return measureAsync(
      "createShipment",
      async () => {
        // Generate tracking number
        const trackingNumber = this.generateTrackingNumber(
          shipmentData.carrier,
        );

        // Create the shipment record
        const { data: shipment, error } = await supabase
          .from(this.tableName)
          .insert({
            tracking_number: trackingNumber,
            order_id: shipmentData.orderId,
            family_id: shipmentData.familyId,
            author_id: shipmentData.authorId,
            carrier: shipmentData.carrier,
            service: shipmentData.service,
            status: "pending",
            origin_address: shipmentData.originAddress,
            destination_address: shipmentData.destinationAddress,
            package_details: shipmentData.packageDetails,
            shipping_cost: shipmentData.shippingCost,
            currency: shipmentData.currency,
            estimated_delivery: shipmentData.estimatedDelivery,
            signature_required: shipmentData.signatureRequired || false,
            insurance_amount: shipmentData.insuranceAmount,
            special_instructions: shipmentData.specialInstructions,
            metadata: shipmentData.metadata || {},
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
          data: shipment as unknown as Shipment,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    shipmentId: string,
    status: string,
    eventData?: {
      location?: string;
      description?: string;
      eventType?: string;
    },
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "updateShipmentStatus",
      async () => {
        const now = new Date();
        let updateData: any = {
          status: status,
          updated_at: now.toISOString(),
        };

        // Update status-specific dates
        switch (status) {
          case "picked_up":
            updateData.pickup_date = now.toISOString();
            break;
          case "in_transit":
            updateData.in_transit_date = now.toISOString();
            break;
          case "out_for_delivery":
            updateData.out_for_delivery_date = now.toISOString();
            break;
          case "delivered":
            updateData.actual_delivery = now.toISOString();
            break;
        }

        const { error: updateError } = await supabase
          .from(this.tableName)
          .update(updateData)
          .eq("id", shipmentId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Create tracking event if provided
        if (eventData) {
          const { error: eventError } = await supabase
            .from("tracking_events")
            .insert({
              shipment_id: shipmentId,
              timestamp: now.toISOString(),
              location: eventData.location || "",
              status: status,
              description:
                eventData.description || `Status updated to ${status}`,
              event_type: eventData.eventType || "other",
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
            });

          if (eventError) {
            return { success: false, error: eventError.message, data: null };
          }
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Calculate shipping cost
   */
  async calculateShippingCost(
    packageDetails: PackageDetails,
    origin: Address,
    destination: Address,
    service: string,
  ): Promise<
    ServiceResponse<{
      cost: number;
      currency: string;
      estimatedDays: number;
      availableServices: Array<{
        service: string;
        cost: number;
        estimatedDays: number;
      }>;
    }>
  > {
    const cacheKey = `shipping_cost_${JSON.stringify(packageDetails)}_${JSON.stringify(origin)}_${JSON.stringify(destination)}_${service}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "calculateShippingCost",
      async () => {
        // This would typically integrate with carrier APIs
        // For now, we'll return estimated costs based on package details
        const weight = packageDetails.weight;
        const distance = this.calculateDistance(origin, destination);

        const baseCost = weight * 0.5 + distance * 0.1;
        const serviceMultiplier = this.getServiceMultiplier(service);
        const cost = baseCost * serviceMultiplier;

        const estimatedDays = this.getEstimatedDays(service, distance);

        const availableServices = [
          {
            service: "ground",
            cost: baseCost * 1.0,
            estimatedDays: Math.ceil(distance / 100),
          },
          {
            service: "express",
            cost: baseCost * 1.5,
            estimatedDays: Math.ceil(distance / 200),
          },
          { service: "overnight", cost: baseCost * 3.0, estimatedDays: 1 },
        ];

        const result = {
          cost: Math.round(cost * 100) / 100,
          currency: "USD",
          estimatedDays,
          availableServices,
        };

        cacheSet(cacheKey, result, 30 * 60 * 1000, globalCache); // 30 minutes
        return { success: true, data: result, error: null };
      },
      "custom",
    );
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<
    ServiceResponse<{
      status: string;
      location: string;
      estimatedDelivery: string;
      events: TrackingEvent[];
    }>
  > {
    const cacheKey = `tracking_${trackingNumber}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "trackShipment",
      async () => {
        // Get shipment details
        const shipmentResult =
          await this.getShipmentByTrackingNumber(trackingNumber);
        if (!shipmentResult.success || !shipmentResult.data) {
          return { success: false, error: "Shipment not found", data: null };
        }

        const shipment = shipmentResult.data;

        // This would typically integrate with carrier APIs for real-time tracking
        // For now, we'll return the stored tracking information
        const result = {
          status: shipment.status,
          location:
            shipment.trackingEvents.length > 0
              ? shipment.trackingEvents[shipment.trackingEvents.length - 1]
                  .location
              : "Unknown",
          estimatedDelivery: shipment.estimatedDelivery,
          events: shipment.trackingEvents,
        };

        cacheSet(cacheKey, result, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: result, error: null };
      },
      "custom",
    );
  }

  /**
   * Get shipment statistics for a family
   */
  async getShipmentStats(
    familyId: string,
  ): Promise<ServiceResponse<ShipmentStats>> {
    const cacheKey = `shipment_stats_${familyId}`;
    const cached = cacheGet<ShipmentStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getShipmentStats",
      async () => {
        const [shipmentsResult, trackingEventsResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select(
              "status, carrier, service, shipping_cost, created_at, estimated_delivery, actual_delivery",
            )
            .eq("family_id", familyId),
          supabase
            .from("tracking_events")
            .select("shipment_id, event_type, timestamp")
            .eq("family_id", familyId),
        ]);

        if (shipmentsResult.error || trackingEventsResult.error) {
          return {
            success: false,
            error: "Failed to fetch shipment statistics",
            data: null,
          };
        }

        const shipments = shipmentsResult.data || [];
        const trackingEvents = trackingEventsResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: ShipmentStats = {
          totalShipments: shipments.length,
          totalShippingCost: shipments.reduce(
            (sum, s) => sum + (s.shipping_cost || 0),
            0,
          ),
          shipmentsByStatus: shipments.reduce(
            (acc, s) => {
              const status = s.status || "pending";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          shipmentsByCarrier: shipments.reduce(
            (acc, s) => {
              const carrier = s.carrier || "other";
              acc[carrier] = (acc[carrier] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          shipmentsByService: shipments.reduce(
            (acc, s) => {
              const service = s.service || "standard";
              acc[service] = (acc[service] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageShippingCost:
            shipments.length > 0
              ? shipments.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) /
                shipments.length
              : 0,
          onTimeDeliveryRate:
            shipments.filter((s) => s.actual_delivery && s.estimated_delivery)
              .length > 0
              ? shipments.filter((s) => {
                  if (!s.actual_delivery || !s.estimated_delivery) return false;
                  const actual = new Date(s.actual_delivery);
                  const estimated = new Date(s.estimated_delivery);
                  return actual <= estimated;
                }).length /
                shipments.filter(
                  (s) => s.actual_delivery && s.estimated_delivery,
                ).length
              : 0,
          recentShipments: shipments.filter(
            (s) => new Date(s.created_at) >= thirtyDaysAgo,
          ).length,
          pendingShipments: shipments.filter((s) => s.status === "pending")
            .length,
          inTransitShipments: shipments.filter((s) => s.status === "in_transit")
            .length,
          deliveredShipments: shipments.filter((s) => s.status === "delivered")
            .length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Search shipments by text content and filters
   */
  async searchShipments(
    familyId: string,
    searchParams: ShipmentSearchParams,
  ): Promise<ServiceResponse<Shipment[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `shipment_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Shipment[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchShipments",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `tracking_number.ilike.%${query}%,special_instructions.ilike.%${query}%`,
          );

        // Apply filters
        if (filters?.carrier) {
          queryBuilder = queryBuilder.eq("carrier", filters.carrier);
        }
        if (filters?.service) {
          queryBuilder = queryBuilder.eq("service", filters.service);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.minCost) {
          queryBuilder = queryBuilder.gte("shipping_cost", filters.minCost);
        }
        if (filters?.maxCost) {
          queryBuilder = queryBuilder.lte("shipping_cost", filters.maxCost);
        }
        if (filters?.signatureRequired !== undefined) {
          queryBuilder = queryBuilder.eq(
            "signature_required",
            filters.signatureRequired,
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
          case "cost":
            orderBy = "shipping_cost";
            break;
          case "status":
            orderBy = "status";
            break;
          case "date":
            orderBy = "created_at";
            break;
          case "tracking_number":
            orderBy = "tracking_number";
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

        const shipments = (data || []) as unknown as Shipment[];
        cacheSet(cacheKey, shipments, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: shipments, error: null };
      },
      "custom",
    );
  }

  /**
   * Generate unique tracking number
   */
  private generateTrackingNumber(carrier: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const carrierPrefix = carrier.toUpperCase().substring(0, 3);
    return `${carrierPrefix}${timestamp}${random}`;
  }

  /**
   * Calculate distance between two addresses (simplified)
   */
  private calculateDistance(origin: Address, destination: Address): number {
    // This is a simplified calculation - in practice, you'd use a geocoding service
    // For now, we'll return a random distance between 100-1000 miles
    return Math.floor(Math.random() * 900) + 100;
  }

  /**
   * Get service multiplier for cost calculation
   */
  private getServiceMultiplier(service: string): number {
    switch (service) {
      case "ground":
        return 1.0;
      case "standard":
        return 1.2;
      case "2day":
        return 1.5;
      case "express":
        return 2.0;
      case "overnight":
        return 3.0;
      default:
        return 1.0;
    }
  }

  /**
   * Get estimated delivery days
   */
  private getEstimatedDays(service: string, distance: number): number {
    switch (service) {
      case "overnight":
        return 1;
      case "2day":
        return 2;
      case "express":
        return Math.ceil(distance / 300);
      case "standard":
        return Math.ceil(distance / 150);
      case "ground":
        return Math.ceil(distance / 100);
      default:
        return Math.ceil(distance / 100);
    }
  }

  /**
   * Invalidate cache for shipments
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`shipments_family_${familyId}`),
      new RegExp(`shipments_with_details_${familyId}`),
      new RegExp(`shipment_by_tracking_`),
      new RegExp(`shipment_search_${familyId}`),
      new RegExp(`shipment_stats_${familyId}`),
      new RegExp(`tracking_`),
      new RegExp(`shipping_cost_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const shippingService = new ShippingService();

// Legacy export for backward compatibility
export const shipmentsService = shippingService;
