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
  UploadedFiles,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from 'Helper/commonResponse';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { resizeImage } from 'Helper/imageConfigration';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'Helper/S3Bucket';
import { Banners } from './banners.schema';
import { InjectModel } from '@nestjs/sequelize';
import { ValidateBanner } from './validation/banners.validation';
import { validate } from 'class-validator';
import { Expression } from 'aws-sdk/clients/applicationautoscaling';

@Controller('banners')
export class BannersController {

  constructor(
    @InjectModel(Banners) private BannerModel: typeof Banners,
    private readonly BannersService: BannersService,
    private readonly s3Service: S3Service,
  ) { }

  @Post('create')
  @UseInterceptors(FilesInterceptor('banner_images'))
  async bannersCreate(
    @Body() CreateRating: any,
    @Req() req: any,
    @Res() res: Response,
    @UploadedFiles() banner_images,
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

      

      let filesWithId = [];

      if (banner_images.length > 0) {
        const resizedImages = await Promise.all(banner_images.map(async (file) => {
          const resizedImageBuffer = await resizeImage(file.buffer, 150, 150);
          return { buffer: resizedImageBuffer, originalname: file.originalname, mimetype: file.mimetype };
        }));

        filesWithId = banner_images.map((file) => ({
          // id: uuidv4(),
          fileName: `${Date.now()}-${file.originalname}`,
        }));

        await this.s3Service.uploadFileToS3ForBanners(resizedImages, filesWithId.map(file => file.fileName));
      }
      // console.log(req.body , ": { first image , bannerstatus of 0 index , promo_code of 0 index}  " , filesWithId);
      const createdData = await this.BannersService.createBanners(
        req.user,
        req.body,
        filesWithId
      );

      if (createdData) {
        return new Success(
          res,
          200,
          createdData,
          '🌟 Your banner has been successfully added',
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


  @Get('first_banner')
  async headerBanner( @Req() req: any, @Res() res: Response){
    try {

      var findFirstBanner = await this.BannersService.firstBanner()
      if (findFirstBanner) {
        return new Success(
          res,
          200,
          findFirstBanner,
          '🌟 Your banner has been successfully Get For Header',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          findFirstBanner,
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

  @Get('second_banner')
  async SecondBannerGet( @Req() req: any, @Res() res: Response){
    try {

      var findFirstBanner = await this.BannersService.secondBanner()
      if (findFirstBanner) {
        return new Success(
          res,
          200,
          findFirstBanner,
          '🌟 Your banner has been successfully Get For Home Page',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          findFirstBanner,
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

  @Get('third_banner')
  async ThirdBannerGet( @Req() req: any, @Res() res: Response){
    try {

      var findThirdBanner = await this.BannersService.ThirdBanner()
      if (findThirdBanner) {
        return new Success(
          res,
          200,
          findThirdBanner,
          '🌟 Your banner has been successfully Get For Home Page',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          findThirdBanner,
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




  @Post('list')
  async getAllRatingDownList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let banner_listing = await this.BannersService.getAllBanners(
        req.body,
        req.user,
      );

      if (banner_listing) {
        return new Success(res, 200, banner_listing, '🎉 All Banners Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          banner_listing,
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

  @Post('list')
  async getAllBannersList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let bannerImages = await this.BannersService.getAllBanners(
        req.body,
        req.user,
      );

      if (bannerImages) {
        return new Success(res, 200, bannerImages, '🎉 All Banners Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          bannerImages,
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

  @Get('list/:id')
  async getByIdBannnerList(
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

      const ListData = await this.BannersService.getBannersById(req.user, id);
      if (ListData) {
        return new Success(res, 200, ListData, '🔍 Banners Found Successfully!');
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

  @Post('delete/:id')
  async BannersDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {

      const bannerID = req.params.id;
      const existingBanner = await this.BannerModel.findOne(bannerID);
      if (!existingBanner) {
        return new CustomErrorResponse(
          res,
          500,
          'Banner ID not found',
          'Banner ID does not found in database',
        );
      }

      const data = await this.BannersService.deleteBannersById(req.user, id);
      if (data) {
        return new Success(
          res,
          200,
          {},
          '🗑️ Banners Deleted Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          data,
          'Something went wrong during Search',
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

  // @Post('delete/bannerID/:banner_id/imageID/:image_id')
  // async bannerImageRemove(
  //   @Param('banner_id') banner_id: number,
  //   @Param('image_id') image_id: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const banner = await this.BannerModel.findOne({ where: { id: banner_id, deleted_at: null } });
  //     if (!banner) {
  //       return new CustomErrorResponse(
  //         res,
  //         404,
  //         'Banner not found',
  //         'Banner ID does not exist in the database',
  //       );
  //     }

  //     const existingBannerImage = banner.banner_images.find(image => image['id'] === image_id);
  //     if (!existingBannerImage) {
  //       return new CustomErrorResponse(
  //         res,
  //         404,
  //         'Image not found',
  //         "Image ID does not exist in the banner's images",
  //       );
  //     }

  //     const bannerImage = await this.BannersService.deleteBannerImageById(banner_id, image_id);
  //     //await this.s3Service.deleteBannerImage([{ id: image_id, fileName: existingBannerImage['fileName'] }]);

  //     if (bannerImage) {
  //       return new Success(res, 200, bannerImage, '🎉 Banner Image Deleted Successfully!');
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         404,
  //         null,
  //         'Banner image not found',
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error in deleteBannerImage:', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }

  //   @Post('update/:id')
  // @UseInterceptors(FilesInterceptor('banner_images'))
  // async updateBannerById(
  //   @Param('id') banner_id: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFiles() banner_images : Express.Multer.File,
  // ) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     const bannerId = req.params.id;

  //     const existingBanner = await this.BannerModel.findOne({ where: { id: bannerId, deleted_at: null } });
  //     if (!existingBanner) {
  //       return new CustomErrorResponse(
  //         res,
  //         500,
  //         'Banner not found',
  //         'BannerID does not found in database',
  //       );
  //     }

  //     // let fileName: string[] = existingBanner.banner_images;
  //     // if (banner_images) {
  //     //    fileName = [`${Date.now()}-${uploadedFile.originalname}`];
  //     //   //await this.s3Service.uploadFileToS3CategoryAndSubCategory(banner_images, fileName);
  //     // }

  //     const errors = {};
  //     const bannerInput = new ValidateBanner();
  //     bannerInput.product_id = req.body.product_id;
  //     bannerInput.banner_type = req.body.banner_type;
  //     bannerInput.promo_code_id = req.body.promo_code_id;
  //     bannerInput.banner_images = req.body.banner_images;
  //     bannerInput.banner_url = req.body.banner_url;

  //     const validation_errors = await validate(bannerInput);

  //     if (validation_errors.length > 0 || Object.keys(errors).length > 0) {
  //       validation_errors.map((error) => {
  //         errors[error['property']] = Object.values(error.constraints)[0];
  //       });

  //       return new CustomErrorResponse(
  //         res,
  //         422,
  //         'Something went wrong',
  //         errors,
  //       );
  //     }

  //     const updateData = await this.BannersService.updateBannerById(
  //       bannerId,
  //       req.body,
  //     );

  //     if (updateData) {
  //       return new Success(res, 200, true, '🎊 Banner Updated Successfully!');
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         false,
  //         'Something went wrong during Update',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Update Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }

  // @Post('update/:id')
  // @UseInterceptors(FilesInterceptor('banner_images'))
  // async updateBannerById(
  //   @Param('id') banner_id: string,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFiles() banner_images: Express.Multer.File[],
  // ) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     const bannerId = +banner_id; // Convert banner_id to number if needed

  //     const existingBanner = await this.BannerModel.findOne({ where: { id: bannerId, deleted_at: null } });
  //     if (!existingBanner) {
  //       return new CustomErrorResponse(
  //         res,
  //         500,
  //         'Banner not found',
  //         'BannerID does not found in database',
  //       );
  //     }

  //     let fileNames: string[] = existingBanner.banner_images;

  //     // Handle file uploads if banner_images array is present
  //     if (banner_images && banner_images.length > 0) {
  //       fileNames = banner_images.map(file => `${Date.now()}-${file.originalname}`);
  //       // Example: Save files to directory or upload to cloud storage service
  //       // await this.s3Service.uploadFileToS3CategoryAndSubCategory(banner_images, fileNames);
  //     }

  //     // Validate input data
  //     const bannerInput = new ValidateBanner();
  //     bannerInput.product_id = req.body.product_id;
  //     bannerInput.banner_type = req.body.banner_type;
  //     bannerInput.promo_code_id = req.body.promo_code_id;
  //     bannerInput.banner_images = req.body.banner_images;
  //     bannerInput.banner_url = req.body.banner_url;

  //     const validation_errors = await validate(bannerInput);

  //     if (validation_errors.length > 0) {
  //       const errors = {};
  //       validation_errors.forEach((error) => {
  //         errors[error['property']] = Object.values(error.constraints)[0];
  //       });

  //       return new CustomErrorResponse(
  //         res,
  //         422,
  //         'Validation Error',
  //         errors,
  //       );
  //     }
      
  //     const updatedBanner = await this.BannersService.updateBannerById(
  //       bannerId,
  //       req.body,
  //       fileNames,
  //     );

  //     if (updatedBanner) {
  //       return new Success(res, 200, updatedBanner, '🎊 Banner Updated Successfully!');
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         false,
  //         'Something went wrong during Update',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Update Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }


}
