import { HttpException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CommerceRepository } from './commerce.repository';
import { BusinessRepository } from '../business/business.repository';
import { Order, OrderItems } from './entities';

@Injectable()
export class CommerceService {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private businessRepository: BusinessRepository,
  ) {}

  async create(
    businessId: string,
    departmentId: string,
    payload: CreateOrderDto,
  ) {
    const businessExists = await this.businessRepository.findBusinessById(
      businessId,
    );

    if (!businessExists) {
      throw new HttpException('Invalid business', 400);
    }

    const departmentExists =
      await this.businessRepository.validateBusinessDepartment(
        businessId,
        departmentId,
      );

    if (!departmentExists) {
      throw new HttpException('Invalid department', 400);
    }

    const orderItems: OrderItems[] = await Promise.all(
      payload.orderItems.map(async (item) => {
        const inventoryItem =
          await this.commerceRepository.findInventoryItemById(item.itemId);

        if (!inventoryItem) {
          throw new HttpException(
            `Invalid inventory item: ${item.itemId}`,
            400,
          );
        }

        return {
          item: inventoryItem,
          quantity: item.quantity,
          price: inventoryItem.price * item.quantity,
        };
      }),
    );

    const orderPayload: Order = {
      orderItems,
      business: businessExists,
      departmentHeadId: departmentId,
      totalPrice: orderItems.reduce((acc, item) => acc + item.price, 0),
    };

    const order = await this.commerceRepository.createOrder(orderPayload);

    await this.commerceRepository.logTransaction({
      businessId,
      departmentId,
      orderId: order.id,
      totalAmount: order.totalPrice,
    });

    return order;
  }
}
