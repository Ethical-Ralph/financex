import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { BusinessRepository } from './business.repository';
import { RedisService } from '../../shared';
import { BUSINESS_CREDIT_SCORE_QUEUE } from './business.constant';

@Injectable()
export class BusinessCron {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly redisService: RedisService,
    @InjectQueue(BUSINESS_CREDIT_SCORE_QUEUE) private businessQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateBusinessCreditScore() {
    // Acquire lock to prevent multiple instances of the server from running the cron job
    const lockKey = 'business_credit_score';
    const ttl = 60 * 60 * 24; // 24 hours
    const uniqueServerId = Math.random().toString(36).substring(7);

    const isMaster = await this.redisService.acquireLock(
      lockKey,
      uniqueServerId,
      ttl,
    );

    if (!isMaster) {
      Logger.log('Another server instance is already processing the cron job');
      return;
    }

    try {
      Logger.log('Running business credit score cron job');

      for (let page = 1; ; page++) {
        const { hasNextPage, total } = await this.processBusinesses(page);

        Logger.log(`Processed page ${page} of ${total}`);

        // Break the loop if there are no more pages to process
        if (!hasNextPage) {
          break;
        }
      }
    } catch (error) {
      Logger.error(`Error processing business credit score: ${error.message}`);
    } finally {
      // Release the lock
      await this.redisService.releaseLock(lockKey, uniqueServerId);
    }
  }

  private async processBusinesses(
    page = 1,
  ): Promise<{ hasNextPage: boolean; total: number }> {
    // Get all businesses in batches using pagination
    const [businesses, businessMeta] =
      await this.businessRepository.getAllBusinesses({
        page,
        limit: 100,
      });

    Logger.log(`Processing ${businesses.length} businesses`);

    // Push jobs to BullMQ queue for processing, so it can be done in parallel and scale better
    await Promise.allSettled(
      businesses.map(async (business) => {
        await this.businessQueue.add('calculateCreditScore', {
          businessId: business.id,
        });
      }),
    );

    Logger.log(`Processed ${businesses.length} businesses`);

    return {
      hasNextPage: businessMeta.hasNextPage,
      total: businessMeta.totalPages,
    };
  }
}
