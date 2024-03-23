import { Controller, Post, Body, Param } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Post(':businessId/:departmentId/orders')
  create(
    @Body() payload: CreateOrderDto,
    @Param('businessId') businessId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.commerceService.create(businessId, departmentId, payload);
  }
}
