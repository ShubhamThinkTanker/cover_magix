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
exports.ValidateFabric = void 0;
const class_validator_1 = require("class-validator");
class ValidateFabric {
}
exports.ValidateFabric = ValidateFabric;
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Fabric Name is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "fabric_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Material is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "material", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Ideal For is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "ideal_for", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Feature is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "feature", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Weigh is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Warrenty is required"
    }),
    __metadata("design:type", String)
], ValidateFabric.prototype, "warranty", void 0);
//# sourceMappingURL=febric.createValidation.js.map