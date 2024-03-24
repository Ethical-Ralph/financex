import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from './modules/business/business.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ExpressAdapter } from '@bull-board/express';
import { CommerceQueueService } from './modules/commerce/commerce.queue';
import { createBullBoard } from '@bull-board/api';
import { BusinessProcessor } from './modules/business/business.processor';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES_DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_DATABASE_URL'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    BusinessModule,
    CommerceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  private readonly serverAdapter = new ExpressAdapter();

  constructor(
    private readonly commerceQueueService: CommerceQueueService,
    private businessQueueProcessor: BusinessProcessor,
  ) {
    createBullBoard({
      queues: [
        ...this.commerceQueueService.getQueueAdapter(),
        ...this.businessQueueProcessor.getQueueAdapter(),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  configure(consumer: MiddlewareConsumer): void {
    this.serverAdapter.setBasePath('/admin/queues');
    consumer.apply(this.serverAdapter.getRouter()).forRoutes('/admin/queues');
  }
}
