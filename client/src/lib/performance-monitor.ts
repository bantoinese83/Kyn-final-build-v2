// Performance Monitor - Real-time performance monitoring and profiling
// Identifies and resolves performance bottlenecks proactively

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: "render" | "network" | "memory" | "cache" | "custom";
  metadata?: Record<string, any>;
}

export interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  category: "render" | "network" | "memory" | "cache" | "custom";
}

export interface PerformanceAlert {
  id: string;
  metric: PerformanceMetric;
  threshold: PerformanceThreshold;
  severity: "warning" | "critical";
  timestamp: number;
  message: string;
}

export interface PerformanceReport {
  summary: {
    totalMetrics: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    cacheHitRate: number;
    networkLatency: number;
  };
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  recommendations: string[];
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();
  private alertHandlers: Set<(alert: PerformanceAlert) => void> = new Set();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupDefaultThresholds();
    this.startMonitoring();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 1000); // Collect metrics every second
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Add performance metric
   */
  addMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);
    this.checkThresholds(fullMetric);
    this.notifyObservers(fullMetric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Measure render performance
   */
  measureRender(componentName: string, renderFn: () => void): number {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    this.addMetric({
      name: `render_${componentName}`,
      value: renderTime,
      unit: "ms",
      category: "render",
      metadata: { componentName },
    });

    return renderTime;
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    category: "network" | "custom" = "custom",
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.addMetric({
        name: `async_${operationName}`,
        value: duration,
        unit: "ms",
        category,
        metadata: { operationName, success: true },
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.addMetric({
        name: `async_${operationName}`,
        value: duration,
        unit: "ms",
        category,
        metadata: { operationName, success: false, error: error.message },
      });

      throw error;
    }
  }

  /**
   * Measure memory usage
   */
  measureMemory(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory;

      this.addMetric({
        name: "memory_used",
        value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        unit: "MB",
        category: "memory",
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024,
          jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024,
        },
      });
    }
  }

  /**
   * Measure network performance
   */
  measureNetwork(url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = performance.now();

    return fetch(url, options).then((response) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.addMetric({
        name: "network_request",
        value: duration,
        unit: "ms",
        category: "network",
        metadata: {
          url,
          status: response.status,
          statusText: response.statusText,
          method: options.method || "GET",
        },
      });

      return response;
    });
  }

  /**
   * Add performance threshold
   */
  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold);
  }

  /**
   * Remove performance threshold
   */
  removeThreshold(name: string): void {
    this.thresholds = this.thresholds.filter((t) => t.name !== name);
  }

  /**
   * Subscribe to performance metrics
   */
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer);

    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Subscribe to performance alerts
   */
  subscribeToAlerts(handler: (alert: PerformanceAlert) => void): () => void {
    this.alertHandlers.add(handler);

    return () => {
      this.alertHandlers.delete(handler);
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics(filter?: {
    category?: PerformanceMetric["category"];
    name?: string;
    startTime?: number;
    endTime?: number;
  }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.category) {
      filtered = filtered.filter((m) => m.category === filter.category);
    }

    if (filter?.name) {
      filtered = filtered.filter((m) => m.name.includes(filter.name));
    }

    if (filter?.startTime) {
      filtered = filtered.filter((m) => m.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter((m) => m.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const renderMetrics = this.getMetrics({ category: "render" });
    const memoryMetrics = this.getMetrics({ category: "memory" });
    const networkMetrics = this.getMetrics({ category: "network" });
    const cacheMetrics = this.getMetrics({ category: "cache" });

    const averageRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) /
          renderMetrics.length
        : 0;

    const averageMemoryUsage =
      memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) /
          memoryMetrics.length
        : 0;

    const averageNetworkLatency =
      networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.value, 0) /
          networkMetrics.length
        : 0;

    const recommendations = this.generateRecommendations({
      averageRenderTime,
      averageMemoryUsage,
      averageNetworkLatency,
    });

    return {
      summary: {
        totalMetrics: this.metrics.length,
        averageRenderTime,
        averageMemoryUsage,
        cacheHitRate: 0, // Will be calculated from cache metrics
        networkLatency: averageNetworkLatency,
      },
      metrics: this.metrics,
      alerts: this.alerts,
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all metrics and alerts
   */
  clear(): void {
    this.metrics = [];
    this.alerts = [];
  }

  /**
   * Setup default performance thresholds
   */
  private setupDefaultThresholds(): void {
    this.addThreshold({
      name: "render_time",
      warning: 16, // 16ms = 60fps
      critical: 33, // 33ms = 30fps
      category: "render",
    });

    this.addThreshold({
      name: "memory_usage",
      warning: 100, // 100MB
      critical: 500, // 500MB
      category: "memory",
    });

    this.addThreshold({
      name: "network_request",
      warning: 1000, // 1 second
      critical: 5000, // 5 seconds
      category: "network",
    });
  }

  /**
   * Collect performance metrics
   */
  private collectMetrics(): void {
    // Collect memory metrics
    this.measureMemory();

    // Collect navigation timing metrics
    if ("navigation" in performance) {
      const navigation = (performance as any).navigation;
      if (navigation.timing) {
        const timing = navigation.timing;
        const loadTime = timing.loadEventEnd - timing.loadEventStart;

        this.addMetric({
          name: "page_load_time",
          value: loadTime,
          unit: "ms",
          category: "render",
          metadata: { type: "navigation" },
        });
      }
    }

    // Collect resource timing metrics
    if ("getEntriesByType" in performance) {
      const resources = performance.getEntriesByType("resource");
      resources.forEach((resource) => {
        if (resource.entryType === "resource") {
          this.addMetric({
            name: "resource_load_time",
            value: resource.duration,
            unit: "ms",
            category: "network",
            metadata: {
              name: resource.name,
              type: resource.initiatorType,
            },
          });
        }
      });
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const relevantThresholds = this.thresholds.filter(
      (t) => t.category === metric.category && metric.name.includes(t.name),
    );

    for (const threshold of relevantThresholds) {
      if (metric.value >= threshold.critical) {
        this.createAlert(metric, threshold, "critical");
      } else if (metric.value >= threshold.warning) {
        this.createAlert(metric, threshold, "warning");
      }
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    metric: PerformanceMetric,
    threshold: PerformanceThreshold,
    severity: "warning" | "critical",
  ): void {
    const alert: PerformanceAlert = {
      id: `${metric.name}_${Date.now()}`,
      metric,
      threshold,
      severity,
      timestamp: Date.now(),
      message: `${metric.name} exceeded ${severity} threshold: ${metric.value}${metric.unit} >= ${threshold[severity]}${metric.unit}`,
    };

    this.alerts.push(alert);
    this.notifyAlertHandlers(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Notify metric observers
   */
  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach((observer) => {
      try {
        observer(metric);
      } catch (error) {
        console.warn("Performance observer error:", error);
      }
    });
  }

  /**
   * Notify alert handlers
   */
  private notifyAlertHandlers(alert: PerformanceAlert): void {
    this.alertHandlers.forEach((handler) => {
      try {
        handler(alert);
      } catch (error) {
        console.warn("Performance alert handler error:", error);
      }
    });
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: {
    averageRenderTime: number;
    averageMemoryUsage: number;
    averageNetworkLatency: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.averageRenderTime > 16) {
      recommendations.push(
        "Consider implementing React.memo or useMemo to reduce render times",
      );
      recommendations.push(
        "Use React.lazy for code splitting to improve initial render performance",
      );
    }

    if (metrics.averageMemoryUsage > 100) {
      recommendations.push(
        "Implement virtual scrolling for large lists to reduce memory usage",
      );
      recommendations.push(
        "Use WeakMap/WeakSet for object references to allow garbage collection",
      );
    }

    if (metrics.averageNetworkLatency > 1000) {
      recommendations.push("Implement request caching to reduce network calls");
      recommendations.push("Consider using a CDN for static assets");
    }

    if (recommendations.length === 0) {
      recommendations.push("Performance is within acceptable ranges");
    }

    return recommendations;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for common performance measurements
export const measureRender = (componentName: string, renderFn: () => void) =>
  performanceMonitor.measureRender(componentName, renderFn);

export const measureAsync = <T>(
  operationName: string,
  operation: () => Promise<T>,
  category?: "network" | "custom",
) => performanceMonitor.measureAsync(operationName, operation, category);

export const measureNetwork = (url: string, options?: RequestInit) =>
  performanceMonitor.measureNetwork(url, options);

export const addPerformanceThreshold = (threshold: PerformanceThreshold) =>
  performanceMonitor.addThreshold(threshold);

export const subscribeToPerformance = (
  observer: (metric: PerformanceMetric) => void,
) => performanceMonitor.subscribe(observer);

export const subscribeToPerformanceAlerts = (
  handler: (alert: PerformanceAlert) => void,
) => performanceMonitor.subscribeToAlerts(handler);

export const getPerformanceReport = () => performanceMonitor.generateReport();
