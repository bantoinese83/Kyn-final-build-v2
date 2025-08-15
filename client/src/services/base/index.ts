// Base Services Index - Centralized exports for all base services
// Provides a single import point for all base service functionality

// Base service classes
export { BaseService } from "./BaseService";
export type { BaseEntity, BaseFilters, PaginationResult } from "./BaseService";
export { FamilyService } from "./FamilyService";
export type { FamilyEntity, FamilyFilters } from "./FamilyService";

// Service error handling
export {
  ServiceErrorHandler,
  handleServiceOperation,
  handleOptimisticOperation,
  handleBatchOperation,
  createServiceResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/service-error-handler";

// Export service error types
export type { ServiceErrorContext } from "@/lib/service-error-handler";

// Re-export common types
export type { ServiceResponse } from "@/types/shared";

// Utility types for services
export interface ServiceConfig {
  tableName: string;
  selectFields: string;
  enableAudit?: boolean;
  enableSoftDelete?: boolean;
  enableOptimisticUpdates?: boolean;
}

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SoftDeleteFields {
  deletedAt?: string;
  deletedBy?: string;
  isDeleted?: boolean;
}

// Common service interfaces
export interface CrudService<T, CreateData, UpdateData> {
  create(data: CreateData): Promise<ServiceResponse<T>>;
  getById(id: string): Promise<ServiceResponse<T>>;
  update(id: string, data: UpdateData): Promise<ServiceResponse<T>>;
  delete(id: string): Promise<ServiceResponse<boolean>>;
  getList(filters?: any): Promise<ServiceResponse<any>>;
  exists(id: string): Promise<ServiceResponse<boolean>>;
  getByIds(ids: string[]): Promise<ServiceResponse<T[]>>;
}

export interface FamilyCrudService<T, CreateData, UpdateData>
  extends CrudService<T, CreateData, UpdateData> {
  getByFamilyId(familyId: string, filters?: any): Promise<ServiceResponse<any>>;
  getByAuthorInFamily(
    familyId: string,
    authorId: string,
    filters?: any,
  ): Promise<ServiceResponse<T[]>>;
  getPublicByFamilyId(
    familyId: string,
    filters?: any,
  ): Promise<ServiceResponse<T[]>>;
  hasPermission(
    entityId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>>;
  getCountByFamily(familyId: string): Promise<ServiceResponse<number>>;
}

// Service factory function type
export type ServiceFactory<T, CreateData, UpdateData> = new (
  config: ServiceConfig,
) => T extends FamilyEntity
  ? FamilyCrudService<T, CreateData, UpdateData>
  : CrudService<T, CreateData, UpdateData>;

// Common service utilities
export const createServiceConfig = (
  tableName: string,
  selectFields: string,
  options: Partial<Omit<ServiceConfig, "tableName" | "selectFields">> = {},
): ServiceConfig => ({
  tableName,
  selectFields,
  enableAudit: true,
  enableSoftDelete: false,
  enableOptimisticUpdates: false,
  ...options,
});

export const buildSelectQuery = (
  baseFields: string,
  additionalFields: string[] = [],
): string => {
  const fields = [baseFields, ...additionalFields];
  return fields.join(", ");
};

export const createPaginationParams = (
  page: number = 1,
  pageSize: number = 20,
  orderBy: string = "createdAt",
  orderDirection: "asc" | "desc" = "desc",
) => ({
  page,
  pageSize,
  orderBy,
  orderDirection,
  offset: (page - 1) * pageSize,
});

export const validatePaginationParams = (
  page: number,
  pageSize: number,
  maxPageSize: number = 100,
) => {
  const validPage = Math.max(1, Math.floor(page) || 1);
  const validPageSize = Math.min(
    Math.max(1, Math.floor(pageSize) || 20),
    maxPageSize,
  );

  return {
    page: validPage,
    pageSize: validPageSize,
    offset: (validPage - 1) * validPageSize,
  };
};
