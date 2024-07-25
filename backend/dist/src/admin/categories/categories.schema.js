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
exports.Categories = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sub_categories_schema_1 = require("../sub_categories/sub_categories.schema");
let Categories = exports.Categories = class Categories extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Categories.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Categories.prototype, "category_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Categories.prototype, "category_slug_url", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Categories.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Categories.prototype, "include_store_menu", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Categories.prototype, "Position", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Categories.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Categories.prototype, "category_image", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Categories.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Categories.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Categories.prototype, "deleted_at", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => sub_categories_schema_1.Sub_Categories),
    __metadata("design:type", Array)
], Categories.prototype, "sub_categories", void 0);
exports.Categories = Categories = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'categories', deletedAt: "deleted_at" })
], Categories);
//# sourceMappingURL=categories.schema.js.map