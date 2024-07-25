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
exports.ValidateUserRegister = void 0;
const class_validator_1 = require("class-validator");
class ValidateUserRegister {
}
exports.ValidateUserRegister = ValidateUserRegister;
__decorate([
    (0, class_validator_1.IsEmail)({}, {
        message: "email is invalid"
    }),
    (0, class_validator_1.IsNotEmpty)({
        message: "email is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "first name is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "last name is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "password is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "mobile no is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "mobile_no", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({
        message: "country is required"
    }),
    __metadata("design:type", String)
], ValidateUserRegister.prototype, "company", void 0);
//# sourceMappingURL=user.register.validation.js.map