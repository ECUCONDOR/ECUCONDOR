import { componentLoggers } from './logger';

const { ui: logger } = componentLoggers;

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface MetricSummary {
  min: number;
  max: number;
  avg: number;
  count: number;
  p95: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, Metric[]> = new Map();
  private readonly maxMetricsPerType = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricsList = this.metrics.get(name)!;
    
    // Agregar nueva métrica
    metricsList.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });

    // Mantener solo las últimas maxMetricsPerType métricas
    if (metricsList.length > this.maxMetricsPerType) {
      metricsList.splice(0, metricsList.length - this.maxMetricsPerType);
    }

    // Log de la métrica
    logger.debug(`Metric tracked: ${name}`, { value, tags });
  }

  getMetricSummary(name: string, timeWindowMs?: number): MetricSummary | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    // Filtrar por ventana de tiempo si se especifica
    const filteredMetrics = timeWindowMs
      ? metrics.filter(m => Date.now() - m.timestamp <= timeWindowMs)
      : metrics;

    if (filteredMetrics.length === 0) return null;

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(values.length * 0.95);

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      count: values.length,
      p95: values[p95Index],
    };
  }

  clearMetrics(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const monitor = PerformanceMonitor.getInstance();

// Ejemplo de uso:
// monitor.trackMetric('api_response_time', 150, { endpoint: '/api/users' });
// monitor.trackMetric('component_render_time', 50, { component: 'UserList' });
// const summary = monitor.getMetricSummary('api_response_time', 5 * 60 * 1000); // últimos 5 minutos
