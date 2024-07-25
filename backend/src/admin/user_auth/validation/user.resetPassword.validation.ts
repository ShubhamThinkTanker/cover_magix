import {IsString,IsNotEmpty,Matches,registerDecorator,ValidationOptions,ValidationArguments} from 'class-validator';

let strong_password_regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

export function IsMatchingCurrentPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isMatchingCurrentPassword',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const currentPassword = (args.object as any)['password'];
                    return value === currentPassword;
                },
            },
        });
    };
}



export class ValidateUserResetPasswordInput {

    @IsNotEmpty({ message: 'Token is required' })
    token: string;

    // @Matches(strong_password_regex, {
    //     message: "Password must be atleast 8 letters.Include with 1 uppercase character,1 special character,1 number"
    // })
    @IsString()
    @IsNotEmpty({
        message: "Password is required"
    })
    password: string;

    @IsString()
    @IsMatchingCurrentPassword({ message: 'Password did not match' })
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirm_password: string;
}




