import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateUserForgotPasswordInput {

    @IsEmail({},{
        message:"email is invalid"
    })
    @IsNotEmpty({
        message:"email is required"
      })
    email : string;
}




