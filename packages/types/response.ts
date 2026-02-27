export interface BaseResponseDTO<T = Record<string, unknown>> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}