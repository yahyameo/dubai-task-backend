import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @MinLength(8)
    @Matches(/[a-zA-Z]/)
    @Matches(/\d/)
    @Matches(/[^a-zA-Z0-9]/)
    password: string;
}