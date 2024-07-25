import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class CreateFabricDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Fabric Name is required"
  })
  fabric_name: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Material is required"
  })
  material: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Ideal For is required"
  })
  ideal_for: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Feature is required"
  })
  feature: string;


  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Weigh is required"
  })
  weight: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({
    message: "Warrenty is required"
  })
  warranty: string;

  @IsNotEmpty({
    message: "Water Proof is required"
  })
  water_proof: number;

  @IsNotEmpty({
    message: "UV Resistant is required"
  })
  uv_resistant: number;

  @IsNotEmpty({
    message: "Fabric Type is required"
  })
  fabric_type: number;
}

