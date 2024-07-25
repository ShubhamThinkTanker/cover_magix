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
exports.Banners = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Banners = exports.Banners = class Banners extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Banners.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('first', 'second', 'third'),
        defaultValue: 'first'
    }),
    __metadata("design:type", String)
], Banners.prototype, "banner_type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING)),
    __metadata("design:type", Array)
], Banners.prototype, "banner_images", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }),
    __metadata("design:type", String)
], Banners.prototype, "banner_status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Banners.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Banners.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Banners.prototype, "deleted_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Banners.prototype, "created_by", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Banners.prototype, "updated_by", void 0);
exports.Banners = Banners = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'banners', deletedAt: "deleted_at" })
], Banners);
//# sourceMappingURL=banners.schema.js.map