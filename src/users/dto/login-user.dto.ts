import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;
}