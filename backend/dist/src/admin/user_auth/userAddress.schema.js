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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_Address = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const auth_schema_1 = require("./auth.schema");
let User_Address = exports.User_Address = class User_Address extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], User_Address.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => auth_schema_1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User_Address.prototype, "user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => auth_schema_1.User),
    __metadata("design:type", auth_schema_1.User)
], User_Address.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User_Address.prototype, "street_address", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User_Address.prototype, "city", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User_Address.prototype, "state", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User_Address.prototype, "zip", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User_Address.prototype, "country", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], User_Address.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], User_Address.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt,
    __metadata("design:type", Date)
], User_Address.prototype, "deleted_at", void 0);
exports.User_Address = User_Address = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, paranoid: false, tableName: 'user_addresses' })
], User_Address);
//# sourceMappingURL=userAddress.schema.js.map