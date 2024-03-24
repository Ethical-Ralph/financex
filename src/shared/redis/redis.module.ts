import { Module } from '@nestjs/common';
import { RedisModule as RedisCoreModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    RedisCoreModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        config: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
