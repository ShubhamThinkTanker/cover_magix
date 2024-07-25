import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateUserEditProfile {

   

    @IsEmail({},{
        message:"email is invalid"
    })
    @IsNotEmpty({
        message:"email is required"
      })
    email : string;
    
    
    @IsNotEmpty({
        message:"first name is required"
      })
    first_name? : string;
    
    @IsNotEmpty({
        message:"last name is required"
      })
    last_name? : string;
    
    @IsNotEmpty({
        message:"company is required"
      })
      company? : string;
    
    @IsNotEmpty({
        message:"mobile no is required"
      })
    mobile_no? : string;

}
