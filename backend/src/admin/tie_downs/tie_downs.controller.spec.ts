import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateGrommets {

    @IsNotEmpty({
        message:"Tie Down Name is required"
      })
      tie_down_name : string;

      @IsNotEmpty({
        message:"Price is required"
      })
      price : string;

}

