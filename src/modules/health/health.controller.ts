import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma.service';
import { JwtGuard, RolesGuard } from '../auth/guards';
import { Role, Roles } from 'src/common';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.Admin)
@ApiSecurity('JWT-auth')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health Check' })
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      },
    ]);
  }
}
