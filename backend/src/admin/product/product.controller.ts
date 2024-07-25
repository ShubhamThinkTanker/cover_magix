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
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CustomCatchBlockErrorMessage,
  CustomErrorResponse,
  CustomResponse,
  Success,
} from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from '../../../Helper/S3Bucket';
import { Products } from './product.schema';
import { ProductsImage } from './productImage.schema';
import { CreateProduct, CreateProductImage } from './product.interface';
import { validate } from 'class-validator';
import { ValidateProduct } from './Validation/product.createValidation';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/createProduct.dto';
import { CreateProductImageDto } from './dto/createProductImg.dto';
import { v4 as uuidv4 } from 'uuid';
import { InputData, Measurement, MeasurementData } from './interfaces/product.measurement';
import { resizeImage } from 'Helper/imageConfigration';
import { MultipleFilesInterceptor } from './multiple-files.interceptor';

@Controller('product')
export class ProductController {
  constructor(
    @InjectModel(ProductsImage)
    private ProductsImageModel: typeof ProductsImage,
    private readonly s3Service: S3Service,
    private readonly productService: ProductService,
  ) { }

  isValidMySQLId(id: string): boolean {
    const regex = /^\d+$/;
    return regex.test(id);
  }

  @Post('create')
  async Productcreate(
    @Body() reqBody: any,
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

      const errors = {};
      const productInput = new ValidateProduct();
      productInput.product_name = reqBody.product_name;
      productInput.product_slug_url = reqBody.product_slug_url;
      productInput.category_id = reqBody.category_id;
      productInput.sub_category_id = reqBody.sub_category_id;
      productInput.description = reqBody.description;
      productInput.product_price = reqBody.product_price;
      productInput.rating = reqBody.rating;

      const validation_errors = await validate(productInput);

      const findProductExist = await this.productService.ProductNameExist(productInput);
      if (findProductExist) {
        errors['product_name'] = 'This Product name is already exist';
      }
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

      const createdData = await this.productService.createProduct(req.user, productInput);
      if (createdData) {
        return new Success(
          res,
          200,
          createdData, // Return the created product data
          '🎉 Product Created Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          null,
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
  async getAllProductList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let product_listing = await this.productService.allProductListing(
        req.body,
        req.user,
      );

      if (product_listing) {
        return new Success(
          res,
          200,
          product_listing,
          '🎉 All Product Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          product_listing,
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
  async getByIdProductList(
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
      const ProductId = req.params.id;
      if (!this.isValidMySQLId(ProductId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Product id',
          'Product id isnot valid',
        );
      }

      const existingProduct = await this.productService.ProductsById(
        req.user,
        ProductId,
      );
      if (!existingProduct) {
        return new CustomErrorResponse(
          res,
          500,
          'Product not found',
          'ProductID doesnot found in database',
        );
      }
      return new Success(
        res,
        200,
        existingProduct,
        '🔍 Product Found Successfully!',
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

  @Post('delete/:id')
  async ProductDeleteById(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const ProductId = req.params.id;
      if (!this.isValidMySQLId(ProductId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Product id',
          'Product id isnot valid',
        );
      }

      const existingProduct = await this.productService.ProductsById(
        req.user,
        ProductId,
      );
      if (!existingProduct) {
        return new CustomErrorResponse(
          res,
          500,
          'Product not found',
          'ProductID doesnot found in database',
        );
      }


      const product = await this.ProductsImageModel.findOne({ where: { product_id: ProductId, deleted_at: null } });
      if (!product) {
        return new CustomErrorResponse(
          res,
          404,
          'Product not found',
          'Product ID does not exist in the database',
        );
      } ``

      const filenames = product?.product_image.map(image => image['fileName']);
      await this.s3Service.deleteProduct(
        filenames,
      );

      const data = await this.productService.deleteProduct(req.user , id);
      if (data) {
        return new Success(res, 200, {}, '🗑️ Product Deleted Successfully!');
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

  @Post('update/:id')
  async updateProductById(
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

      const ProductId = req.params.id;
      if (!this.isValidMySQLId(ProductId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Product id',
          'Product id isnot valid',
        );
      }

      const existingProduct = await this.productService.ProductsById(
        req.user,
        ProductId,
      );
      if (!existingProduct) {
        return new CustomErrorResponse(
          res,
          500,
          'Product not found',
          'ProductID doesnot found in database',
        );
      }

      const errors = {};
      const productInput = new ValidateProduct();
      productInput.category_id = req.body.category_id;
      productInput.sub_category_id = req.body.sub_category_id;
      productInput.product_name = req.body.product_name;
      productInput.product_slug_url = req.body.product_slug_url;
      productInput.description = req.body.description;
      productInput.product_price = req.body.product_price;

      const validation_errors = await validate(productInput);

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

      const updateData = await this.productService.updateProduct(
        req.user,
        id,
        req.body,
      );
      if (updateData) {
        return new Success(res, 200, true, '🎊 Product Updated Successfully!');
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

  @Get('list_V_L')
  async getAllProductListValueLabelWise(
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

      let subcategories_listing_VL =
        await this.productService.allProductsListingVL(req.user);

      if (subcategories_listing_VL) {
        return new Success(
          res,
          200,
          subcategories_listing_VL,
          '📋 All Products Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          subcategories_listing_VL,
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

  @Post('product-features')
  async productFeatures(@Body() requestBody: any , @Req() req: any) {
    try {
      const newProductFeatures = await this.productService.CreateProductFeatures(req.user, requestBody);
      return {
        success: true,
        data: newProductFeatures,
      };
    } catch (error) {
      console.log(error);
      return { success: false, error: 'Failed to create product features' };
    }
  }

  @Post('product-features/list')
  async getAllProductsFeatures(@Body() reqBody: any) {
    try {
      const productsFeatures = await this.productService.GetAllProductsFeatures(reqBody);

      return {
        success: true,
        status: 200,
        message: '🎉 All Product Listed Successfully!',
        data: productsFeatures,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch products features',
        error: error.message,
      };
    }
  }

  //productImageCreate
  // @Post('image')
  // @UseInterceptors(FilesInterceptor('product_image'))
  // async productImageCreate(
  //   @Body() createProductImageDto: CreateProductImageDto,
  //   @Req() req: any,
  //   @Res() res: Response,
  //   @UploadedFiles() product_image,
  // ) {
  //   try {
  //     // console.log(createProductImageDto,"data")
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }
  //     const errors = {};
  //     const productExists = await Products.findOne({
  //       where: { id: createProductImageDto.product_id, deleted_at: null },
  //     });
  //     if (!productExists) {
  //       errors['product_id'] = 'This Product id does not exist';
  //       return new CustomResponse(
  //         res,
  //         400,
  //         errors,
  //         'Product id does not exist',
  //       );
  //     }

  //     const fileName = product_image.map((element) => {
  //       return `${Date.now()}-${element.originalname}`;
  //     });

  //     await this.s3Service.uploadFileToS3ForProduct(product_image, fileName);

  //     const createdData = await this.productService.createProductImages(
  //       req.user,
  //       createProductImageDto,
  //       fileName,
  //     );

  //     if (createdData) {
  //       return new Success(
  //         res,
  //         200,
  //         fileName,
  //         '🎉 Product Images added Successfully!',
  //       );
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         createdData,
  //         'Something went wrong during creation',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Create Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }

  @Post('image')
  // @UseInterceptors(FilesInterceptor('product_image'))
  // @UseInterceptors(FilesInterceptor('default_image'))
  @UseInterceptors(new MultipleFilesInterceptor([
      { name: 'product_image', maxCount: 10 },
      { name: 'default_image', maxCount: 2 },
    ]))
  async productImageCreate(
    @Body() createProductImageDto: CreateProductImageDto,
    @Req() req: any,
    @Res() res: Response,
    // @UploadedFiles() product_image,
    // @UploadedFiles() default_image,
   @UploadedFiles() files: { product_image?: Express.Multer.File[], default_image?: Express.Multer.File[] },
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

      const errors = {};
      const productExists = await Products.findOne({
        where: { id: createProductImageDto.product_id, deleted_at: null },
      });
      if (!productExists) {
        errors['product_id'] = 'This Product id does not exist';
        return new CustomResponse(
          res,
          400,
          errors,
          'Product id does not exist',
        );
      }


      const productImages = files.product_image || [];
      const defaultImages = files.default_image || [];

      if (productImages.length > 0 || defaultImages.length > 0) {
        const resizedImages = await Promise.all(productImages.map(async (file) => {
          const resizedImageBuffer = await resizeImage(file.buffer, 150, 150);
          return { buffer: resizedImageBuffer, originalname: file.originalname };
        }));

        const resizedDefaultImages = await Promise.all(defaultImages.map(async (file) => {
          const resizedImageBuffer = await resizeImage(file.buffer, 150, 150);
          return { buffer: resizedImageBuffer, originalname: file.originalname };
        }));

        const filesWithId = productImages.map((file) => ({
          id: uuidv4(), // Generate UUID
          fileName: `${Date.now()}-${file.originalname}`,
        }));

        const defaultFilesWithId = defaultImages.map((file) => ({
          id: uuidv4(), // Generate UUID
          fileName: `${Date.now()}-${file.originalname}`,
        }));


        if (productImages.length > 0) {
          await this.s3Service.uploadFileToS3ForProduct(resizedImages, filesWithId.map(file => file.fileName));
        }

        if (defaultImages.length > 0) {
          await this.s3Service.uploadFileToS3ForProduct(resizedDefaultImages, filesWithId.map(file => file.fileName));
        }

        const createdData = await this.productService.createProductImages(
          req.user,
          createProductImageDto,
          filesWithId,
          defaultFilesWithId
        );

        return new Success(
          res,
          200,
          {
            product_id: createProductImageDto.product_id,
            product_image: createdData['newImages'],
            default_image: createdData['newDefaultImages']
          },
          '🎉 Product Images added Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          {},
          'Product image is required',
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

  @Post('product_images/list')
  async getAllProductImageList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let productImages = await this.productService.GetAllProductsImage(
        req.body,
        req.user,
      );

      if (productImages) {
        return new Success(res, 200, productImages, '🎉 All Product Listed Successfully!');
      } else {
        return new CustomResponse(
          res,
          400,
          productImages,
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

  @Get('product_images/list/:id')
  async getOneProductImageList(@Param('id') productId: string, @Res() res: Response) {
    try {
      const productImage = await this.productService.ProductImagesByID(productId);

      if (productImage) {
        return new Success(res, 200, productImage, '🎉 Product Image Retrieved Successfully!');
      } else {
        return new CustomResponse(
          res,
          404,
          null,
          'Product image not found',
        );
      }

    } catch (error) {
      console.error('Error in getOneProductImageList:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('delete/productID/:product_id/imageID/:image_id')
  async productImageRemove(
    @Param('product_id') product_id: number,
    @Param('image_id') image_id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {

      const product = await this.ProductsImageModel.findOne({ where: { product_id: product_id, deleted_at: null } });
      if (!product) {
        return new CustomErrorResponse(
          res,
          404,
          'Product not found',
          'Product ID does not exist in the database',
        );
      }

      const existingProductImage = product.product_image.find(image => image['id'] === image_id);
      if (!existingProductImage) {
        return new CustomErrorResponse(
          res,
          404,
          'Image not found',
          "Image ID does not exist in the product's images",
        );
      }

      const productImage = await this.productService.deleteProductImageById(req.user, product_id, image_id);
      await this.s3Service.deleteProductImage([{ id: image_id, fileName: existingProductImage['fileName'] }]);

      if (productImage) {
        return new Success(res, 200, productImage, '🎉 Product Image Delete Successfully!');
      } else {
        return new CustomResponse(
          res,
          404,
          null,
          'Product image not found',
        );
      }
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Post('image/update/:id')
  async updateProductImageById(
    @Param('id') id: string,
    @Body() requestBody: { product_image: string[], },
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      // Validate user authentication
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      // Validate product image ID
      const productImageId = id;
      if (!this.isValidMySQLId(productImageId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Product_Image id',
          'Product_Image id is not valid',
        );
      }

      let existingProductImage = await this.ProductsImageModel.findByPk(id);

      if (existingProductImage) {
        const updatedImages = [];

        for (const image of requestBody.product_image) {
          // Check if the image is a URL
          if (image.startsWith('http')) {
            // Extract original filename from URL
            const filenameWithTimestamp = image.split('/').pop();
            updatedImages.push(filenameWithTimestamp);
          } else {
            // Append timestamp to filename
            const timestampedFilename = `${Date.now()}-${image}`;
            updatedImages.push(timestampedFilename);
          }
        }

        // Update existing images
        existingProductImage.product_image = updatedImages;
        await existingProductImage.save();
      }

      return new Success(
        res,
        200,
        {},
        'Product image updated successfully!'
      );
    } catch (error) {
      console.log('Error updating product image:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong while updating product image');
    }
  }

  @Get('product_images/list_V_L')
  async getAllProductImagesListValueLabelWise(
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

      let product_images_listing_VL =
        await this.productService.allProductImagesListingVL(req.user);

      if (product_images_listing_VL) {
        return new Success(
          res,
          200,
          product_images_listing_VL,
          '📋 All Products Listed Successfully by Label and Value!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          product_images_listing_VL,
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

  @Post('product-features-master')
  async productFeaturesMaster(@Body() requestBody: any, @Req() req: any, @Res() res: Response) {
    try {
      const newProductFeatures = await this.productService.CreateProductFeaturesMaster(req.user, requestBody);
      return new Success(
        res,
        200,
        newProductFeatures,
        'Product features created successfully'
      );
    } catch (error) {
      console.error('Error creating product features:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Failed to create product features'
      );
    }
  }

  // @Post('product-features-master/list')
  // async getAllProductFeatureMasterList(@Req() req: any, @Res() res: Response) {
  //   try {
  //     if (!req.user) {
  //       return new CustomErrorResponse(
  //         res,
  //         401,
  //         'Invalid User login',
  //         'Invalid Login credential',
  //       );
  //     }

  //     let product_listing = await this.productService.allProductFeaturesMasterListing(
  //       req.body,
  //       req.user,
  //     );

  //     console.log(product_listing , "Product Listinggggg"); 

  //     if (product_listing) {
  //       return new Success(
  //         res,
  //         200,
  //         product_listing,
  //         '🎉 All Product Listed Successfully!',
  //       );
  //     } else {
  //       return new CustomResponse(
  //         res,
  //         400,
  //         product_listing,
  //         'Something went wrong',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Create Block Error -> ', error);
  //     return new CustomCatchBlockErrorMessage(
  //       res,
  //       500,
  //       error.toString(),
  //       'Something went wrong',
  //     );
  //   }
  // }

  @Post('product-features-master/list')
  async getAllProductFeatureMasterList(@Req() req: Request, @Res() res: Response) {
    try {
      const { user, body } = req;

      if (!user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      const productListing = await this.productService.allProductFeaturesMasterListing(body, user);

      // console.log(productListing, 'Product Listinggggg');

      if (productListing) {
        // Define intermediate type for parsing
        type ParsedProductFeature = {
          id: number;
          product_id: number;
          modules: any[];
          features: any[];
          custom_fields: any[];
          created_at: Date;
        };

        // Parse JSON fields correctly
        const parsedProductListing = {
          ...productListing,
          Product_listing: productListing.Product_listing.map(item => ({
            ...item,
            modules: JSON.parse(item.modules as unknown as string),
            features: JSON.parse(item.features as unknown as string),
            custom_fields: JSON.parse(item.custom_fields as unknown as string),
          })) as ParsedProductFeature[],
        };

        return new Success(
          res,
          200,
          parsedProductListing,
          '🎉 All Product Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          productListing,
          'Something went wrong',
        );
      }
    } catch (error) {
      console.error('Create Block Error ->', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Something went wrong',
      );
    }
  }

  @Get('product-features-master/list/:id')
  async getOneProductFeatureMasterList(@Param('id') productId: string, @Res() res: Response) {
    try {
      const productListing = await this.productService.ProductFeaturesMasterById(productId);

      if (!productListing || productListing.length === 0) {
        return new CustomResponse(res, 404, null, 'Product features not found');
      }

      type ParsedProductFeature = {
        id: number;
        product_id: number;
        modules: any[];
        features: any[];
        custom_fields: any[];
        created_at: Date;
      };

      // Parsing the modules, features, and meta_data for each product feature
      const parsedProductListing: ParsedProductFeature[] = productListing.map(item => ({
        ...item,
        modules: JSON.parse(item.modules as unknown as string),
        features: JSON.parse(item.features as unknown as string),
        custom_fields: JSON.parse(item.custom_fields as unknown as string),
      }));

      // Creating the response data object with parsed Product_listing only
      const responseData = {
        Product_listing: parsedProductListing,
      };

      return new Success(res, 200, responseData, '🎉 Product Features Retrieved Successfully!');
    } catch (error) {
      console.error('Error in getOneProductFeatureMasterList:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.message || error.toString(),
        'Something went wrong'
      );
    }
  }

  //   @Post('measurement')
  // async measurementLogic(@Req() req: Request, @Res() res: Response) {

  //   function calculateArea(data: InputData) {
  //     const { product_measurement, extra_material, material_price } = data;

  //     console.log(data , ":data");
  //     let total_area_sq_inches = 0;

  //     product_measurement.forEach((shape: MeasurementData) => {
  //       Object.values(shape).forEach((shapeData: Measurement) => {
  //         const { Height, Width, Depth } = shapeData;
  //         const area_sq_inches = 2 * (Height * Width + Height * Depth + Width * Depth);
  //         total_area_sq_inches += area_sq_inches;
  //       });
  //     });

  //     const area_sq_meters = total_area_sq_inches * 0.00064516;
  //     const total_material_sq_meters = area_sq_meters * (1 + extra_material);
  //     const cost = total_material_sq_meters * material_price;

  //     return {
  //       area_sq_inches: total_area_sq_inches.toFixed(2),
  //       area_sq_meters: area_sq_meters.toFixed(2),
  //       total_material_sq_meters: total_material_sq_meters.toFixed(2),
  //       cost: cost.toFixed(2),
  //     };
  //   }

  //   try {
  //     const body: InputData = req.body;

  //     const result = calculateArea(body);

  //     console.log(result,":::::::;");
  //     res.status(200).json(result);

  //   } catch (error) {

  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // }

  @Post('measurement')
  async measurementLogic(@Body() requestBody: InputData,@Req() req:any , @Res() res: Response) {
    try {
      const newMeasurement = await this.productService.productMeasurements(req.user, requestBody);
      return new Success(
        res,
        200,
        newMeasurement,
        'Product measurement created successfully'
      );
    } catch (error) {
      console.error('Error creating product measurement:', error);
      return new CustomCatchBlockErrorMessage(
        res,
        500,
        error.toString(),
        'Failed to create product measurement'
      );
    }
  }

  @Post('measurement/list')
  async getAllProductMeasurementList(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return new CustomErrorResponse(
          res,
          401,
          'Invalid User login',
          'Invalid Login credential',
        );
      }

      let product_listing = await this.productService.allProductMeasurementsListing(
        req.body,
        req.user,
      );

      if (product_listing) {
        return new Success(
          res,
          200,
          product_listing,
          '🎉 All Measurements Listed Successfully!',
        );
      } else {
        return new CustomResponse(
          res,
          400,
          product_listing,
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

  @Get('measurement/list/:id')
  async getByIdProductMeasurementList(
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
      const ProductId = req.params.id;
      if (!this.isValidMySQLId(ProductId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid Product id',
          'Product id isnot valid',
        );
      }

      const existingProduct = await this.productService.productMeasurementsById(
        req.user,
        ProductId,
      );
      if (!existingProduct) {
        return new CustomErrorResponse(
          res,
          500,
          'Product not found',
          'ProductID doesnot found in database',
        );
      }
      return new Success(
        res,
        200,
        existingProduct,
        '🔍 Product Measurement Found Successfully!',
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

  @Get('trending')
  async allTrendingProductsListingVL() {
    try {
      const trendingProducts = await this.productService.allTrendingProductsListingVL();
      return { success: true, data: trendingProducts };
    } catch (error) {
      return { success: false, message: 'Failed to fetch trending products', error: error.toString() };
    }
  }

  @Get('filter-products')
  async filterProducts(
    @Query('sortByName') sortByName?: boolean,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('rating') rating?: number,
  ): Promise<Products[]> {
    return this.productService.filterProducts(sortByName, minPrice, maxPrice, rating);
  }

  @Post('user/produc_details/:id')
  async productDetails(
    @Param('id') id: any,
    @Req() req: any,
    @Res() res: Response,
  )
  {
    try {
        var findProduct = await this.productService.findProductForUserPanel(id)
   res.json(findProduct)
      
    } catch (error) {
      console.log(error , ":----------");
    }
  }

  
  @Get('subcategorywiseproductimages/:id')
  async subCategoryWiseProductImage(
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
      const subCategoryId = req.params.id;
      if (!this.isValidMySQLId(subCategoryId)) {
        return new CustomErrorResponse(
          res,
          404,
          'Enter valid SubCategory id',
          'Category id is not valid',
        );
      }

      const ListData = await this.productService.subCategoryWiseProductImage(subCategoryId);
      if (!ListData) {
        return new CustomErrorResponse(
          res,
          500,
          'Subcategory not found',
          'subCategoryId doesnot found in database',
        );
      }
      return new Success(res, 200, ListData, '🔍 Default Images Found Successfully!');
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
       const bufferData = await this.productService.ExportExcel();
 
       return new Success(
        res,
        200,
        bufferData,
        '📋 Product Excel Successfully Export!',
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
