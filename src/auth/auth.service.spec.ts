import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should return a JWT on successful signup', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: 'Password123!' };

      (usersService.create as jest.Mock).mockResolvedValue({ _id: 'user123' });

      const result: any = await authService.signup(dto);

      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: dto.email,
        name: dto.name,
      }));
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw ConflictException on duplicate email', async () => {
      const dto = { email: 'exists@example.com', name: 'Test', password: 'Password123!' };
      const error = { code: 11000 };

      (usersService.create as jest.Mock).mockRejectedValue(error);

      await expect(authService.signup(dto)).rejects.toThrowError('Email already exists');
    });

    it('should throw BadRequestException on unknown error', async () => {
      const dto = { email: 'fail@example.com', name: 'Test', password: 'Password123!' };
      const error = new Error('Unknown error');

      (usersService.create as jest.Mock).mockRejectedValue(error);

      await expect(authService.signup(dto)).rejects.toThrowError('Unable to sign up user');
    });
  });


  describe('signin', () => {
    it('should return a token on valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      const hash = await bcrypt.hash(dto.password, 10);

      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'user123',
        password: hash,
      });

      const token = await authService.signin(dto);
      expect(token).toBe('mock-jwt-token');
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.signin({ email: 'missing@example.com', password: 'pass' }),
      ).rejects.toThrowError('Invalid email address');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpass' };
      const hash = await bcrypt.hash('correctpass', 10);

      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'user123',
        password: hash,
      });

      await expect(authService.signin(dto)).rejects.toThrowError('Invalid email password');
    });
  });

});
