// src/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    })
      // Disable actual auth guard for testing
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: 'mock-user-id' }; // simulate token payload
          return true;
        },
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const mockUser = {
        _id: 'mock-user-id',
        name: 'John Doe',
        email: 'john@example.com',
      };
    
    
      const req = { user: { userId: 'mock-user-id' } };
      const result = await controller.getProfile(req);  
      expect(result).toEqual(mockUser);
    });
  
  });
});
