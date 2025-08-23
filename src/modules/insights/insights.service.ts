import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse } from 'src/common';
import { PrismaService } from 'src/prisma.service';
import { subMonths } from 'date-fns';

@Injectable()
export class InsightsService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchInsigtById(
    userId: string,
    insightId: string,
  ): Promise<ApiResponse> {
    const insight = await this.prismaService.insight.findFirst({
      where: { id: insightId, userId: userId },
    });

    if (!insight) {
      throw new NotFoundException('Insight not found');
    }

    return { message: 'Insight fetched successfully', data: insight };
  }

  async generateInsight(userId: string): Promise<ApiResponse> {
    const threeMonthsAgo = subMonths(new Date(), 3);

    // fetch transactions for last 3 months
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        statement: {
          userId,
        },
        date: { gte: threeMonthsAgo },
      },
    });

    if (!transactions.length) {
      throw new Error('No transactions found for user');
    }

    // sort inflows and outflows
    const inflows = transactions.filter((t) => t.isInflow);
    const outflows = transactions.filter((t) => !t.isInflow);

    const totalInflow = inflows.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalOutflow = outflows.reduce((sum, t) => sum + Number(t.amount), 0);

    // calculate average monthly income (over 3 months)
    const avgIncome = totalInflow / 3;

    // calculate net amount
    const net = totalInflow - Math.abs(totalOutflow);

    // calculate buckets
    const buckets = transactions.map((transaction) => transaction.description);
    const bucketSet = new Set(buckets);

    // risk flags
    let riskFlags = 0;
    // add risk flag when expenditure is greater than average income
    transactions.map((transaction) => {
      if (
        !transaction.isInflow &&
        Math.abs(transaction.amount.toNumber()) > Number(avgIncome)
      ) {
        riskFlags++;
      }
    });

    // Save insight
    const insight = await this.prismaService.insight.create({
      data: {
        userId,
        averageIncome: Math.round(avgIncome),
        inflow: Math.round(totalInflow),
        outFlow: Math.round(totalOutflow),
        netIncome: Math.round(net),
        spendBuckets: bucketSet.size,
        riskFlags,
      },
    });

    return {
      message: 'Insight generated successfully',
      data: insight,
    };
  }
}
