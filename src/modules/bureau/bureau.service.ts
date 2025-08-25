import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { config, CreditReportData } from 'src/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BureauService {
  constructor(private readonly prismaService: PrismaService) {}

  // call the bureau API with exponential backoff
  private async callCreditBureauApi<T>(
    url: string,
    options: AxiosRequestConfig,
    retries = 3,
    delay = 1000,
  ): Promise<T> {
    try {
      const response = await axios<T>(url, options);

      if ([400, 429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`Retryable error: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      const status = error.response?.status;

      if (retries > 0 && [400, 429, 500, 502, 503, 504].includes(status)) {
        console.warn(
          `Request failed with ${status}, retrying in ${delay}ms... (${retries} retries left)`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callCreditBureauApi<T>(
          url,
          options,
          retries - 1,
          delay * 2,
        );
      }

      throw error;
    }
  }

  // generate fallback random credit data
  private generateRandomCreditData(): CreditReportData {
    return {
      score: Math.floor(Math.random() * (850 - 300 + 1)) + 300,
      risk_band: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
      enquiries_6m: Math.floor(Math.random() * 6),
      defaults: Math.floor(Math.random() * 3),
      open_loans: Math.floor(Math.random() * 5),
      trade_lines: Array.from(
        { length: Math.floor(Math.random() * 5) },
        (_, i) => ({
          id: i + 1,
          type: ['Credit Card', 'Mortgage', 'Personal Loan'][
            Math.floor(Math.random() * 3)
          ],
          status: ['Open', 'Closed'][Math.floor(Math.random() * 2)],
          balance: Math.floor(Math.random() * 20000),
        }),
      ),
    };
  }

  // check credit info for a user
  async checkCredit(userId: string): Promise<CreditReportData> {
    let data: CreditReportData;

    try {
      data = await this.callCreditBureauApi<CreditReportData>(
        'https://mock-bureau.test/v1/credit/check',
        {
          method: 'POST',
          headers: {
            'X-API-KEY': config.CREDIT_API_KEY,
            'Content-Type': 'application/json',
          },
          data: { userId },
        },
      );
    } catch (error) {
      console.warn(
        'Mock bureau API unavailable, using fallback.',
        error.message,
      );
      data = this.generateRandomCreditData();
    }

    // save result once
    await this.prismaService.report.create({
      data: {
        userId,
        score: data.score,
        riskBand: data.risk_band,
        enquiries6m: data.enquiries_6m,
        defaults: data.defaults,
        openLoans: data.open_loans,
        tradelines: JSON.stringify(data.trade_lines),
      },
    });

    return data;
  }
}
