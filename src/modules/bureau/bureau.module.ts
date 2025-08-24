import { Module } from '@nestjs/common';
import { BureauController } from './bureau.controller';
import { BureauService } from './bureau.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [BureauController],
  providers: [BureauService, PrismaService],
})
export class BureauModule {}
