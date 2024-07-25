import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateUserRegister {
    @IsEmail({},{
        message:"email is invalid"
    })
    @IsNotEmpty({
        message:"email is required"
      })
    email : string;

    @IsNotEmpty({
      message: "first name is required"
    })
    first_name: string;

    @IsNotEmpty({
      message: "last name is required"
    })
    last_name: string;
    
    
    @IsNotEmpty({
        message:"password is required"
      })
    password : string;

    @IsNotEmpty({
        message:"mobile no is required"
      })
    mobile_no: string;

    @IsNotEmpty({
        message:"country is required"
      })
      company: string;

}




