import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { InsightsService } from './insights.service';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Fetch insight via id' })
  @Get(':insightId')
  async fetchInsigtById(@Param('insightId') insightId: string, @Req() req) {
    return await this.insightsService.fetchInsigtById(
      req.user.userId,
      insightId,
    );
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Generate insights ' })
  @Post('run')
  async createInsight(@Req() req) {
    return this.insightsService.generateInsight(req.user.userId);
  }
}
