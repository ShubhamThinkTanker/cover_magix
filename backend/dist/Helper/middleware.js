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
exports.EnsureAdminAuthenticatedMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const sequelize_1 = require("@nestjs/sequelize");
const auth_schema_1 = require("../src/admin/auth/auth.schema");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
let EnsureAdminAuthenticatedMiddleware = exports.EnsureAdminAuthenticatedMiddleware = class EnsureAdminAuthenticatedMiddleware {
    constructor(adminModel) {
        this.adminModel = adminModel;
    }
    async use(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('token: ', token);
        if (!token) {
            throw new common_1.UnauthorizedException('Not authorized, no token');
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await this.adminModel.findOne({ where: { id: decoded.id } });
            if (!admin) {
                throw new common_1.UnauthorizedException('Not authorized, user not found');
            }
            req.user = admin;
            next();
        }
        catch (error) {
            console.error('Error decoding token:', error);
            throw new common_1.UnauthorizedException('Not authorized, token failed');
        }
    }
};
exports.EnsureAdminAuthenticatedMiddleware = EnsureAdminAuthenticatedMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(auth_schema_1.Admin)),
    __metadata("design:paramtypes", [Object])
], EnsureAdminAuthenticatedMiddleware);
//# sourceMappingURL=middleware.js.map