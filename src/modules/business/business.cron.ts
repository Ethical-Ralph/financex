import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BusinessRepository } from './business.repository';
import { RedisService } from '../../shared';

@Injectable()
export class BusinessCron {
  constructor(
    private businessRepository: BusinessRepository,
    private redisService: RedisService,
  ) {}

  // dummy logic to calculate credit score
  private determineCreditScore(totalAmount: number, totalTransactions: number) {
    let creditScore = 0;
    const scoringSystem = [
      { maxAmount: 10000, maxTransactions: 5, score: 25 },
      { maxAmount: 100000, maxTransactions: 10, score: 50 },
      { maxAmount: 1000000, maxTransactions: 15, score: 75 },
      { maxAmount: Infinity, maxTransactions: Infinity, score: 100 },
    ];

    for (const category of scoringSystem) {
      if (
        totalAmount <= category.maxAmount &&
        totalTransactions <= category.maxTransactions
      ) {
        creditScore = category.score;
        break;
      }
    }

    return creditScore;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateBusinessCreditScore() {
    Logger.log('Calculating business credit score');
    // get all businesses in batches using pagination to avoid overloading the server memory
    const processBusinesses = async (
      page = 1,
    ): Promise<{ hasNextPage: boolean; total: number }> => {
      const [businesses, businessMeta] =
        await this.businessRepository.getAllBusinesses({
          page,
          limit: 100,
        });

      Logger.log(`Processing ${businesses.length} businesses`);

      await Promise.allSettled(
        businesses.map(async (business) => {
          let totalCredit = 0;
          let transactionCount = 0;

          // get transactions in a batch using pagination
          // to avoid overloading the server memory
          const processTransactions = async (transactionPage = 1) => {
            const [transactions, { hasNextPage, count }] =
              await this.businessRepository.getTransactionLogs({
                businessId: business.id,
                page: transactionPage,
                limit: 100,
              });

            const creditSum = transactions.reduce(
              (acc, transaction) => acc + transaction.totalAmount,
              0,
            );

            totalCredit += creditSum;
            transactionCount += count;

            // recursively process transactions
            if (hasNextPage) {
              await processTransactions(transactionPage + 1);
            }
          };

          await processTransactions();

          // update business credit score
          await this.businessRepository.updateBusinessCreditScore({
            businessId: business.id,
            creditScore: this.determineCreditScore(
              totalCredit,
              transactionCount,
            ),
          });

          Logger.log(`Updated credit score for business: ${business.id}`);
        }),
      );

      Logger.log(`Processed ${businesses.length} businesses`);

      return {
        hasNextPage: businessMeta.hasNextPage,
        total: businessMeta.totalPages,
      };
    };

    // acquire lock to prevent multiple instances of the server from running the cron job
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
      for (let page = 1; ; page++) {
        const { hasNextPage, total } = await processBusinesses(page);

        Logger.log(`Processed page ${page} of ${total}`);

        if (!hasNextPage) {
          break;
        }
      }
    } catch (error) {
      Logger.error(`Error processing business credit score: ${error.message}`);
    } finally {
      await this.redisService.releaseLock(lockKey, uniqueServerId);
    }
  }
}
