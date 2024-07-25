"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("./auth.schema");
const sequelize_2 = require("sequelize");
const password_service_1 = require("../../../Helper/password.service");
const dateFormat_1 = require("../../../Helper/dateFormat");
const userAddress_schema_1 = require("./userAddress.schema");
let UserAuthService = exports.UserAuthService = class UserAuthService {
    constructor(userModel, userAddressModel) {
        this.userModel = userModel;
        this.userAddressModel = userAddressModel;
    }
    async is_exist_email(reqbody) {
        try {
            const { email } = reqbody;
            const user = await this.userModel.findOne({
                where: { email: email.trim() },
                attributes: ['id', 'email', 'password_hash', 'first_name', 'last_name'],
                raw: true,
                nest: true,
            });
            return user;
        }
        catch (error) {
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
            if (user_update_token[0] === 0) {
                return false;
            }
            return true;
        }
        catch (error) {
            console.log('error---------', error);
            throw error;
        }
    }
    async is_exist_user_reset_token(token) {
        try {
            const is_exist_user_token = await this.userModel.findOne({
                where: {
                    api_token: token,
                    api_token_expires: { [sequelize_2.Op.gte]: new Date() }
                }
            });
            if (!is_exist_user_token) {
                return false;
            }
            return is_exist_user_token;
        }
        catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }
    async allUserList(reqbody) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { product_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
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
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
            }));
            return {
                totalRecords: count,
                address_listing: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }
    async user_password_reset(reqbody) {
        try {
            const hashpassword = await password_service_1.PasswordService.hashPassword(reqbody.password);
            const update_user_password_reset = {
                password_hash: hashpassword,
                api_token: '',
                updated_at: new Date(),
            };
            const reset_password = await this.userModel.update(update_user_password_reset, {
                where: {
                    api_token: reqbody.token
                }
            });
            if (reset_password[0] === 0) {
                return false;
            }
            return true;
        }
        catch (error) {
            console.log('error---------', error);
            throw error;
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
                updated_at: new Date(),
            };
            const update_profile = await this.userModel.update(update_user_profile, {
                where: {
                    email: reqbody.email
                }
            });
            if (update_profile[0] === 0) {
                return false;
            }
            return true;
        }
        catch (error) {
            console.log('error---------', error);
            throw error;
        }
    }
    async create(user) {
        console.log('UsersService: create called with user:', user);
        const newUser = new this.userModel(user);
        const savedUser = await newUser.save();
        console.log('Saved user:', savedUser);
        return savedUser;
    }
    async findOneByEmail(email) {
        console.log('UsersService: findOneByEmail called with email:', email);
        const user = await this.userModel.findOne({ where: { email } });
        console.log('Found user by email:', user);
        return user;
    }
    async findOrCreate(user) {
        let foundUser = await this.userModel.findOne({ where: { googleId: user.googleId } });
        if (!foundUser) {
            foundUser = await this.userModel.create({
                googleId: user.googleId,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            });
        }
        return foundUser;
    }
    async findOrCreateForFacebook(user) {
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
    async addUserAddress(reqBody) {
        try {
            const { user_id, street_address, city, state, zip, country } = reqBody;
            const userAddress = await this.userAddressModel.create({
                user_id, street_address, city, state, zip, country
            });
            return userAddress;
        }
        catch (error) {
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
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (filter_value) {
                whereClause[sequelize_2.Op.or] = [
                    { product_name: { [sequelize_2.Op.like]: `%${filter_value}%` } },
                ];
            }
            const { count, rows } = await this.userAddressModel.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: auth_schema_1.User,
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
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at)),
            }));
            return {
                totalRecords: count,
                users: modifiedRows,
            };
        }
        catch (error) {
            console.log('Error:', error);
            throw error;
        }
    }
};
exports.UserAuthService = UserAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(auth_schema_1.User)),
    __param(1, (0, sequelize_1.InjectModel)(userAddress_schema_1.User_Address)),
    __metadata("design:paramtypes", [Object, Object])
], UserAuthService);
//# sourceMappingURL=auth.service.js.map