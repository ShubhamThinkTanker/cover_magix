import { IsNotEmpty, IsString, IsInt, IsEnum, IsDate, IsOptional, Min, Max, IsDateString } from 'class-validator';

enum PromoType {
  FIRST_ORDER = 'first_order',
  CAT = 'cat',
  SUB_CAT = 'sub_cat',
  PRO = 'pro'
}

enum Status {
  PENDING = 'pending',
  PROCESS = 'process',
  ACTIVE = 'active',
  EXPIRED = 'expired'
}

export class CreatePromoDto {
  @IsNotEmpty()
  @IsEnum(PromoType)
  promo_type: PromoType;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_user: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Status)
  status: Status;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  discount_per: number;

  @IsOptional()
  header_Promo: boolean;
}
