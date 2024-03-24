import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, DepartmentHead } from './entities';
import { BusinessRepository } from './business.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModelName, TransactionSchema } from '../commerce/entities';
import { BusinessCron } from './business.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, DepartmentHead]),
    MongooseModule.forFeature([
      { name: TransactionModelName, schema: TransactionSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessRepository, BusinessCron],
  exports: [BusinessRepository],
})
export class BusinessModule {}
