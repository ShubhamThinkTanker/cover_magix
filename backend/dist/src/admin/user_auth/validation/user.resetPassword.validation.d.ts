import { ValidationOptions } from 'class-validator';
export declare function IsMatchingCurrentPassword(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare class ValidateUserResetPasswordInput {
    token: string;
    password: string;
    confirm_password: string;
}
