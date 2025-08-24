import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { config } from 'src/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    authService = new AuthService(prismaService, jwtService);
  });

  describe('registerUser', () => {
    it('should throw if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@test.com',
      } as any);

      await expect(
        authService.registerUser({ email: 'a@test.com', password: 'secret' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return success message', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPass');
      prismaService.user.create.mockResolvedValue({ id: '1' } as any);

      const result = await authService.registerUser({
        email: 'a@test.com',
        password: 'secret',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'a@test.com',
            password: 'hashedPass',
          }),
        }),
      );
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notfound@test.com', password: 'pw' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@test.com',
        password: 'hashed',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'a@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@test.com',
        role: 'USER',
        password: 'hashed',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signedToken');

      const result = await authService.login({
        email: 'a@test.com',
        password: 'pw',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '1',
          email: 'a@test.com',
          role: 'USER',
        }),
        { secret: config.JWT_SECRET },
      );
      expect(result).toEqual({
        message: 'Login successful',
        data: { access_token: 'signedToken' },
      });
    });
  });

  describe('changePassword', () => {
    it('should throw if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.changePassword('123', {
          oldPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if old password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        password: 'hashed',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword('1', {
          oldPassword: 'wrong',
          newPassword: 'newpw',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and return success message', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: '1',
        password: 'hashed',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await authService.changePassword('1', {
        oldPassword: 'oldpw',
        newPassword: 'newpw',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpw', 12);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: { password: 'newHashed' },
        }),
      );
      expect(result).toEqual({ message: 'Password changed successfully' });
    });
  });
});
