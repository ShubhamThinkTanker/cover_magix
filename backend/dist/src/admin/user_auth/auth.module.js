"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
const userAddress_schema_1 = require("./userAddress.schema");
let UserAuthModule = exports.UserAuthModule = class UserAuthModule {
};
exports.UserAuthModule = UserAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([auth_schema_1.User, userAddress_schema_1.User_Address]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: 'secretKey',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        providers: [auth_service_1.UserAuthService],
        controllers: [auth_controller_1.UserAuthController],
    })
], UserAuthModule);
//# sourceMappingURL=auth.module.js.map