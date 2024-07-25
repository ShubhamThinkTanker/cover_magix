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
exports.FabricsMaterial = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const fabric_schema_1 = require("./fabric.schema");
let FabricsMaterial = exports.FabricsMaterial = class FabricsMaterial extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], FabricsMaterial.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fabric_schema_1.Fabrics),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FabricsMaterial.prototype, "fabric_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FabricsMaterial.prototype, "color_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FabricsMaterial.prototype, "color", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FabricsMaterial.prototype, "fabric_image", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING)),
    __metadata("design:type", Array)
], FabricsMaterial.prototype, "color_suggestions", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], FabricsMaterial.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], FabricsMaterial.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], FabricsMaterial.prototype, "deleted_at", void 0);
exports.FabricsMaterial = FabricsMaterial = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'fabric_Materials', deletedAt: "deleted_at" })
], FabricsMaterial);
//# sourceMappingURL=fabricMaterial.schema.js.map