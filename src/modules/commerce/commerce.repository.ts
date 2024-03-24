import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InventoryItem,
  Order,
  Transaction,
  TransactionModelName,
} from './entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommerceRepository {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectModel(TransactionModelName)
    private transactionModel: Model<Transaction>,
  ) {}

  async createOrder(order: Order): Promise<Order> {
    return this.orderRepo.save(order);
  }

  async findInventoryItemById(id: string): Promise<InventoryItem> {
    return this.inventoryItemRepo.findOne({ where: { id } });
  }

  async logTransaction(transaction: {
    businessId: string;
    departmentId: string;
    orderId: string;
    totalAmount: number;
  }): Promise<Transaction> {
    return this.transactionModel.create(transaction);
  }

  async createInventoryItem(item: InventoryItem) {
    return this.inventoryItemRepo.save(item);
  }

  async getBusinessOrders(
    businessId: string,
    meta: {
      page: number;
      limit: number;
    },
  ): Promise<
    [
      Order[],
      {
        totalPages: number;
        hasNextPage: boolean;
      },
    ]
  > {
    const { page = 1, limit = 10 } = meta;

    const [data, count] = await this.orderRepo.findAndCount({
      where: { businessId },
      take: limit,
      skip: (page - 1) * limit,
    });

    return [
      data,
      {
        totalPages: Math.ceil(count / limit),
        hasNextPage: count > (page - 1) * limit + limit,
      },
    ];
  }

  async getBusinessTransactionLogs(businessId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ businessId });
  }
}
