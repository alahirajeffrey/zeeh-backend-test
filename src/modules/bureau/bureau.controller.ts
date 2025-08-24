import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards';
import { BureauService } from './bureau.service';

@Controller('bureau')
export class BureauController {
  constructor(private readonly bureauService: BureauService) {}

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Check user credit information' })
  @Post('check')
  async checkCredit(@Req() req) {
    return this.bureauService.checkCredit(req.user.userId);
  }
}
