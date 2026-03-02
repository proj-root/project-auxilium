export class APIError extends Error {
  status: string | number;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorisedError extends APIError {
  constructor(message: string = 'User is not authorised to access this page.') {
    super(message, 401);
    this.name = 'UnauthorisedError';
  }
}

export type RTKApiError = {
  status: number | string;
  data: any;
  error?: string;
};
