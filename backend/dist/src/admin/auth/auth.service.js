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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("./auth.schema");
const sequelize_2 = require("sequelize");
const password_service_1 = require("../../../Helper/password.service");
let AuthService = exports.AuthService = class AuthService {
    constructor(adminModel) {
        this.adminModel = adminModel;
    }
    async is_exist_email(reqbody) {
        try {
            const { email } = reqbody;
            const admin = await this.adminModel.findOne({
                where: { email: email.trim() },
                attributes: ['id', 'email', 'password_hash', 'first_name', 'last_name'],
                raw: true,
                nest: true,
            });
            return admin;
        }
        catch (error) {
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
    async is_exist_admin_reset_token(token) {
        try {
            const is_exist_user_token = await this.adminModel.findOne({
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
    async admin_password_reset(reqbody) {
        try {
            const hashpassword = await password_service_1.PasswordService.hashPassword(reqbody.password);
            const update_user_password_reset = {
                password_hash: hashpassword,
                api_token: '',
                updated_at: new Date(),
            };
            const reset_password = await this.adminModel.update(update_user_password_reset, {
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
    async updateAdminProfile(reqbody) {
        try {
            const updateAdminProfile = {
                email: reqbody.email,
                first_name: reqbody.first_name,
                last_name: reqbody.last_name,
                updated_at: new Date(),
            };
            const adminprofile = await this.adminModel.update(updateAdminProfile, {
                where: {
                    email: reqbody.email
                }
            });
            if (adminprofile[0] === 0) {
                return false;
            }
            return true;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(auth_schema_1.Admin)),
    __metadata("design:paramtypes", [Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map