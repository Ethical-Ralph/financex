import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommerceService } from './commerce.service';
import { CommerceController } from './commerce.controller';
import { CommerceRepository } from './commerce.repository';
import {
  InventoryItem,
  Order,
  TransactionModelName,
  TransactionSchema,
} from './entities';
import { BusinessModule } from '../business/business.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    BusinessModule,
    TypeOrmModule.forFeature([InventoryItem, Order]),
    MongooseModule.forFeature([
      { name: TransactionModelName, schema: TransactionSchema },
    ]),
  ],
  controllers: [CommerceController],
  providers: [CommerceService, CommerceRepository],
})
export class CommerceModule {}
