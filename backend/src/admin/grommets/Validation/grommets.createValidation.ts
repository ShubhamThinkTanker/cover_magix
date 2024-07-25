import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateGrommets {

    @IsNotEmpty({
        message:"Grommet Name is required"
      })
      grommet_name : string;

      @IsNotEmpty({
        message:"Price is required"
      })
      price : string;

}

