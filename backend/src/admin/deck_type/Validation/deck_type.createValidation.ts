import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateDeckType {
    
    @IsNotEmpty({
        message:"Deck Type Name is required"
      })
      deck_name : string;

      @IsNotEmpty({
        message:"Price is required"
      })
      price : string;

}

