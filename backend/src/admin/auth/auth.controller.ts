import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  LoginSuccess,
  Success,
} from '../../../Helper/commonResponse';
import { ValidateAdminLogin } from './validation/admin.login.validation';
import { ValidateAdminForgotPasswordInput } from './validation/admin.forgotPassword.validation';
import { ValidateAdminResetPasswordInput } from './validation/admin.resetPassword.validation';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { PasswordService } from '../../../Helper/password.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

@Controller('admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  static passwordService = new PasswordService();

  @Post('login')
  async adminLogin(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;

      // Validate request body
      const adminLoginErrors = new ValidateAdminLogin();
      adminLoginErrors.email = email?.trim();
      adminLoginErrors.password = password;
      const validationErrors = await validate(adminLoginErrors);

      if (validationErrors.length > 0) {
        const errors = validationErrors.reduce((acc, error) => {
          acc[error.property] = Object.values(error.constraints)[0];
          return acc;
        }, {});
        return new CustomErrorResponse(res, 422, 'Validation error', errors);
      }

      // Check if admin with the provided email exists
      const isAdminExist = await this.authService.is_exist_email({ email });
      if (!isAdminExist) {
        return new CustomErrorResponse(res, 422, 'Invalid credentials', {
          email: 'Email does not exist',
        });
      }

      // Check if the provided password matches the hashed password in the database
      const passwordMatch =
        await AuthController.passwordService.comparePasswords(
          password,
          isAdminExist.password_hash,
        );
      if (!passwordMatch) {
        return new CustomErrorResponse(res, 422, 'Invalid credentials', {
          password: 'Incorrect password',
        });
      }

      // Generate access token

      const payload = {
        id: isAdminExist.id,
        email: isAdminExist.email,
        first_name: isAdminExist.first_name,
        last_name: isAdminExist.last_name,
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
              'Successfully Admin Login',
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

  @Post('forgot_password')
  async adminForgotPassword(@Req() req: any, @Res() res: Response) {
    let errors = {};

    let admin_forgot_password_error = new ValidateAdminForgotPasswordInput();
    admin_forgot_password_error.email = req.body.email?.trim();

    const validation_errors = await validate(admin_forgot_password_error);
    if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
      validation_errors.map((error) => {
        errors[error['property']] = Object.values(error.constraints)[0];
      });

      return new CustomErrorResponse(res, 422, 'Something went wrong', errors);
    }

    let is_admin_exist = await this.authService.is_exist_email(req.body);

    if (!is_admin_exist) {
      return new CustomResponse(
        res,
        400,
        'User does not found',
        'Something went wrong',
      );
    }

    const token_fun = async (data) => {
      var token_data = {
        api_token: data,
        api_token_expires: new Date().getTime() + 3 * 60 * 1000,
        updated_at: Date.now(),
      };

      let updateAdminForgotPassword =
        await this.authService.updateResetTokenValuesForForgotPassword(
          token_data,
          req.body,
        );

      if (updateAdminForgotPassword) {
        let link = 'http://localhost:3000/' + 'admin/reset-password/' + data;
        const mail_option = {
          filename: 'reset_password',
          data: link,
          subject: 'Reset Your Password',
          user: {
            email: req.body.email,
          },
        };

        // let send_mail = await this.emailService.sendMail(mail_option);

        return new Success(
          res,
          200,
          updateAdminForgotPassword,
          'Password reset link is sent to your registered email id',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          updateAdminForgotPassword,
          'Something went wrong',
        );
      }
    };

    crypto.randomBytes(20, (err, buffer) => {
      var token = buffer.toString('hex');
      token_fun(token);
    });
  }

  @Post('reset_password')
  async adminResetPassword(@Req() req: any, @Res() res: Response) {
    let errors = {};

    let admin_reset_password_error = new ValidateAdminResetPasswordInput();

    admin_reset_password_error.token = req.body.token?.trim();
    admin_reset_password_error.password = req.body.password?.trim();
    admin_reset_password_error.confirm_password =
      req.body.confirm_password?.trim();

    const validation_errors = await validate(admin_reset_password_error);

    if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
      validation_errors.map((error) => {
        errors[error['property']] = Object.values(error.constraints)[0];
      });

      return new CustomErrorResponse(res, 422, 'Something went wrong', errors);
    }

    let is_exist_user_with_reset_token =
      await this.authService.is_exist_admin_reset_token(req.body.token);

    if (is_exist_user_with_reset_token) {
      let user_password_reset = await this.authService.admin_password_reset(
        req.body,
      );

      if (user_password_reset) {
        return new Success(
          res,
          200,
          user_password_reset,
          'Your Password Successfully Changed',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          user_password_reset,
          'Something went wrong, Please try again',
        );
      }
    } else {
      var error: any = {};
      error.token = 'Token is invalid or has expired.';
      return new CustomResponse(res, 400, error, 'Something went wrong');
    }
  }

  @Post('profile')
  async updateAdminProfile(@Req() req: any, @Res() res: Response) {
    try {
      const is_admin_exist = await this.authService.is_exist_email(req.body);
      if (!is_admin_exist) {
        return new CustomResponse(
          res,
          400,
          'admin does not found',
          'Something went wrong',
        );
      }
      const isUpdated = await this.authService.updateAdminProfile(req.body);
      if (!isUpdated) {
        return new CustomResponse(
          res,
          400,  
          'Admin does not found',
          'Something went wrong',
        ); 
      }
      return new Success(
        res,
        200,
        isUpdated,
        'Profile updated successfully',
      );
    } catch (error) {
      throw new Error("this email is not available")
    }
  }
  
  catch(error) {
    console.log('Create User -> ', error);

    // return new CustomCatchBlockErrorMessage(res, 400, error.toString(), 'Something went wrong');
  }
}
