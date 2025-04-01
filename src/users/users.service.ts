import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    this.logger.log(`Creating user with email: ${dto.email}`);
    return this.userModel.create(dto);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    this.logger.log(`Finding user by ID: ${id}`);
    return this.userModel.findById(id).select('-password').exec();
  }
}