import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common';
import { parse } from 'csv-parse';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatementService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadStatement(
    file: Express.Multer.File,
    userId: string,
  ): Promise<ApiResponse> {
    // check if file is provided and is a CSV
    if (!file || !file.mimetype.includes('csv')) {
      throw new BadRequestException('No file or incorrect file type provided');
    }

    // parse CSV file
    const records: any[] = await new Promise((resolve, reject) => {
      const parsed: any[] = [];

      parse(file.buffer, {
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
        .on('data', (row) => {
          parsed.push(row);
        })
        .on('end', () => {
          resolve(parsed);
        })
        .on('error', (err) => {
          reject(err);
        });
    });

    // run queries in prisma transaction
    await this.prismaService.$transaction(async (tx) => {
      // save statement details
      const statementDetails = await tx.statement.create({
        data: {
          userId,
          fileName: file.originalname,
        },
      });

      // create transactions
      for (const row of records) {
        const { date, description, amount, balance } = row;

        await tx.transaction.create({
          data: {
            statementId: statementDetails.id,
            date: new Date(date),
            description,
            amount: parseFloat(amount),
            balance: parseFloat(balance),
            isInflow: parseFloat(amount) > 0,
          },
        });
      }
    });

    return {
      message: 'Statement uploaded successfully!',
    };
  }
}
