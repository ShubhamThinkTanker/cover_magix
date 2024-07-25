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
exports.Products = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const categories_schema_1 = require("../categories/categories.schema");
const sub_categories_schema_1 = require("../sub_categories/sub_categories.schema");
const productImage_schema_1 = require("./productImage.schema");
let Products = exports.Products = class Products extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Products.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => categories_schema_1.Categories),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Products.prototype, "category_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => categories_schema_1.Categories),
    __metadata("design:type", categories_schema_1.Categories)
], Products.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => sub_categories_schema_1.Sub_Categories),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Products.prototype, "sub_category_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => sub_categories_schema_1.Sub_Categories),
    __metadata("design:type", sub_categories_schema_1.Sub_Categories)
], Products.prototype, "sub_category", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Products.prototype, "product_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Products.prototype, "product_slug_url", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Products.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Products.prototype, "product_price", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Products.prototype, "meta_data", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Products.prototype, "rating", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Products.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Products.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Products.prototype, "deleted_at", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => productImage_schema_1.ProductsImage),
    __metadata("design:type", Array)
], Products.prototype, "images", void 0);
exports.Products = Products = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'products', deletedAt: "deleted_at" })
], Products);
//# sourceMappingURL=product.schema.js.map