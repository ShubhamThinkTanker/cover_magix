import { IsEmail, IsNotEmpty } from 'class-validator';

export class ValidateFabric {

  @IsNotEmpty({
    message: "Fabric Name is required"
  })
  fabric_name: string;

  @IsNotEmpty({
    message: "Material is required"
  })
  material: string;

  @IsNotEmpty({
    message: "Ideal For is required"
  })
  ideal_for: string;

  @IsNotEmpty({
    message: "Feature is required"
  })
  feature: string;

  @IsNotEmpty({
    message: "Weigh is required"
  })
  weight: string;

  @IsNotEmpty({
    message: "Warrenty is required"
  })
  warranty: string;

  water_proof: boolean; 
  uv_resistant: boolean;
  fabric_type: string;

}
