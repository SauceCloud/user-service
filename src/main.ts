import fastifyCookie from '@fastify/cookie'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app.module'
import { ValidationCode } from './common/constants/validation-codes.enum'
import { AppException } from './common/exceptions/api.exceptions'
import { AppExceptionFilter } from './common/filters/http-exception.filter'
import { tryParseCode } from './common/utils/validation.utils'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  const config = app.get(ConfigService)

  await app.register(fastifyCookie, {
    secret: config.getOrThrow<string>('COOKIES_SECRET'),
  })

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    })
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => {
        const fields: Record<string, { code: string }[]> = {}

        for (const e of errors) {
          const constraints = e.constraints ?? {}
          const items: { code: string }[] = []

          for (const key of Object.keys(constraints)) {
            const rawMsg = constraints[key]
            const code =
              tryParseCode(rawMsg) ?? ValidationCode.VALIDATION_UNKNOWN
            items.push({ code })
          }

          if (items.length) fields[e.property] = items
        }

        throw AppException.validationFailed({ fields })
      },
    })
  )

  app.useGlobalFilters(new AppExceptionFilter())

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  })

  app.setGlobalPrefix('api')

  await app.listen(config.getOrThrow<number>('APP_PORT'))
}
bootstrap()
