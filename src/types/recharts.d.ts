declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  export interface XAxisProps {
    dataKey?: string;
    stroke?: string;
    axisLine?: boolean;
    tickLine?: boolean;
    tickMargin?: number;
  }

  export interface YAxisProps {
    stroke?: string;
    axisLine?: boolean;
    tickLine?: boolean;
    tickMargin?: number;
  }

  export interface AreaProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
  }

  export interface TooltipProps {
    contentStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    itemStyle?: React.CSSProperties;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    stroke?: string;
    vertical?: boolean;
  }

  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const Area: ComponentType<AreaProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const ResponsiveContainer: ComponentType<{
    width?: string | number;
    height?: string | number;
    children?: ReactNode;
  }>;
  export const AreaChart: ComponentType<{
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
  }>;
}

declare module 'recharts/es6' {
  export * from 'recharts';
}
