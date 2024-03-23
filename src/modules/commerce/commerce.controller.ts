import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CreateInventoryItemDto, CreateOrderDto } from './dto';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Post(':businessId/:departmentId/order')
  create(
    @Body() payload: CreateOrderDto,
    @Param('businessId') businessId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.commerceService.create(businessId, departmentId, payload);
  }

  @Post(':businessId/inventory')
  createInventoryItem(
    @Body() payload: CreateInventoryItemDto,
    @Param('businessId') businessId: string,
  ) {
    return this.commerceService.createInventoryItem(businessId, payload);
  }

  @Get(':businessId/orders')
  getBusinessOrders(@Param('businessId') businessId: string) {
    return this.commerceService.getBusinessOrders(businessId);
  }
}
