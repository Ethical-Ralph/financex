import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TaxService {
  constructor(private readonly httpService: HttpService) {}

  async logTax(orderDetails: {
    orderId: string;
    businessId: string;
    totalAmount: number;
    taxAmount: number;
  }): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        'https://taxes.free.beeceptor.com/log-tax',
        orderDetails,
        {
          timeout: 35 * 1000,
        },
      );
    } catch (error) {
      Logger.error('Error logging tax:', error.message);
      throw error;
    }
  }
}
