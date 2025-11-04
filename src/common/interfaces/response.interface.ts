export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
  trace?: string;
}
