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
exports.Sub_Categories = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const categories_schema_1 = require("../categories/categories.schema");
let Sub_Categories = exports.Sub_Categories = class Sub_Categories extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Sub_Categories.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => categories_schema_1.Categories),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Sub_Categories.prototype, "category_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => categories_schema_1.Categories),
    __metadata("design:type", categories_schema_1.Categories)
], Sub_Categories.prototype, "category", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Sub_Categories.prototype, "sub_category_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Sub_Categories.prototype, "sub_catetgory_slug_url", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Sub_Categories.prototype, "sub_category_image", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Sub_Categories.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Sub_Categories.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Sub_Categories.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Sub_Categories.prototype, "deleted_at", void 0);
exports.Sub_Categories = Sub_Categories = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'sub_categories', deletedAt: "deleted_at" })
], Sub_Categories);
//# sourceMappingURL=sub_categories.schema.js.map