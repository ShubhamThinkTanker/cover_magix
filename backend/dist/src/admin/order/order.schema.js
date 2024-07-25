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
exports.Orders = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const product_schema_1 = require("../product/product.schema");
const auth_schema_1 = require("../user_auth/auth.schema");
let Orders = exports.Orders = class Orders extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], Orders.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_schema_1.Products),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "product_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => product_schema_1.Products),
    __metadata("design:type", product_schema_1.Products)
], Orders.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => auth_schema_1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => auth_schema_1.User),
    __metadata("design:type", auth_schema_1.User)
], Orders.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "first_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "last_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "phone_number", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "product_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "price", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "stock", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "total_amount", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Orders.prototype, "order_date", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "address", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "city", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "state", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "zipcode", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Orders.prototype, "country", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "applied_coupen_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "IGST", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Orders.prototype, "SGST", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('true', 'false'),
        defaultValue: 'false'
    }),
    __metadata("design:type", String)
], Orders.prototype, "return_status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], Orders.prototype, "order_status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Orders.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Orders.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Orders.prototype, "deleted_at", void 0);
exports.Orders = Orders = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'orders', deletedAt: "deleted_at" })
], Orders);
//# sourceMappingURL=order.schema.js.map