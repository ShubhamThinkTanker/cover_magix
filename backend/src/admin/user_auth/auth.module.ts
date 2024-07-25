// user-auth.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthController } from './auth.controller';
import { UserAuthService } from './auth.service';
import { User } from './auth.schema';
import { User_Address } from './userAddress.schema';


@Module({
  imports: [
    SequelizeModule.forFeature([User, User_Address]), // Register the User model with SequelizeModule
    PassportModule,
    JwtModule.register({
      secret: 'secretKey', // Replace with a secure key
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserAuthService],
  controllers: [UserAuthController],
})
export class UserAuthModule {}

