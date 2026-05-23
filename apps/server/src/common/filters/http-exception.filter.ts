import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly exposeDetails = false) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const message = getExceptionMessage(exceptionResponse);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      error: status >= 500 && !this.exposeDetails ? 'Internal server error' : exceptionResponse,
    });
  }
}

function getExceptionMessage(exceptionResponse: unknown) {
  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }

  if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
    const message = (exceptionResponse as { message?: string | string[] }).message;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  return 'Request failed';
}
