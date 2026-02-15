import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'

import { ErrorCode } from '../constants/error-codes.enum'
import { AppException } from '../exceptions/api.exceptions'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: FastifyReply = ctx.getResponse()

    if (exception instanceof AppException) {
      return response
        .status(exception.getStatus())
        .send(exception.getResponse())
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const message = exception.message

      return response.status(status).send({
        code: ErrorCode.INTERNAL_ERROR,
        message,
        details: null,
      })
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
      details: null,
    })
  }
}
