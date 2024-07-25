import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateAirBags {

    @IsNotEmpty({
        message:"Air Bag's Size is required"
      })
      size : string;

      @IsNotEmpty({
        message:"Air Bag's Quantity is required"
      })
      quantity : number;
}




