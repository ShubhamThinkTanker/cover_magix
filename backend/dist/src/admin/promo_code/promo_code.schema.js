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
exports.Promo_code = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Promo_code = exports.Promo_code = class Promo_code extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Promo_code.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('first_order', 'cat', 'sub_cat', 'pro'),
    }),
    __metadata("design:type", String)
], Promo_code.prototype, "promo_type", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Promo_code.prototype, "code", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Promo_code.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Promo_code.prototype, "max_user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'process', 'active', 'expired'),
    }),
    __metadata("design:type", String)
], Promo_code.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Promo_code.prototype, "header_Promo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], Promo_code.prototype, "itemId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], Promo_code.prototype, "productId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Promo_code.prototype, "end_date", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Promo_code.prototype, "start_date", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Promo_code.prototype, "discount_per", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Promo_code.prototype, "created_by", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Promo_code.prototype, "updated_by", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Promo_code.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Promo_code.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt,
    __metadata("design:type", Date)
], Promo_code.prototype, "deleted_at", void 0);
exports.Promo_code = Promo_code = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'promo_codes', deletedAt: "deleted_at" })
], Promo_code);
//# sourceMappingURL=promo_code.schema.js.map