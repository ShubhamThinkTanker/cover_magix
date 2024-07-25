import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { ValidateFabric } from './Validation/febric.createValidation';
import { ValidateFabricMaterial } from './Validation/febricMaterial.createValidation';
import { FabricService } from './fabric.service';
import { CreateFabric, CreateFabricMaterial } from './fabric.interface';
import { CreateFabricDto } from './dto/createFabric.dto';
import { CreateFabricMaterialDto } from './dto/createFabricMaterial.dto';
import { FabricsMaterial } from './fabricMaterial.schema';
import { InjectModel } from '@nestjs/sequelize';
import { resizeImage } from 'Helper/imageConfigration';

@Controller('fabric')
export class FabricController {
  constructor(
    @InjectModel(FabricsMaterial) private FabricsMaterialModel: typeof FabricsMaterial,
    private readonly s3Service: S3Service,
    private readonly fabricService: FabricService,
  ) {}

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  async fabriccreate(
    @Body() CreateFabric: CreateFabricDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      // var fileName = `${Date.now()}-${file.originalname}`;

      const errors = {};
      const FabricInput = new ValidateFabric();
      FabricInput.fabric_name = CreateFabric.fabric_name;
      FabricInput.material = CreateFabric.material;
      FabricInput.ideal_for = CreateFabric.ideal_for;
      FabricInput.feature = CreateFabric.feature;
      FabricInput.weight = CreateFabric.weight;
      FabricInput.warranty = CreateFabric.warranty;

      const validation_errors = await validate(FabricInput);

      const findFabricExist =
        await this.fabricService.FabricNameExist(CreateFabric);
      if (findFabricExist) {
        errors['Fabric_name'] = 'This Fabric name is already exist';
      }

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
          // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
        });
        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }

      console.log(CreateFabric, ':CreateFabric');
      // await this.s3Service.uploadFileToS3ForGrommets(file, fileName);
      const createdData = await this.fabricService.CreateFabric(
        req.user,
        CreateFabric,
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Fabric Created Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          createdData,
          'Something went wrong during creation',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('fabric_material')
  @UseInterceptors(FileInterceptor('fabric_image'))
  async fabricMaterialCreate(
    @Body() CreateFabricMaterial: CreateFabricMaterialDto,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() fabric_image,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      var fileName = `${Date.now()}-${fabric_image.originalname}`;

      const resizedImageBuffer = await resizeImage(fabric_image.buffer, 150, 150);


      const errors = {};
      const fabricMaterialInput = new ValidateFabricMaterial();
      fabricMaterialInput.color_name = CreateFabricMaterial.color_name;
      fabricMaterialInput.color = CreateFabricMaterial.color;
      fabricMaterialInput.color_suggestions = CreateFabricMaterial.color_suggestions;

      const validation_errors = await validate(fabricMaterialInput);
      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
          // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
        });
        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }
      //await this.s3Service.uploadFileToS3ForFabric(fabric_image, fileName);
      await this.s3Service.uploadFileToS3ForFabric({ buffer: resizedImageBuffer, originalname: fileName }, fileName);
      const createdData = await this.fabricService.createFabricMaterial(
        req.user,
        CreateFabricMaterial,
        fileName,
      );
      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🎉 Fabric Material Created Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          createdData,
          'Something went wrong during creation',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }
  
  @Get('fabric_material/list/:fabric_id')
  async getByIdFabricMaterialsList(
    @Param('fabric_id') fabric_id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const FabricMaterialId = req.params.fabric_id;
      if (!this.isValidMySQLId(FabricMaterialId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Fabric Material id',
          'Fabric Materiala id is not valid',
        );
      }
      const ListData = await this.fabricService.FabricsMaterialById(fabric_id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'FabricMaterial not found',
          'FabricMaterialID does not found in database',
        );
      }

      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Fabric Material Found Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          ListData,
          'Something went wrong during Serach',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('fabric_material/list')
  async getAllFabricMaterialsList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let fabricMaterial_listing = await this.fabricService.allFabricMaterialsFind(
        req.body,
        req.user,
      );

      if (fabricMaterial_listing) {
        return new Success(
          res,
          200,
          fabricMaterial_listing,
          '🎉 All Fabric Material Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          fabricMaterial_listing,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }


  @Post('fabric_material/delete/:id')
  async fabricMaterialDeleteByID(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const FabricMaterialId = req.params.id;
      if (!this.isValidMySQLId(FabricMaterialId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Fabric_Material id',
          'Fabric_Material id isnot valid',
        );
      }
      const dataFindForImageDelete =
        await this.fabricService.FindfabricMaterial(id);
      await this.s3Service.deleteFabricImage(
        dataFindForImageDelete?.fabric_image,
      );

      const data = await this.fabricService.deletefabricMaterial(req.user, id);
      if (!data) {
        return new CustomErrorResponse(
          res,
          500,
          'Fabric_Material not found',
          'Fabric_Material ID doesnot found in database',
        );
      }
      return new Success(
        res,
        200,
        {},
        '🗑️ Fabric Material Deleted Successfully!',
      );
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list/:id')
  async getByIdFabricsList(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const FabricId = req.params.id;
      if (!this.isValidMySQLId(FabricId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Fabric id',
          'Fabric id isnot valid',
        );
      }
      const ListData = await this.fabricService.FabricById(id);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'Fabric not found',
          'FabricID doesnot found in database',
        );
      }

      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Fabric Found Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          ListData,
          'Something went wrong during Serach',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('list')
  async getAllFabricList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let category_listing = await this.fabricService.allFabricFind(
        req.body,
        req.user,
      );

      if (category_listing) {
        return new Success(
          res,
          200,
          category_listing,
          '🎉 All Fabric Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          category_listing,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/:id')
  async fabricDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const FabricId = req.params.id;
      if (!this.isValidMySQLId(FabricId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Fabric id',
          'Fabric id isnot valid',
        );
      }

      const existingFabric = await this.fabricService.FabricById(id);
      if (!existingFabric) {
        return new CustomErrorResponse(
          res,
          500,
          'Fabric not found',
          'FabricID doesnot found in database',
        );
      }
      const data = await this.fabricService.deleteFabric(req.user, id);
      if (data) {
        return new Success(res, 200, {}, '🗑️ Fabric Deleted Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          data,
          'Something went wrong during Serach',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('list_V_L')
  async getAllFabricListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let fabric_listing_VL = await this.fabricService.allFabricListingVL(
        req.user,
      );

      if (fabric_listing_VL) {
        return new Success(
          res,
          200,
          fabric_listing_VL,
          '📋 All Fabric Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          fabric_listing_VL,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('fabric_material/list_V_L')
  async getAllFabricMaterialsListValueLabelWise(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let fabric_materials_listing_VL = await this.fabricService.allFabricMaterialsListingVL(
        req.user,
      );

      if (fabric_materials_listing_VL) {
        return new Success(
          res,
          200,
          fabric_materials_listing_VL,
          '📋 All Fabric Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          fabric_materials_listing_VL,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Put('update/:id')
  async updateFabricById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const FabricId = req.params.id;
      if (!this.isValidMySQLId(FabricId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Fabric id',
          'Fabric id isnot valid',
        );
      }

      const existingFabric = await this.fabricService.FabricById(
        FabricId,
      );
      if (!existingFabric) {
        return new CustomErrorResponse(
          res,
          500,
          'Fabric not found',
          'FabricID doesnot found in database',
        );
      }

      const errors = {};
      const FabricInput = new ValidateFabric();
      FabricInput.fabric_name = req.body.fabric_name;
      FabricInput.material = req.body.material;
      FabricInput.ideal_for = req.body.ideal_for;
      FabricInput.feature = req.body.feature;
      FabricInput.warranty = req.body.warranty;
      FabricInput.weight = req.body.weight;
      FabricInput.water_proof = req.body.water_proof;
      FabricInput.uv_resistant = req.body.uv_resistant;
      FabricInput.fabric_type = req.body.fabric_type;

      const validation_errors = await validate(FabricInput);

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
          // UserController.final_error_object['errors'][error['property']] = Object.values(error.constraints)[0]
        });

        return new CustomErrorResponse(
          res,
          422,
          'Something went wrong',
          errors,
        );
      }

      const updateData = await this.fabricService.updateFabric(
        req.user,
        id,
        req.body,
      );
      if (updateData) {
        return new Success(res, 200, req.body, '🎊 Fabric Updated Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          false,
          'Something went wrong during Serach',
        );
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('fabric_material/update/:id')
  @UseInterceptors(FileInterceptor('fabric_image'))
  async updateFabricMaterialById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() fabric_image,
  ) {
    try {
      // Check user authentication
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const FabricMaterialId = req.params.id;
      if (!this.isValidMySQLId(FabricMaterialId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid FabricMaterial id',
          'FabricMaterial id isnot valid',
        );
      }

      const existingFabricMaterial = await this.FabricsMaterialModel.findOne({ where: { id , deleted_at : null}});
      if (!existingFabricMaterial) {
        return new CustomErrorResponse(
          res,
          500,
          'FabricMaterial not found',
          'FabricMaterialID doesnot found in database',
        );
      }

      const resizedImageBuffer = await resizeImage(fabric_image.buffer, 150, 150);

      // Validate request body
      const errors = {};
      const fabricMaterialInput = new ValidateFabricMaterial();
      fabricMaterialInput.color_name = req.body.color_name;
      fabricMaterialInput.color = req.body.color;
      fabricMaterialInput.color_suggestions = req.body.color_suggestions;

      const validation_errors = await validate(fabricMaterialInput);

      if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
        validation_errors.map((error) => {
          errors[error['property']] = Object.values(error.constraints)[0];
        });

        return new CustomErrorResponse(
          res,
          422,
          'Validation Error',
          errors,
        );
      }
      
      if (fabric_image) {
        await this.s3Service.deleteFabricMaterialImage(existingFabricMaterial.fabric_image);

        var fileName = `${Date.now()}-${fabric_image.originalname}`;
        //const imageUrl = await this.s3Service.uploadFileToS3ForFabric(fabric_image, fileName);
        await this.s3Service.uploadFileToS3ForFabric({ buffer: resizedImageBuffer, originalname: fileName }, fileName);

      }
      const updateData = await this.fabricService.updateFabricMaterial(req.user, FabricMaterialId, req.body, fileName);


      if (updateData) {
        return new Success(res, 200, true, "✨ Fabric Material Updated Successfully!");
      } else {
        return new CustomResponse(res, 400, false, 'Something went wrong during update');
      }
    } catch (error) {
      console.log('Create Block Error -> ', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  //Export Excel
  @Get('excel')
  async exportExcel(@Res() res: Response, @Req() req: Request) {
    try {
      //  const filePath = path.join(__dirname, '../../../../FabricList.xlsx');
      const bufferData = await this.fabricService.ExportExcel();

      return new Success(
        res,
        200,
        bufferData,
        '📋 Fabric Excel Successfully Export!',
      );
      
    } catch (error) {
      console.error('Error:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }
}
