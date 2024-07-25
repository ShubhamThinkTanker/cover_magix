import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateUserLogin {

   

    @IsEmail({},{
        message:"email is invalid"
    })
    @IsNotEmpty({
        message:"email is required"
      })
    email : string;
    
    
    @IsNotEmpty({
        message:"password is required"
      })
    password : string;

}




