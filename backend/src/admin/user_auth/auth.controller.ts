import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  ValidationPipe,
  Put,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from './auth.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  LoginSuccess,
  Success,
} from '../../../Helper/commonResponse';
import { ValidateUserRegister } from './validation/user.register.validation';
import { ValidateUserLogin } from './validation/user.login.validation';
import { ValidateUserForgotPasswordInput } from './validation/user.forgotPassword.validation';
import { ValidateUserResetPasswordInput } from './validation/user.resetPassword.validation';
import { ValidateUserEditProfile } from './validation/admin.editProfile.validation'
import { User } from './auth.schema';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { PasswordService } from '../../../Helper/password.service';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { AuthGuard } from '@nestjs/passport';
import { GoogleStrategy } from 'Helper/passportConfig';
config();

@Controller('auth')
export class UserAuthController {
  constructor(
    private readonly authService: UserAuthService,
  ) { }

  static passwordService = new PasswordService();

  @Post('login')
  async userLogin(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;
      console.log(email, password)

      // Validate request body
      const userLoginErrors = new ValidateUserLogin();
      userLoginErrors.email = email?.trim();
      userLoginErrors.password = password;
      const validationErrors = await validate(userLoginErrors);

      if (validationErrors.length > 0) {
        const errors = validationErrors.reduce((acc, error) => {
          acc[error.property] = Object.values(error.constraints)[0];
          return acc;
        }, {});
        return new CustomErrorResponse(res, 422, 'Validation error', errors);
      }

      // Check if user with the provided email exists
      const isUserExist = await this.authService.is_exist_email({ email });
      if (!isUserExist) {
        return new CustomErrorResponse(res, 422, 'Invalid credentials', {
          email: 'Email does not exist',
        });
      }

      // Check if the provided password matches the hashed password in the database
      const passwordMatch =
        await UserAuthController.passwordService.comparePasswords(
          password,
          isUserExist.password_hash,
        );
      if (!passwordMatch) {
        return new CustomErrorResponse(res, 422, 'Invalid credentials', {
          password: 'Incorrect password',
        });
      }

      // Generate access token

      const payload = {
        id: isUserExist.id,
        email: isUserExist.email,
        first_name: isUserExist.first_name,
        last_name: isUserExist.last_name,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '8h' },
        (err, token) => {
          if (err) {
            // Handle error if signing fails
            return new CustomErrorResponse(
              res,
              500,
              'Token generation failed',
              { error: err.message },
            );
          } else {
            // Send the response with the token
            return new Success(
              res,
              200,
              { user_detail: payload, token: 'Bearer ' + token },
              'Successfully User Login',
            );
          }
        },
      );

      // return res.json({ access_token: accessToken });
    } catch (error) {
      console.error('Error:', error);
      return new CustomErrorResponse(res, 500, 'Internal server error', {
        message: 'Something went wrong',
      });
    }
  }

  @Post('register')
  async userRegister(@Req() req: any, @Res() res: Response) {
    try {
      const { email, password, first_name, last_name, mobile_no, company } = req.body;
      console.log(email, password)

      // Validate request body
      const userRegisterErrors = new ValidateUserRegister();
      userRegisterErrors.first_name = first_name?.trim();
      userRegisterErrors.last_name = last_name?.trim();
      userRegisterErrors.email = email?.trim();
      userRegisterErrors.password = password;
      userRegisterErrors.mobile_no = mobile_no?.trim();
      userRegisterErrors.company = company?.trim();

      const validationErrors = await validate(userRegisterErrors);

      if (validationErrors.length > 0) {
        const errors = validationErrors.reduce((acc, error) => {
          acc[error.property] = Object.values(error.constraints)[0]
          return acc;
        }, {})
        return new CustomErrorResponse(res, 422, 'Validation error', errors);
      }

      // Check if user with provided email exists
      const isUserExist = await this.authService.is_exist_email({ email })
      if (isUserExist) {
        return new CustomErrorResponse(res, 422, 'Invalid credentials', {
          email: 'Email already exist'
        })
      }

      const hashed_password = await PasswordService.hashPassword(password)


      // Create new user
      const newUser = await User.create({
        email,
        password_hash: hashed_password,
        first_name,
        last_name,
        mobile_no,
        company
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('list')
  async getAllUserList(@Req() req: any, @Res() res: Response) {
    try {
      const userList = await this.authService.allUserList(req.body);
      if (userList) {
        return new Success(
          res,
          200,
          userList,
          '🎉 All Users Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          {},
          'No User Found',
        );
      }
    } catch (error) {
      console.log('Error fetching user addresses -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Put('edit_profile')
  async userEditProfile(@Req() req: any, @Res() res: Response) {

    let errors = {};
    console.log(req.user)
    console.log(req.body)

    let user_edit_profile_error = new ValidateUserEditProfile();
    user_edit_profile_error.email = req.body.email?.trim();
    user_edit_profile_error.first_name = req.body.first_name?.trim();
    user_edit_profile_error.last_name = req.body.last_name?.trim();
    user_edit_profile_error.mobile_no = req.body.mobile_no?.trim();
    user_edit_profile_error.company = req.body.company?.trim();


    const validation_errors = await validate(user_edit_profile_error);
    if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
      validation_errors.map((error) => {
        errors[error['property']] = Object.values(error.constraints)[0];
      });

      return new CustomErrorResponse(res, 422, 'Something went wrong', errors);
    }
    const is_user_exist = await this.authService.is_exist_email(req.body);
    if (!is_user_exist) {
      return new CustomResponse(
        res,
        400,
        'User does not found',
        'Something went wrong',
      );
    }
    const updated_user = await this.authService.update_user_profile(
      req.body,
    );
    if (!updated_user) {
      return new CustomResponse(
        res,
        400,
        'User does not found',
        'Something went wrong',
      );
    }
    return new Success(
      res,
      200,
      updated_user,
      'Profile updated successfully',
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const user = await this.authService.findOrCreate(req.user.user);
    return user;
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req) { }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req) {
    const user = await this.authService.findOrCreateForFacebook(req.user.user);
    console.log(user, "users>>>>>>>>>>>>>>>>.")
    return user;
  }

  //User address 

  @Post('address')
  async addUserAddress(@Req() req: any, @Res() res: Response) {
    try {
      const { user_id, street_address, city, state, zip, country } = req.body;

      if (!user_id) {
        return res.status(404).json({ message: 'User not found' });
      }

      const addAddress = await this.authService.addUserAddress({
        user_id, street_address, city, state, zip, country
      })

      return res.status(201).json({
        message: 'User Address Added Successfully',
        user: addAddress
      });

    } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('address/list')
  async getUserAddressList(@Req() req: any, @Res() res: Response) {
    try {
      const userAddress = await this.authService.userAddressList(req.body);
      if (userAddress) {
        return new Success(
          res,
          200,
          userAddress,
          '🎉 All Address Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          {},
          'No Address Found',
        );
      }
    } catch (error) {
      console.log('Error fetching user addresses -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

}