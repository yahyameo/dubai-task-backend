import { BadRequestException, Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    
    private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in user full profile' })
  async getProfile(@Req() req: any) {
    try {
        const userId = req.user.userId;
        console.log("userId",userId)
        this.logger.log(`Fetching profile for user ID: ${userId}`);
        return await this.usersService.findById(userId);
    } catch (error) {
        throw new BadRequestException();
    }
  }
}