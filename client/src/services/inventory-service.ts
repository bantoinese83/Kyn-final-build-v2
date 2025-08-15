// Inventory Service - Handles all inventory-related data operations
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

export interface InventoryItem extends FamilyEntity {
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  variant?: string;
  barcode?: string;
  upc?: string;
  isbn?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "in" | "cm" | "mm";
  };
  weight: {
    value: number;
    unit: "lbs" | "kg" | "oz" | "g";
  };
  images: string[];
  tags: string[];
  cost: number;
  price: number;
  currency: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  location: string;
  shelf?: string;
  bin?: string;
  supplier?: string;
  supplierPartNumber?: string;
  leadTime: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  isDiscontinued: boolean;
  metadata?: Record<string, any>;
}

export interface InventoryItemWithDetails extends InventoryItem {
  family: {
    id: string;
    name: string;
    avatar?: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  transactions: InventoryTransaction[];
  alerts: InventoryAlert[];
  relatedItems: InventoryItem[];
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  familyId: string;
  type: "in" | "out" | "adjustment" | "transfer" | "return" | "damage" | "loss";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  referenceType?: "order" | "shipment" | "return" | "adjustment" | "other";
  cost?: number;
  notes?: string;
  processedBy: string;
  processedAt: string;
  metadata?: Record<string, any>;
}

export interface InventoryAlert {
  id: string;
  itemId: string;
  familyId: string;
  type:
    | "low_stock"
    | "overstock"
    | "expiring"
    | "discontinued"
    | "cost_change"
    | "price_change";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  isRead: boolean;
  readAt?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreateInventoryItemData {
  familyId: string;
  authorId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  variant?: string;
  barcode?: string;
  upc?: string;
  isbn?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "in" | "cm" | "mm";
  };
  weight: {
    value: number;
    unit: "lbs" | "kg" | "oz" | "g";
  };
  images?: string[];
  tags?: string[];
  cost: number;
  price: number;
  currency: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  location: string;
  shelf?: string;
  bin?: string;
  supplier?: string;
  supplierPartNumber?: string;
  leadTime?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  metadata?: Record<string, any>;
}

export interface UpdateInventoryItemData {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  variant?: string;
  barcode?: string;
  upc?: string;
  isbn?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "in" | "cm" | "mm";
  };
  weight?: {
    value: number;
    unit: "lbs" | "kg" | "oz" | "g";
  };
  images?: string[];
  tags?: string[];
  cost?: number;
  price?: number;
  currency?: string;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  shelf?: string;
  bin?: string;
  supplier?: string;
  supplierPartNumber?: string;
  leadTime?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
  isDiscontinued?: boolean;
  metadata?: Record<string, any>;
}

export interface InventoryFilters extends FamilyFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  supplier?: string;
  location?: string;
  isActive?: boolean;
  isDiscontinued?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  tags?: string[];
}

export interface InventorySearchParams {
  query: string;
  filters?: InventoryFilters;
  sortBy?: "recent" | "name" | "price" | "quantity" | "sku" | "category";
  sortOrder?: "asc" | "desc";
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  itemsByCategory: Record<string, number>;
  itemsByLocation: Record<string, number>;
  itemsByBrand: Record<string, number>;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  averageItemValue: number;
  totalCost: number;
  totalRevenue: number;
  profitMargin: number;
}

class InventoryService extends FamilyService<
  InventoryItem,
  CreateInventoryItemData,
  UpdateInventoryItemData
