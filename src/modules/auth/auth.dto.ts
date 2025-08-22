import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(8, {
    message:
      'Password is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(20, {
    message:
      'password is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,20}$/, {
    message:
      'password must contain the following: a capital letter, a small letter, and a number',
  })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @ApiProperty()
  @MinLength(8, {
    message:
      'Password is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(20, {
    message:
      'password is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,20}$/, {
    message:
      'password must contain the following: a capital letter, a small letter, and a number',
  })
  newPassword: string;
}
