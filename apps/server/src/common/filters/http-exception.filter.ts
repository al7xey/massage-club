import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly exposeDetails = false) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : this.exposeDetails
        ? getUnknownExceptionResponse(exception)
        : 'Internal server error';
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

function getUnknownExceptionResponse(exception: unknown) {
  if (exception instanceof Error) {
    return {
      message: exception.message || 'Internal server error',
      name: exception.name,
      stack: exception.stack,
    };
  }

  return {
    message: 'Internal server error',
    error: exception,
  };
}
