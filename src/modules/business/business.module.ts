import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, DepartmentHead } from './entities';
import { BusinessRepository } from './business.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Business, DepartmentHead])],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessRepository],
  exports: [BusinessRepository],
})
export class BusinessModule {}
