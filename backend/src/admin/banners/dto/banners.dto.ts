import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  banner_type: string;

}
