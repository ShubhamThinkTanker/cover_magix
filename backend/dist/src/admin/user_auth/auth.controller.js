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
var UserAuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const commonResponse_1 = require("../../../Helper/commonResponse");
const user_register_validation_1 = require("./validation/user.register.validation");
const user_login_validation_1 = require("./validation/user.login.validation");
const admin_editProfile_validation_1 = require("./validation/admin.editProfile.validation");
const auth_schema_1 = require("./auth.schema");
const class_validator_1 = require("class-validator");
const password_service_1 = require("../../../Helper/password.service");
const jwt = require("jsonwebtoken");
const dotenv_1 = require("dotenv");
const passport_1 = require("@nestjs/passport");
(0, dotenv_1.config)();
let UserAuthController = exports.UserAuthController = UserAuthController_1 = class UserAuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async userLogin(req, res) {
        try {
            const { email, password } = req.body;
            console.log(email, password);
            const userLoginErrors = new user_login_validation_1.ValidateUserLogin();
            userLoginErrors.email = email?.trim();
            userLoginErrors.password = password;
            const validationErrors = await (0, class_validator_1.validate)(userLoginErrors);
            if (validationErrors.length > 0) {
                const errors = validationErrors.reduce((acc, error) => {
                    acc[error.property] = Object.values(error.constraints)[0];
                    return acc;
                }, {});
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation error', errors);
            }
            const isUserExist = await this.authService.is_exist_email({ email });
            if (!isUserExist) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid credentials', {
                    email: 'Email does not exist',
                });
            }
            const passwordMatch = await UserAuthController_1.passwordService.comparePasswords(password, isUserExist.password_hash);
            if (!passwordMatch) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid credentials', {
                    password: 'Incorrect password',
                });
            }
            const payload = {
                id: isUserExist.id,
                email: isUserExist.email,
                first_name: isUserExist.first_name,
                last_name: isUserExist.last_name,
            };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
                if (err) {
                    return new commonResponse_1.CustomErrorResponse(res, 500, 'Token generation failed', { error: err.message });
                }
                else {
                    return new commonResponse_1.Success(res, 200, { user_detail: payload, token: 'Bearer ' + token }, 'Successfully User Login');
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
    async userRegister(req, res) {
        try {
            const { email, password, first_name, last_name, mobile_no, company } = req.body;
            console.log(email, password);
            const userRegisterErrors = new user_register_validation_1.ValidateUserRegister();
            userRegisterErrors.first_name = first_name?.trim();
            userRegisterErrors.last_name = last_name?.trim();
            userRegisterErrors.email = email?.trim();
            userRegisterErrors.password = password;
            userRegisterErrors.mobile_no = mobile_no?.trim();
            userRegisterErrors.company = company?.trim();
            const validationErrors = await (0, class_validator_1.validate)(userRegisterErrors);
            if (validationErrors.length > 0) {
                const errors = validationErrors.reduce((acc, error) => {
                    acc[error.property] = Object.values(error.constraints)[0];
                    return acc;
                }, {});
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Validation error', errors);
            }
            const isUserExist = await this.authService.is_exist_email({ email });
            if (isUserExist) {
                return new commonResponse_1.CustomErrorResponse(res, 422, 'Invalid credentials', {
                    email: 'Email already exist'
                });
            }
            const hashed_password = await password_service_1.PasswordService.hashPassword(password);
            const newUser = await auth_schema_1.User.create({
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
        }
        catch (error) {
            console.error('Error during user registration:', error);
            return res.status(500).json({ message: error.message });
        }
    }
    async getAllUserList(req, res) {
        try {
            const userList = await this.authService.allUserList(req.body);
            if (userList) {
                return new commonResponse_1.Success(res, 200, userList, '🎉 All Users Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'No User Found');
            }
        }
        catch (error) {
            console.log('Error fetching user addresses -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async userEditProfile(req, res) {
        let errors = {};
        console.log(req.user);
        console.log(req.body);
        let user_edit_profile_error = new admin_editProfile_validation_1.ValidateUserEditProfile();
        user_edit_profile_error.email = req.body.email?.trim();
        user_edit_profile_error.first_name = req.body.first_name?.trim();
        user_edit_profile_error.last_name = req.body.last_name?.trim();
        user_edit_profile_error.mobile_no = req.body.mobile_no?.trim();
        user_edit_profile_error.company = req.body.company?.trim();
        const validation_errors = await (0, class_validator_1.validate)(user_edit_profile_error);
        if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
            validation_errors.map((error) => {
                errors[error['property']] = Object.values(error.constraints)[0];
            });
            return new commonResponse_1.CustomErrorResponse(res, 422, 'Something went wrong', errors);
        }
        const is_user_exist = await this.authService.is_exist_email(req.body);
        if (!is_user_exist) {
            return new commonResponse_1.CustomResponse(res, 400, 'User does not found', 'Something went wrong');
        }
        const updated_user = await this.authService.update_user_profile(req.body);
        if (!updated_user) {
            return new commonResponse_1.CustomResponse(res, 400, 'User does not found', 'Something went wrong');
        }
        return new commonResponse_1.Success(res, 200, updated_user, 'Profile updated successfully');
    }
    async googleAuth(req) { }
    async googleAuthRedirect(req) {
        const user = await this.authService.findOrCreate(req.user.user);
        return user;
    }
    async facebookAuth(req) { }
    async facebookAuthRedirect(req) {
        const user = await this.authService.findOrCreateForFacebook(req.user.user);
        console.log(user, "users>>>>>>>>>>>>>>>>.");
        return user;
    }
    async addUserAddress(req, res) {
        try {
            const { user_id, street_address, city, state, zip, country } = req.body;
            if (!user_id) {
                return res.status(404).json({ message: 'User not found' });
            }
            const addAddress = await this.authService.addUserAddress({
                user_id, street_address, city, state, zip, country
            });
            return res.status(201).json({
                message: 'User Address Added Successfully',
                user: addAddress
            });
        }
        catch (error) {
            console.error('Error during user registration:', error);
            return res.status(500).json({ message: error.message });
        }
    }
    async getUserAddressList(req, res) {
        try {
            const userAddress = await this.authService.userAddressList(req.body);
            if (userAddress) {
                return new commonResponse_1.Success(res, 200, userAddress, '🎉 All Address Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'No Address Found');
            }
        }
        catch (error) {
            console.log('Error fetching user addresses -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
UserAuthController.passwordService = new password_service_1.PasswordService();
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "userLogin", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "userRegister", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "getAllUserList", null);
__decorate([
    (0, common_1.Put)('edit_profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "userEditProfile", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Get)('facebook'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "facebookAuth", null);
__decorate([
    (0, common_1.Get)('facebook/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "facebookAuthRedirect", null);
__decorate([
    (0, common_1.Post)('address'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "addUserAddress", null);
__decorate([
    (0, common_1.Post)('address/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserAuthController.prototype, "getUserAddressList", null);
exports.UserAuthController = UserAuthController = UserAuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.UserAuthService])
], UserAuthController);
//# sourceMappingURL=auth.controller.js.map