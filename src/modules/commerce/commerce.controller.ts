import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CreateInventoryItemDto, CreateOrderDto } from './dto';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Post(':businessId/order/:departmentId')
  create(
    @Body() payload: CreateOrderDto,
    @Param('businessId') businessId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.commerceService.createOrder(businessId, departmentId, payload);
  }

  @Post(':businessId/inventory')
  createInventoryItem(
    @Body() payload: CreateInventoryItemDto,
    @Param('businessId') businessId: string,
  ) {
    return this.commerceService.createInventoryItem(businessId, payload);
  }

  @Get(':businessId/orders')
  getBusinessOrders(
    @Param('businessId') businessId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.commerceService.getBusinessOrders(businessId, { page, limit });
  }

  @Get(':businessId/stats')
  getBusinessStats(@Param('businessId') businessId: string) {
    return this.commerceService.getBusinessStats(businessId);
  }
}
