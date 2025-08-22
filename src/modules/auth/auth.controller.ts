import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthDto, ChangePasswordDto } from './auth.dto';
import { JwtGuard } from './guards';

@Controller('auth')
@ApiTags('auth-endpoints')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  async registerUser(@Body() dto: AuthDto) {
    return this.authService.registerUser(dto);
  }

  @HttpCode(200)
  @Post('/login')
  @ApiOperation({ summary: 'Login a  user' })
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Patch('/change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(req.user.userId, dto);
  }
}
