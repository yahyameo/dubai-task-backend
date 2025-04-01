import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CustomMessage } from '../utils/decorator/custom-message.decorator';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Controller('auth')
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) { }

    @CustomMessage("User account has been created successfully")
    @Post('signup')
    async signup(@Body() dto: CreateUserDto) {
        this.logger.log(`Signup attempt for email: ${dto.email}`);
        return this.authService.signup(dto);
    }

    @CustomMessage("User logged in successfully")
    @Post('signin')
    async signin(@Body() dto: LoginUserDto) {
        this.logger.log(`Signin attempt for email: ${dto.email}`);
        const token = await this.authService.signin(dto);
        if (!token) throw new UnauthorizedException('Invalid credentials');

        this.logger.log(`User signed in: ${dto.email}`);

        return { token };
    }
}