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
exports.ProductsFeatures = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const product_schema_1 = require("./product.schema");
const fabricMaterial_schema_1 = require("../fabric/fabricMaterial.schema");
const tie_downs_schema_1 = require("../tie_downs/tie_downs.schema");
const grommets_schema_1 = require("../grommets/grommets.schema");
let ProductsFeatures = exports.ProductsFeatures = class ProductsFeatures extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], ProductsFeatures.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_schema_1.Products),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProductsFeatures.prototype, "product_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => product_schema_1.Products),
    __metadata("design:type", product_schema_1.Products)
], ProductsFeatures.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fabricMaterial_schema_1.FabricsMaterial),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], ProductsFeatures.prototype, "fabric_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fabricMaterial_schema_1.FabricsMaterial),
    __metadata("design:type", fabricMaterial_schema_1.FabricsMaterial)
], ProductsFeatures.prototype, "fabric", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => tie_downs_schema_1.Tie_Down),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], ProductsFeatures.prototype, "tie_down_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => tie_downs_schema_1.Tie_Down),
    __metadata("design:type", tie_downs_schema_1.Tie_Down)
], ProductsFeatures.prototype, "tie_down", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => grommets_schema_1.Grommets),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], ProductsFeatures.prototype, "grommet_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => grommets_schema_1.Grommets),
    __metadata("design:type", grommets_schema_1.Grommets)
], ProductsFeatures.prototype, "grommet", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ProductsFeatures.prototype, "meta_data", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ProductsFeatures.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ProductsFeatures.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], ProductsFeatures.prototype, "deleted_at", void 0);
exports.ProductsFeatures = ProductsFeatures = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'Product_Features', deletedAt: "deleted_at" })
], ProductsFeatures);
//# sourceMappingURL=productFeatures.schema.js.map