import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { AuthDto, ChangePasswordDto } from './auth.dto';
import { ApiResponse, config } from 'src/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(dto: AuthDto): Promise<ApiResponse> {
    // check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // create new user
    await this.prismaService.user.create({
      data: {
        email: dto.email,
        password: await bcrypt.hash(dto.password, 12),
        role: 'USER',
      },
    });

    return {
      message: 'User registered successfully',
    };
  }

  async login(dto: AuthDto): Promise<ApiResponse> {
    // check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // verify user password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // create and sign access token
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(jwtPayload, {
      secret: config.JWT_SECRET,
    });

    return {
      message: 'Login successful',
      data: {
        access_token: token,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<ApiResponse> {
    // check if user exists
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // verify old pasword is corect
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // hash and save new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12),
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {password: newPasswordHash},
    });

    return {
        message:"Password changed successfully"
    }
  }
}
