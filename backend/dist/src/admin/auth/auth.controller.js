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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const admin_login_validation_1 = require("./validation/admin.login.validation");
const admin_forgotPassword_validation_1 = require("./validation/admin.forgotPassword.validation");
const admin_resetPassword_validation_1 = require("./validation/admin.resetPassword.validation");
const class_validator_1 = require("class-validator");
const password_service_1 = require("../../../Helper/password.service");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
let AuthController = exports.AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            const adminLoginErrors = new admin_login_validation_1.ValidateAdminLogin();
            adminLoginErrors.email = email?.trim();
            adminLoginErrors.password = password;
            const validationErrors = await (0, class_validator_1.validate)(adminLoginErrors);
            if (validationErrors.length > 0) {
                const errors = validationErrors.reduce((acc, error) => {
                    acc[error.property] = Object.values(error.constraints)[0];
                    return acc;
                }, {});
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation error', errors);
            }
            const isAdminExist = await this.authService.is_exist_email({ email });
            if (!isAdminExist) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid credentials', {
                    email: 'Email does not exist',
                });
            }
            const passwordMatch = await AuthController_1.passwordService.comparePasswords(password, isAdminExist.password_hash);
            if (!passwordMatch) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid credentials', {
                    password: 'Incorrect password',
                });
            }
            const payload = {
                id: isAdminExist.id,
                email: isAdminExist.email,
                first_name: isAdminExist.first_name,
                last_name: isAdminExist.last_name,
            };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
                if (err) {
                    return new commonResponse_1.CustomErrorResponse(res, 500, 'Token generation failed', { error: err.message });
                }
                else {
                    return new commonResponse_1.Success(res, 200, { user_detail: payload, token: 'Bearer ' + token }, 'Successfully Admin Login');
                }
            });
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomErrorResponse(res, 500, 'Internal server error', {
                message: 'Something went wrong',
            });
        }
    }
    async adminForgotPassword(req, res) {
        let errors = {};
        let admin_forgot_password_error = new admin_forgotPassword_validation_1.ValidateAdminForgotPasswordInput();
        admin_forgot_password_error.email = req.body.email?.trim();
        const validation_errors = await (0, class_validator_1.validate)(admin_forgot_password_error);
        if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
            validation_errors.map((error) => {
                errors[error['property']] = Object.values(error.constraints)[0];
            });
            return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
        }
        let is_admin_exist = await this.authService.is_exist_email(req.body);
        if (!is_admin_exist) {
            return new commonResponse_1.CustomResponse(res, 400, 'User does not found', 'Something went wrong');
        }
        const token_fun = async (data) => {
            var token_data = {
                api_token: data,
                api_token_expires: new Date().getTime() + 3 * 60 * 1000,
                updated_at: Date.now(),
            };
            let updateAdminForgotPassword = await this.authService.updateResetTokenValuesForForgotPassword(token_data, req.body);
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
                return new commonResponse_1.Success(res, 200, updateAdminForgotPassword, 'Password reset link is sent to your registered email id');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, updateAdminForgotPassword, 'Something went wrong');
            }
        };
        crypto.randomBytes(20, (err, buffer) => {
            var token = buffer.toString('hex');
            token_fun(token);
        });
    }
    async adminResetPassword(req, res) {
        let errors = {};
        let admin_reset_password_error = new admin_resetPassword_validation_1.ValidateAdminResetPasswordInput();
        admin_reset_password_error.token = req.body.token?.trim();
        admin_reset_password_error.password = req.body.password?.trim();
        admin_reset_password_error.confirm_password =
            req.body.confirm_password?.trim();
        const validation_errors = await (0, class_validator_1.validate)(admin_reset_password_error);
        if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
            validation_errors.map((error) => {
                errors[error['property']] = Object.values(error.constraints)[0];
            });
            return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
        }
        let is_exist_user_with_reset_token = await this.authService.is_exist_admin_reset_token(req.body.token);
        if (is_exist_user_with_reset_token) {
            let user_password_reset = await this.authService.admin_password_reset(req.body);
            if (user_password_reset) {
                return new commonResponse_1.Success(res, 200, user_password_reset, 'Your Password Successfully Changed');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, user_password_reset, 'Something went wrong, Please try again');
            }
        }
        else {
            var error = {};
            error.token = 'Token is invalid or has expired.';
            return new commonResponse_1.CustomResponse(res, 400, error, 'Something went wrong');
        }
    }
    async updateAdminProfile(req, res) {
        try {
            const is_admin_exist = await this.authService.is_exist_email(req.body);
            if (!is_admin_exist) {
                return new commonResponse_1.CustomResponse(res, 400, 'admin does not found', 'Something went wrong');
            }
            const isUpdated = await this.authService.updateAdminProfile(req.body);
            if (!isUpdated) {
                return new commonResponse_1.CustomResponse(res, 400, 'Admin does not found', 'Something went wrong');
            }
            return new commonResponse_1.Success(res, 200, isUpdated, 'Profile updated successfully');
        }
        catch (error) {
            throw new Error("this email is not available");
        }
    }
    catch(error) {
        console.log('Create User -> ', error);
    }
};
AuthController.passwordService = new password_service_1.PasswordService();
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('forgot_password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminForgotPassword", null);
__decorate([
    (0, common_1.Post)('reset_password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminResetPassword", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateAdminProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map