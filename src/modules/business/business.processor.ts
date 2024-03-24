import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BusinessRepository } from './business.repository';
import { BUSINESS_CREDIT_SCORE_QUEUE } from './business.constant';

@Processor(BUSINESS_CREDIT_SCORE_QUEUE)
export class BusinessProcessor extends WorkerHost {
  constructor(private readonly businessRepository: BusinessRepository) {
    super();
  }

  async process(job: Job<{ businessId: string }, any, string>): Promise<any> {
    const { businessId } = job.data;
    Logger.log(
      `Processing business credit score for business ID: ${businessId}`,
    );

    try {
      let totalCredit = 0;
      let transactionCount = 0;

      const sumTransactions = async (page = 1) => {
        const { creditSum, count, hasNextPage } = await this.getTransactionsSum(
          businessId,
          page,
        );

        totalCredit += creditSum;
        transactionCount += count;

        if (hasNextPage) {
          await sumTransactions(page + 1);
        }
      };

      await sumTransactions();

      // Update business credit score
      const creditScore = this.determineCreditScore(
        totalCredit,
        transactionCount,
      );
      await this.businessRepository.updateBusinessCreditScore({
        businessId,
        creditScore,
      });

      Logger.log(`Updated credit score for business ID: ${businessId}`);
    } catch (error) {
      Logger.error(
        `Error processing business credit score for business ID ${businessId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async getTransactionsSum(businessId: string, transactionPage = 1) {
    // Get transactions in batches using pagination
    const [transactions, { hasNextPage, count }] =
      await this.businessRepository.getTransactionLogs({
        businessId,
        page: transactionPage,
        limit: 100,
      });

    const creditSum = transactions.reduce(
      (acc, transaction) => acc + transaction.totalAmount,
      0,
    );
    return { creditSum, count, hasNextPage };
  }

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
}