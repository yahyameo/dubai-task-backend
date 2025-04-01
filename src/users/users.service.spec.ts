import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Partial<Record<keyof Model<User>, jest.Mock>>;

  beforeEach(async () => {
    userModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: 'hashedPass' };
      const mockUser = { _id: 'user123', ...dto };
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(dto);
      expect(userModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      (userModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find a user by ID and exclude password', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findById('user123');
      expect(userModel.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });
  });
});
