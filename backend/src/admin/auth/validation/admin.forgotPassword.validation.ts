import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateAdminForgotPasswordInput {

    @IsEmail({},{
        message:"email is invalid"
    })
    @IsNotEmpty({
        message:"email is required"
      })
    email : string;
}




