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
exports.ValidateCategory = void 0;
const class_validator_1 = require("class-validator");
class ValidateCategory {
}
exports.ValidateCategory = ValidateCategory;
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Category Name is required"
    }),
    __metadata("design:type", String)
], ValidateCategory.prototype, "category_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Category Status is required"
    }),
    __metadata("design:type", Number)
], ValidateCategory.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "Category include_store_menu is required"
    }),
    __metadata("design:type", Number)
], ValidateCategory.prototype, "include_store_menu", void 0);
//# sourceMappingURL=categories.createValidation.js.map