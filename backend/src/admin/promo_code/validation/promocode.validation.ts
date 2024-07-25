import {IsEmail,IsNotEmpty} from 'class-validator';

export class ValidatePromoCode {

      promo_type : string;

      code : number;
     
      header_Promo : boolean;

      description: string;

      max_user : number;

      status : string;

      end_date : string;

      start_date : string;

      discount_per : number;
}




