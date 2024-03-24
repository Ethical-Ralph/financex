import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  COMMERCE_QUEUE_NAME,
  TCommerceOrderDetails,
} from './commerce.processor';

@Injectable()
export class CommerceQueueService {
  constructor(
    @InjectQueue(COMMERCE_QUEUE_NAME) private readonly commerceQueue: Queue,
  ) {}

  async processOrderMeta(orderDetails: TCommerceOrderDetails) {
    try {
      await this.commerceQueue.add(orderDetails.orderId, orderDetails, {
        removeOnComplete: true,
      });

      Logger.log(
        `Order meta added to queue: ${orderDetails.orderId}`,
        CommerceQueueService.name,
      );
    } catch (error) {
      // fail silently, to avoid failing the main process
      // log and send to monitoring/alerting service
      Logger.error(
        `Error adding order meta to queue: ${orderDetails.orderId}`,
        error.stack,
        CommerceQueueService.name,
      );
    }
  }
}
