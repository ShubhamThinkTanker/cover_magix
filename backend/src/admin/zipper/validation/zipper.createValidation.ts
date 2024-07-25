import {IsEmail,IsNotEmpty} from 'class-validator';


export class ValidateZipper {

    @IsNotEmpty({
        message:"Zipper is required"
      })
      zipper_name : string;

      // @IsNotEmpty({
      //   message:"Zipper Image is required"
      // })
      // zipper_image : string;

      
}




