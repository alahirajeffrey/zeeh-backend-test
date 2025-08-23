import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards';
import { StatementService } from './statement.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('statements')
export class StatementController {
  constructor(private readonly statementService: StatementService) {}

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse csv file' })
  async uploadStatement(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.statementService.uploadStatement(file, req.user.userId);
  }
}
