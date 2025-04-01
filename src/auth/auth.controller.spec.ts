import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      signup: jest.fn(),
      signin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should sign up a user and return a token', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: 'Password123!' };
      const mockResponse = {
        message: 'User signed up successfully',
        success: true,
        data: { token: 'mock-jwt-token' },
        statusCode: 201,
      };
      (authService.signup as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.signup(dto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = { email: 'exists@example.com', name: 'Test', password: 'Password123!' };
      (authService.signup as jest.Mock).mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    it('should sign in a user and return a token', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      const mockToken = 'mock-jwt-token';

      (authService.signin as jest.Mock).mockResolvedValue(mockToken);

      const result = await controller.signin(dto);

      expect(result).toEqual({ token: mockToken });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto = { email: 'wrong@example.com', password: 'wrong' };
      (authService.signin as jest.Mock).mockResolvedValue(null);

      await expect(controller.signin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
