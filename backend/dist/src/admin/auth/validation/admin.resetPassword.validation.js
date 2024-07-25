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
exports.ValidateAdminResetPasswordInput = exports.IsMatchingCurrentPassword = void 0;
const class_validator_1 = require("class-validator");
let strong_password_regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
function IsMatchingCurrentPassword(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMatchingCurrentPassword',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const currentPassword = args.object['password'];
                    return value === currentPassword;
                },
            },
        });
    };
}
exports.IsMatchingCurrentPassword = IsMatchingCurrentPassword;
class ValidateAdminResetPasswordInput {
}
exports.ValidateAdminResetPasswordInput = ValidateAdminResetPasswordInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    __metadata("design:type", String)
], ValidateAdminResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: "Password is required"
    }),
    __metadata("design:type", String)
], ValidateAdminResetPasswordInput.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    IsMatchingCurrentPassword({ message: 'Password did not match' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Confirm password is required' }),
    __metadata("design:type", String)
], ValidateAdminResetPasswordInput.prototype, "confirm_password", void 0);
//# sourceMappingURL=admin.resetPassword.validation.js.map