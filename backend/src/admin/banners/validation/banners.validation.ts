import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class ValidateBanner {
  product_id: string;
 
  banner_type: string;

  promo_code_id: number;

  banner_images: any[];

  banner_url: string[];
}
