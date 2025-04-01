import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signup(dto: CreateUserDto) {
        try {
            const hash = await bcrypt.hash(dto.password, 10);
            const user = await this.usersService.create({ ...dto, password: hash });
            const token = this.jwtService.sign({ sub: user._id.toString() });
            this.logger.log(`User created: ${dto.email}`);
            return { token };
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn(`Email already exists: ${dto.email}`);
                throw new ConflictException({
                    message: 'Email already exists',
                    error: 'Conflict',
                    statusCode: 409,
                });
            }

            this.logger.error(`Signup failed for ${dto.email}`, error.stack);
            throw new BadRequestException({
                message: 'Unable to sign up user',
                error: 'Bad Request',
                statusCode: 400,
            });
        }
    }

    async signin(dto: LoginUserDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            this.logger.warn(`User not found: ${dto.email}`);
            throw new NotFoundException("Invalid email address");
        }
        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) {
            this.logger.warn(`Invalid password for: ${dto.email}`);
            throw new NotFoundException("Invalid email password");
        }

        try {
            this.logger.log(`User authenticated: ${dto.email}`);
            return this.jwtService.sign({ sub: user._id.toString() });
        }
        catch (error) {
            throw new BadRequestException();
        }
    }
}