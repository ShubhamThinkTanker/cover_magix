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
exports.DeckType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let DeckType = exports.DeckType = class DeckType extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ primaryKey: true, autoIncrement: true }),
    __metadata("design:type", Number)
], DeckType.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], DeckType.prototype, "deck_name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], DeckType.prototype, "price", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], DeckType.prototype, "deck_image", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DeckType.prototype, "created_at", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DeckType.prototype, "updated_at", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], DeckType.prototype, "deleted_at", void 0);
exports.DeckType = DeckType = __decorate([
    (0, sequelize_typescript_1.Table)({ paranoid: false, tableName: 'deck_types', deletedAt: "deleted_at" })
], DeckType);
//# sourceMappingURL=deck_type.schema.js.map