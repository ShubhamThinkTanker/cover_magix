import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './auth.schema';
import { Op } from 'sequelize';
import { PasswordService } from 'Helper/password.service';

@Injectable()
export class AuthService {
  constructor(@InjectModel(Admin) private adminModel: typeof Admin) {}
 

  async is_exist_email(reqbody: { email: string }) {
    try {
      const { email } = reqbody;

      const admin = await this.adminModel.findOne({
        where: { email: email.trim() },
        attributes: ['id', 'email', 'password_hash', 'first_name', 'last_name'],
        raw: true,
        nest: true,
      });

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async updateResetTokenValuesForForgotPassword(token_data, reqbody) {
    try {
      console.log(token_data, ':token_data');
      const user_update_token = await this.adminModel.update(token_data, {
        where: {
          email: reqbody.email.trim(),
        },
      });

      // Check if any rows were affected (updated)
      if (user_update_token[0] === 0) {
        return false; // Return false if no rows were updated
      }

      return true; // Return true if at least one row was updated
    } catch (error) {
      console.log('error---------', error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  }

  async is_exist_admin_reset_token(token) {
    try {
      const is_exist_user_token = await this.adminModel.findOne({
        where: {
          api_token: token,
          api_token_expires: { [Op.gte]: new Date() }
        }
      });
  
      if (!is_exist_user_token) {
        return false;
      }
      return is_exist_user_token;
    } catch (error) {
      console.log('Error:', error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  }
  

  async admin_password_reset(reqbody) {
    try {
      const hashpassword: string = await PasswordService.hashPassword(reqbody.password);

  
      const update_user_password_reset = {
        password_hash: hashpassword,
        api_token : '',
        updated_at: new Date(), // Use new Date() to get the current timestamp
      };
  
      const reset_password = await this.adminModel.update(
        update_user_password_reset,
        {
          where: {
            api_token: reqbody.token
          }
        }
      );
  
      // Check if any rows were affected (updated)
      if (reset_password[0] === 0) {
        return false; // Return false if no rows were updated
      }
  
      return true; // Return true if at least one row was updated
    } catch (error) {
      console.log('error---------', error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  }

  async updateAdminProfile(reqbody) {
    try {
      const updateAdminProfile = {
        email: reqbody.email,
        first_name: reqbody.first_name,
        last_name: reqbody.last_name,
        updated_at: new Date(), // Use new Date() to get the current timestamp
      };

      const adminprofile = await this.adminModel.update(
        updateAdminProfile,
        {
          where: {
            email: reqbody.email
          }
        }
      );

      // Check if any rows were affected (updated)
      if (adminprofile[0] === 0) {
        return false; // Return false if no rows were updated 
      }

      return true; // Return true if at least one row was updated
    } catch (error) {
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  }
  
}
