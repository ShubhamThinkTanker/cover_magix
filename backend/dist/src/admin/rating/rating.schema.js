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
exports.Rating = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const product_schema_1 = require("../product/product.schema");
let Rating = exports.Rating = class Rating extends sequelize_typescript_1.Model {
    ;
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Rating.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Rating.prototype, "rating", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Rating.prototype, "comment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING)),
    __metadata("design:type", Array)
], Rating.prototype, "images", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_schema_1.Products),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Rating.prototype, "product_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => product_schema_1.Products),
    __metadata("design:type", product_schema_1.Products)
], Rating.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], Rating.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Rating.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Rating.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Rating.prototype, "deleted_at", void 0);
exports.Rating = Rating = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'ratings', deletedAt: "deleted_at" })
], Rating);
//# sourceMappingURL=rating.schema.js.map