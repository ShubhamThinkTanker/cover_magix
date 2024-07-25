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
exports.CreateAirBagsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAirBagsDto {
}
exports.CreateAirBagsDto = CreateAirBagsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Product ID is required"
    }),
    __metadata("design:type", Number)
], CreateAirBagsDto.prototype, "product_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Air Bag's size is required" }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    __metadata("design:type", String)
], CreateAirBagsDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Air Bag's quantity is required"
    }),
    __metadata("design:type", Number)
], CreateAirBagsDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Air Bag's Price is required"
    }),
    __metadata("design:type", String)
], CreateAirBagsDto.prototype, "price", void 0);
//# sourceMappingURL=air_bags.Dto.js.map