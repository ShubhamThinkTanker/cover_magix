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
exports.CreateFabricDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateFabricDto {
}
exports.CreateFabricDto = CreateFabricDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Fabric Name is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "fabric_name", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Material is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "material", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Ideal For is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "ideal_for", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Feature is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "feature", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Weigh is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "weight", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.IsNotEmpty)({
        message: "Warrenty is required"
    }),
    __metadata("design:type", String)
], CreateFabricDto.prototype, "warranty", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Water Proof is required"
    }),
    __metadata("design:type", Number)
], CreateFabricDto.prototype, "water_proof", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "UV Resistant is required"
    }),
    __metadata("design:type", Number)
], CreateFabricDto.prototype, "uv_resistant", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Fabric Type is required"
    }),
    __metadata("design:type", Number)
], CreateFabricDto.prototype, "fabric_type", void 0);
//# sourceMappingURL=createFabric.dto.js.map