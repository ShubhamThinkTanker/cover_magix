import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'; // Import SequelizeModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Admin } from './auth.schema'; // Import the Admin model

@Module({
  imports: [
    SequelizeModule.forFeature([Admin]), // Register the Admin model with SequelizeModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
