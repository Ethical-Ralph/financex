import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
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
        jobId: orderDetails.orderId,
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

  getBoardAdapter() {
    const serverAdapter = new ExpressAdapter();

    createBullBoard({
      queues: [new BullMQAdapter(this.commerceQueue, { readOnlyMode: false })],
      serverAdapter,
    });

    return serverAdapter;
  }
}
