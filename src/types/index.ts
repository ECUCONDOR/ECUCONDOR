export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}
