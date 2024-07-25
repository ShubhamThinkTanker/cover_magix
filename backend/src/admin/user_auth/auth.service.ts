import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './auth.schema';
import { Op, Sequelize } from 'sequelize';
import { Order } from 'sequelize';
import { PasswordService } from 'Helper/password.service';
import { formatTimestamp } from 'Helper/dateFormat';
import { User_Address } from './userAddress.schema';
@Injectable()
export class UserAuthService {
  constructor(@InjectModel(User) private userModel: typeof User,
    @InjectModel(User_Address) private userAddressModel: typeof User_Address,
  ) { }


  async is_exist_email(reqbody: { email: string }) {
    try {
      const { email } = reqbody;

      const user = await this.userModel.findOne({
        where: { email: email.trim() },
        attributes: ['id', 'email', 'password_hash', 'first_name', 'last_name'],
        raw: true,
        nest: true,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateResetTokenValuesForForgotPassword(token_data, reqbody) {
    try {
      console.log(token_data, ':token_data');
      const user_update_token = await this.userModel.update(token_data, {
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

  async is_exist_user_reset_token(token) {
    try {
      const is_exist_user_token = await this.userModel.findOne({
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

  async allUserList(reqbody) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      // Define whereClause with an index signature to allow dynamic properties
      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      if (filter_value) {
        whereClause[Op.or] = [
          { product_name: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await this.userModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'email',
          'first_name',
          'last_name',
          'company',
          'mobile_no',
          'created_at',
          'updated_at'
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
      }));

      return {
        totalRecords: count,
        address_listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }

  async user_password_reset(reqbody) {
    try {
      const hashpassword: string = await PasswordService.hashPassword(reqbody.password);


      const update_user_password_reset = {
        password_hash: hashpassword,
        api_token: '',
        updated_at: new Date(), // Use new Date() to get the current timestamp
      };

      const reset_password = await this.userModel.update(
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


  async update_user_profile(reqbody) {
    try {
      const update_user_profile = {
        email: reqbody.email,
        first_name: reqbody.first_name,
        last_name: reqbody.last_name,
        mobile_no: reqbody.mobile_no,
        country: reqbody.country,
        updated_at: new Date(), // Use new Date() to get the current timestamp
      };

      const update_profile = await this.userModel.update(
        update_user_profile,
        {
          where: {
            email: reqbody.email
          }
        }
      );

      // Check if any rows were affected (updated)
      if (update_profile[0] === 0) {
        return false; // Return false if no rows were updated 
      }

      return true; // Return true if at least one row was updated
    } catch (error) {
      console.log('error---------', error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  }

  async create(user: Partial<User>): Promise<User> {
    console.log('UsersService: create called with user:', user);
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();
    console.log('Saved user:', savedUser);
    return savedUser;
  }

  async findOneByEmail(email: string): Promise<User> {
    console.log('UsersService: findOneByEmail called with email:', email);
    const user = await this.userModel.findOne({ where: { email } });
    console.log('Found user by email:', user);
    return user;
  }

  async findOrCreate(user: Partial<User>): Promise<User> {
    let foundUser = await this.userModel.findOne({ where: { googleId: user.googleId } });
    if (!foundUser) {
      foundUser = await this.userModel.create({
        googleId: user.googleId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
      //console.log('Created new user:', foundUser);
    }
    return foundUser;
  }

  async findOrCreateForFacebook(user: Partial<User>): Promise<User> {
    let foundUser = await this.userModel.findOne({ where: { facebookId: user.facebookId } });
    if (!foundUser) {
      foundUser = await this.userModel.create({
        facebookId: user.facebookId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
      console.log('Created new user:', foundUser);
    }
    return foundUser;
  }

  // User Address

  async addUserAddress(reqBody) {
    try {
      const { user_id, street_address, city, state, zip, country } = reqBody;
      const userAddress = await this.userAddressModel.create({
        user_id, street_address, city, state, zip, country
      });
      return userAddress;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async userAddressList(reqbody) {
    try {
      let order_column = reqbody.order_column || 'state';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      // Define whereClause with an index signature to allow dynamic properties
      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      if (filter_value) {
        whereClause[Op.or] = [
          { product_name: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await this.userAddressModel.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: true,
          }
        ],
        attributes: [
          'id',
          'user_id',
          'street_address',
          'city',
          'state',
          'zip',
          'country',
          'created_at',
          'updated_at'
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
      }));

      return {
        totalRecords: count,
        users: modifiedRows,
      };
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }

}
