import { IsNotEmpty, IsString, IsInt, IsEmail, IsEnum, Min, Max, IsDate, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  stock: number;

  @IsInt()
  @IsNotEmpty()
  totalAmount: number;

  @IsDate()
  @IsNotEmpty()
  orderDate: Date;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsInt()
  @IsOptional() // Assuming coupon is optional
  appliedCoupenId?: number;

  @IsInt()
  @IsOptional() // Assuming taxes can be optional
  IGST?: number;

  @IsInt()
  @IsOptional() // Assuming taxes can be optional
  SGST?: number;

  @IsEnum(['true', 'false'])
  @IsNotEmpty()
  returnStatus: string;

  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsNotEmpty()
  orderStatus: string;
}
