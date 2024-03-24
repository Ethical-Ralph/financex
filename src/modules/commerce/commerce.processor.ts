import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CommerceRepository } from './commerce.repository';
import { TaxService } from './tax.service';

export const COMMERCE_QUEUE_NAME = 'commerce_queue';

type TSuccessString = 'transaction_logged' | 'tax_proceesed';

export type TCommerceOrderDetails = {
  businessId: string;
  departmentId: string;
  orderId: string;
  totalAmount: number;
  taxAmount: number;
  success?: Array<TSuccessString>;
};

@Processor(COMMERCE_QUEUE_NAME)
export class CommerceProcessor extends WorkerHost {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private taxService: TaxService,
  ) {
    super();
  }

  private buildSuccessArray(
    success: Array<TSuccessString>,
    payload: TSuccessString,
  ) {
    return [...new Set([...success, payload])];
  }

  async process(job: Job<TCommerceOrderDetails, any, string>): Promise<any> {
    Logger.log(`Processing job: ${job.id}`);
    const { businessId, departmentId, orderId, totalAmount, taxAmount } =
      job.data;

    const success = job.data?.success || [];

    if (!success.includes('transaction_logged')) {
      await this.commerceRepository.logTransaction({
        businessId,
        departmentId,
        orderId,
        totalAmount,
      });

      await job.updateData({
        ...job.data,
        // update success status of the job to avoid reprocessing in case of failure
        success: this.buildSuccessArray(success, 'transaction_logged'),
      });

      success.push('transaction_logged');
    }

    if (!success.includes('tax_proceesed')) {
      await this.taxService.logTax({
        orderId,
        businessId,
        totalAmount,
        taxAmount,
      });

      await job.updateData({
        ...job.data,
        // update success status of the job to avoid reprocessing in case of failure
        success: this.buildSuccessArray(success, 'tax_proceesed'),
      });
    }

    return job.data;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TCommerceOrderDetails, any, string>) {
    Logger.log(`Job with orderId: ${job.data.orderId} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TCommerceOrderDetails, any, string>, error: Error) {
    Logger.error(
      `Job with orderId: ${job.data.orderId} failed: ${job.failedReason}`,
      error,
    );
  }
}
