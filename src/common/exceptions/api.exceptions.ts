import { HttpException, HttpStatus } from '@nestjs/common'

import { ErrorCode } from '../constants/error-codes.enum'

export type ErrorDetails = Record<string, any> | string | string[] | null

export class AppException extends HttpException {
  readonly code: ErrorCode
  readonly details: ErrorDetails

  constructor(params: {
    code: ErrorCode
    message: string
    status: HttpStatus
    details?: ErrorDetails
  }) {
    const { code, message, status, details = null } = params

    super(
      {
        code,
        message,
        details,
      },
      status
    )

    this.code = code
    this.details = details
  }

  static authInvalidCredentials() {
    return new AppException({
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid email or password',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  static authEmailTaken() {
    return new AppException({
      code: ErrorCode.AUTH_EMAIL_TAKEN,
      message: 'Email already in use',
      status: HttpStatus.CONFLICT,
    })
  }

  static authUnauthorized() {
    return new AppException({
      code: ErrorCode.AUTH_UNAUTHORIZED,
      message: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  static authForbidden() {
    return new AppException({
      code: ErrorCode.AUTH_FORBIDDEN,
      message: 'Forbidden',
      status: HttpStatus.FORBIDDEN,
    })
  }

  static authInvalidToken() {
    return new AppException({
      code: ErrorCode.AUTH_INVALID_TOKEN,
      message: 'Invalid token',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  static authTokenExpired() {
    return new AppException({
      code: ErrorCode.AUTH_TOKEN_EXPIRED,
      message: 'Token expired',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  static authRefreshTokenInvalid() {
    return new AppException({
      code: ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
      message: 'Refresh token is invalid or expired',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  static userNotFound() {
    return new AppException({
      code: ErrorCode.USER_NOT_FOUND,
      message: 'User not found',
      status: HttpStatus.NOT_FOUND,
    })
  }

  static userInactive() {
    return new AppException({
      code: ErrorCode.USER_INACTIVE,
      message: 'User account is inactive',
      status: HttpStatus.FORBIDDEN,
    })
  }

  static userEmailNotVerified() {
    return new AppException({
      code: ErrorCode.USER_EMAIL_NOT_VERIFIED,
      message: 'Email is not verified',
      status: HttpStatus.FORBIDDEN,
    })
  }

  static usernameTaken() {
    return new AppException({
      code: ErrorCode.USERNAME_TAKEN,
      message: 'Username already taken',
      status: HttpStatus.CONFLICT,
    })
  }

  static validationFailed(details?: ErrorDetails) {
    return new AppException({
      code: ErrorCode.VALIDATION_FAILED,
      message: 'Validation failed',
      status: HttpStatus.BAD_REQUEST,
      details,
    })
  }

  static invalidHeader(details?: ErrorDetails) {
    return new AppException({
      code: ErrorCode.INVALID_HEADER,
      message: 'Invalid header',
      status: HttpStatus.BAD_REQUEST,
      details,
    })
  }

  static badRequest(message = 'Bad request', details?: ErrorDetails) {
    return new AppException({
      code: ErrorCode.BAD_REQUEST,
      message,
      status: HttpStatus.BAD_REQUEST,
      details,
    })
  }

  static conflict(message = 'Conflict', details?: ErrorDetails) {
    return new AppException({
      code: ErrorCode.CONFLICT,
      message,
      status: HttpStatus.CONFLICT,
      details,
    })
  }

  static notFound(message = 'Not found') {
    return new AppException({
      code: ErrorCode.NOT_FOUND,
      message,
      status: HttpStatus.NOT_FOUND,
    })
  }

  static internal(details?: ErrorDetails) {
    return new AppException({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    })
  }
}