> {
  protected tableName = "inventory_items";
  protected selectFields = `
    *,
    author:users!inventory_items_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    family:families!inventory_items_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get inventory items with full details for a family
   */
  async getInventoryItemsWithDetails(
    familyId: string,
    filters?: InventoryFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<InventoryItemWithDetails[]>> {
    const cacheKey = `inventory_items_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<InventoryItemWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getInventoryItemsWithDetails",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!inventory_items_author_id_fkey(
            id,
            name,
            avatar,
            initials
          ),
          family:families!inventory_items_family_id_fkey(
            id,
            name,
            avatar
          ),
          transactions:inventory_transactions(
            id,
            type,
            quantity,
            previous_quantity,
            new_quantity,
            reason,
            reference,
            reference_type,
            cost,
            notes,
            processed_by,
            processed_at
          ),
          alerts:inventory_alerts(
            id,
            type,
            severity,
            message,
            is_read,
            is_resolved,
            created_at
          )
        `,
          )
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }
        if (filters?.subcategory) {
          query = query.eq("subcategory", filters.subcategory);
        }
        if (filters?.brand) {
          query = query.eq("brand", filters.brand);
        }
        if (filters?.supplier) {
          query = query.eq("supplier", filters.supplier);
        }
        if (filters?.location) {
          query = query.eq("location", filters.location);
        }
        if (filters?.isActive !== undefined) {
          query = query.eq("is_active", filters.isActive);
        }
        if (filters?.isDiscontinued !== undefined) {
          query = query.eq("is_discontinued", filters.isDiscontinued);
        }
        if (filters?.minPrice) {
          query = query.gte("price", filters.minPrice);
        }
        if (filters?.maxPrice) {
          query = query.lte("price", filters.maxPrice);
        }
        if (filters?.minQuantity) {
          query = query.gte("quantity", filters.minQuantity);
        }
        if (filters?.maxQuantity) {
          query = query.lte("quantity", filters.maxQuantity);
        }
        if (filters?.tags && filters.tags.length > 0) {
          query = query.overlaps("tags", filters.tags);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const items = (data || []) as any[];

        // Transform and enrich items
        const enrichedItems = items.map((item) => ({
          ...item,
          transactions: item.transactions || [],
          alerts: item.alerts || [],
          relatedItems: [], // This would require additional queries
        })) as InventoryItemWithDetails[];

        cacheSet(cacheKey, enrichedItems, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedItems, error: null };
      },
      "custom",
    );
  }

  /**
   * Get inventory item by SKU
   */
  async getInventoryItemBySKU(
    sku: string,
    familyId: string,
  ): Promise<ServiceResponse<InventoryItemWithDetails | null>> {
    const cacheKey = `inventory_item_by_sku_${sku}_${familyId}`;
    const cached = cacheGet<InventoryItemWithDetails | null>(
      cacheKey,
      globalCache,
    );
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getInventoryItemBySKU",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!inventory_items_author_id_fkey(
            id,
            name,
            avatar,
            initials
          ),
          family:families!inventory_items_family_id_fkey(
            id,
            name,
            avatar
          ),
          transactions:inventory_transactions(
            id,
            type,
            quantity,
            previous_quantity,
            new_quantity,
            reason,
            reference,
            reference_type,
            cost,
            notes,
            processed_by,
            processed_at
          ),
          alerts:inventory_alerts(
            id,
            type,
            severity,
            message,
            is_read,
            is_resolved,
            created_at
          )
        `,
          )
          .eq("sku", sku)
          .eq("family_id", familyId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const item = data as any;
        const enrichedItem: InventoryItemWithDetails = {
          ...item,
          transactions: item.transactions || [],
          alerts: item.alerts || [],
          relatedItems: [],
        };

        cacheSet(cacheKey, enrichedItem, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: enrichedItem, error: null };
      },
      "custom",
    );
  }

  /**
   * Create a new inventory item
   */
  async createInventoryItem(
    itemData: CreateInventoryItemData,
  ): Promise<ServiceResponse<InventoryItem>> {
    return measureAsync(
      "createInventoryItem",
      async () => {
        // Calculate available quantity
        const availableQuantity = itemData.quantity;

        // Create the inventory item
        const { data: item, error } = await supabase
          .from(this.tableName)
          .insert({
            ...itemData,
            reserved_quantity: 0,
            available_quantity: availableQuantity,
            is_active: true,
            is_discontinued: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Create initial transaction record
        const { error: transactionError } = await supabase
          .from("inventory_transactions")
          .insert({
            item_id: item.id,
            family_id: itemData.familyId,
            type: "in",
            quantity: itemData.quantity,
            previous_quantity: 0,
            new_quantity: itemData.quantity,
            reason: "Initial stock",
            reference: "INITIAL",
            reference_type: "adjustment",
            cost: itemData.cost,
            processed_by: itemData.authorId,
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (transactionError) {
          // Rollback item creation if transaction fails
          await supabase.from(this.tableName).delete().eq("id", item.id);
          return {
            success: false,
            error: transactionError.message,
            data: null,
          };
        }

        // Check for low stock alert
        if (itemData.minQuantity && itemData.quantity <= itemData.minQuantity) {
          await this.createLowStockAlert(
            item.id,
            itemData.familyId,
            itemData.quantity,
            itemData.minQuantity,
          );
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: item as unknown as InventoryItem,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Update inventory quantity
   */
  async updateInventoryQuantity(
    itemId: string,
    quantity: number,
    type: "in" | "out" | "adjustment",
    reason: string,
    processedBy: string,
    reference?: string,
    referenceType?: string,
  ): Promise<ServiceResponse<InventoryTransaction>> {
    return measureAsync(
      "updateInventoryQuantity",
      async () => {
        // Get current item
        const { data: currentItem, error: fetchError } = await supabase
          .from(this.tableName)
          .select("quantity, min_quantity, max_quantity, family_id")
          .eq("id", itemId)
          .single();

        if (fetchError) {
          return { success: false, error: fetchError.message, data: null };
        }

        const previousQuantity = currentItem.quantity;
        let newQuantity = previousQuantity;

        // Calculate new quantity based on transaction type
        switch (type) {
          case "in":
            newQuantity = previousQuantity + quantity;
            break;
          case "out":
            newQuantity = Math.max(0, previousQuantity - quantity);
            break;
          case "adjustment":
            newQuantity = quantity;
            break;
          default:
            newQuantity = previousQuantity;
        }

        // Update item quantity
        const { error: updateError } = await supabase
          .from(this.tableName)
          .update({
            quantity: newQuantity,
            available_quantity: Math.max(
              0,
              newQuantity - (currentItem.reserved_quantity || 0),
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
          .from("inventory_transactions")
          .insert({
            item_id: itemId,
            family_id: currentItem.family_id,
            type: type,
            quantity: quantity,
            previous_quantity: previousQuantity,
            new_quantity: newQuantity,
            reason: reason,
            reference: reference,
            reference_type: referenceType,
            processed_by: processedBy,
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (transactionError) {
          return {
            success: false,
            error: transactionError.message,
            data: null,
          };
        }

        // Check for alerts
        if (newQuantity <= (currentItem.min_quantity || 0)) {
          await this.createLowStockAlert(
            itemId,
            currentItem.family_id,
            newQuantity,
            currentItem.min_quantity || 0,
          );
        }

        if (newQuantity >= (currentItem.max_quantity || 999999)) {
          await this.createOverstockAlert(
            itemId,
            currentItem.family_id,
            newQuantity,
            currentItem.max_quantity || 999999,
          );
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: transaction as unknown as InventoryTransaction,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Create low stock alert
   */
  private async createLowStockAlert(
    itemId: string,
    familyId: string,
    currentQuantity: number,
    minQuantity: number,
  ): Promise<void> {
    await supabase.from("inventory_alerts").insert({
      item_id: itemId,
      family_id: familyId,
      type: "low_stock",
      severity: currentQuantity === 0 ? "critical" : "high",
      message: `Item is running low on stock. Current quantity: ${currentQuantity}, Minimum quantity: ${minQuantity}`,
      is_read: false,
      is_resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Create overstock alert
   */
  private async createOverstockAlert(
    itemId: string,
    familyId: string,
    currentQuantity: number,
    maxQuantity: number,
  ): Promise<void> {
    await supabase.from("inventory_alerts").insert({
      item_id: itemId,
      family_id: familyId,
      type: "overstock",
      severity: "medium",
      message: `Item is overstocked. Current quantity: ${currentQuantity}, Maximum quantity: ${maxQuantity}`,
      is_read: false,
      is_resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Get inventory statistics for a family
   */
  async getInventoryStats(
    familyId: string,
  ): Promise<ServiceResponse<InventoryStats>> {
    const cacheKey = `inventory_stats_${familyId}`;
    const cached = cacheGet<InventoryStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getInventoryStats",
      async () => {
        const [itemsResult, transactionsResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select(
              "category, location, brand, price, cost, quantity, min_quantity, max_quantity, is_active, is_discontinued",
            )
            .eq("family_id", familyId),
          supabase
            .from("inventory_transactions")
            .select("type, quantity, cost, price")
            .eq("family_id", familyId),
        ]);

        if (itemsResult.error || transactionsResult.error) {
          return {
            success: false,
            error: "Failed to fetch inventory statistics",
            data: null,
          };
        }

        const items = itemsResult.data || [];
        const transactions = transactionsResult.data || [];

        const stats: InventoryStats = {
          totalItems: items.length,
          totalValue: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          itemsByCategory: items.reduce(
            (acc, item) => {
              const category = item.category || "uncategorized";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          itemsByLocation: items.reduce(
            (acc, item) => {
              const location = item.location || "unknown";
              acc[location] = (acc[location] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          itemsByBrand: items.reduce(
            (acc, item) => {
              const brand = item.brand || "unbranded";
              acc[brand] = (acc[brand] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          lowStockItems: items.filter(
            (item) => item.min_quantity && item.quantity <= item.min_quantity,
          ).length,
          outOfStockItems: items.filter((item) => item.quantity === 0).length,
          overstockItems: items.filter(
            (item) => item.max_quantity && item.quantity >= item.max_quantity,
          ).length,
          averageItemValue:
            items.length > 0
              ? items.reduce((sum, item) => sum + item.price, 0) / items.length
              : 0,
          totalCost: items.reduce(
            (sum, item) => sum + item.cost * item.quantity,
            0,
          ),
          totalRevenue: 0, // This would require sales data
          profitMargin: 0, // This would require sales data
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Search inventory items by text content and filters
   */
  async searchInventoryItems(
    familyId: string,
    searchParams: InventorySearchParams,
  ): Promise<ServiceResponse<InventoryItem[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `inventory_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<InventoryItem[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchInventoryItems",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%,upc.ilike.%${query}%,isbn.ilike.%${query}%`,
          );

        // Apply filters
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.subcategory) {
          queryBuilder = queryBuilder.eq("subcategory", filters.subcategory);
        }
        if (filters?.brand) {
          queryBuilder = queryBuilder.eq("brand", filters.brand);
        }
        if (filters?.supplier) {
          queryBuilder = queryBuilder.eq("supplier", filters.supplier);
        }
        if (filters?.location) {
          queryBuilder = queryBuilder.eq("location", filters.location);
        }
        if (filters?.isActive !== undefined) {
          queryBuilder = queryBuilder.eq("is_active", filters.isActive);
        }
        if (filters?.isDiscontinued !== undefined) {
          queryBuilder = queryBuilder.eq(
            "is_discontinued",
            filters.isDiscontinued,
          );
        }
        if (filters?.minPrice) {
          queryBuilder = queryBuilder.gte("price", filters.minPrice);
        }
        if (filters?.maxPrice) {
          queryBuilder = queryBuilder.lte("price", filters.maxPrice);
        }
        if (filters?.minQuantity) {
          queryBuilder = queryBuilder.gte("quantity", filters.minQuantity);
        }
        if (filters?.maxQuantity) {
          queryBuilder = queryBuilder.lte("quantity", filters.maxQuantity);
        }
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps("tags", filters.tags);
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "name":
            orderBy = "name";
            break;
          case "price":
            orderBy = "price";
            break;
          case "quantity":
            orderBy = "quantity";
            break;
          case "sku":
            orderBy = "sku";
            break;
          case "category":
            orderBy = "category";
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

        const items = (data || []) as unknown as InventoryItem[];
        cacheSet(cacheKey, items, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: items, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for inventory
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`inventory_items_family_${familyId}`),
      new RegExp(`inventory_items_with_details_${familyId}`),
      new RegExp(`inventory_item_by_sku_`),
      new RegExp(`inventory_search_${familyId}`),
      new RegExp(`inventory_stats_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const inventoryService = new InventoryService();

// Legacy export for backward compatibility
export const inventoryItemsService = inventoryService;
