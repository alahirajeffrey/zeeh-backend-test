import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from 'src/prisma.service';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TerminusModule, JwtModule.register({})],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
