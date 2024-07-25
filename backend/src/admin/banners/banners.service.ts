import { Injectable } from '@nestjs/common';
import { Banners } from './banners.schema';
import { InjectModel } from '@nestjs/sequelize';
import { BadRequestException } from '@nestjs/common';
import { Op, Sequelize, where } from 'sequelize';
import { Order } from 'sequelize';
import { formatTimestamp } from 'Helper/dateFormat';
import { CreateBannerDto } from './dto/banners.dto';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banners) private BannerModel: typeof Banners,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) { }

  // async createBanners(reqUser: any, createBannerDto: any, filesWithId: any) {
  //   try {
  //     // Define a helper function to process banner data
  //     const processBannerData = (createBannerDto, filesWithId) => {
  //       if (!createBannerDto || !filesWithId) {
  //         throw new Error('Payload and files must be provided');
  //       }

  //       const { banner_type, promo_code, promo_status , banner_status} = createBannerDto;

  //       if (banner_status === "active") {
  //         throw new Error('please chnage the banner status')
  //       }
  //       else{
  //         const banner_image = filesWithId.map((file, index) => ({
  //           fileName: file.fileName,
  //           status: promo_status[index] === 'true',
  //           code: promo_code[index] !== 'null' ? promo_code[index] : null,
  //         }));

  //         return {
  //           banner_type,
  //           banner_image,
  //         };
  //       }
  //     };

  //     // Process the banner data
  //     const bannerData = processBannerData(createBannerDto, filesWithId);
  //     console.log(bannerData, ':ManageData');

  //     // Uncomment and adjust the following line according to your actual BannerModel implementation
  //     const newBanners = await this.BannerModel.create({
  //       banner_type: bannerData.banner_type,
  //       banner_images: bannerData.banner_image,
  //       created_at: new Date(),
  //       created_by: reqUser.id,
  //     });

  //     return newBanners;
  //   } catch (error) {
  //     console.error('Error creating Banner:', error);
  //     throw error
  //   }
  // }

  @ActivityLogger.createLog('Banners', 'Create')
  async createBanners(reqUser: any, createBannerDto: any, filesWithId: any) {
    try {
      // Define a helper function to process banner data
      const processBannerData = (createBannerDto, filesWithId) => {
        if (!createBannerDto || !filesWithId) {
          throw new Error('Payload and files must be provided');
        }

        const { banner_type, promo_code, promo_status, banner_status } = createBannerDto;

        if (banner_status === 'active') {
          throw new Error('Please change the banner status');
        }

        const banner_image = filesWithId.map((file, index) => ({
          fileName: file.fileName,
          status: promo_status[index] === 'true',
          code: promo_code[index] !== 'null' ? promo_code[index] : null,
        }));

        if (banner_type === 'second') {
          if (banner_image.length !== 1) {
            throw new Error('Second banner should have one image only')
          }
        }

        // if(banner_type === 'third') {
        //   if(banner_image.length!== 3) {
        //     throw new Error('third banner should have third image only')
        //   }
        // }

        if (banner_type === 'third') {
          if (banner_image.length > 3) {
            throw new Error('third banner should have a maximum of three images');
          }
        }

        return {
          banner_type,
          banner_image,
          banner_status,
        };
      };

      // Process the banner data
      const bannerData = processBannerData(createBannerDto, filesWithId);

      // Create new banner entry in the database
      const newBanners = await this.BannerModel.create({
        banner_type: bannerData.banner_type,
        banner_images: bannerData.banner_image,
        banner_status: bannerData.banner_status,
        created_at: new Date(),
        created_by: reqUser.id,
      });

      return newBanners;
    } catch (error) {
      throw new Error(error.message || 'Error creating Banner');
    }
  }


  async firstBanner() {
    try {

      var findBanner = await this.BannerModel.findOne({
        where: { banner_type: 'first', banner_status: 'active' },
        raw: true
      })

      return findBanner

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async secondBanner() {
    try {

        var findBanner = await this.BannerModel.findOne({
            where : {banner_type : 'second' , banner_status:'active'},
            raw:true
        })

        return findBanner

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async ThirdBanner() {
    try {

        var findBanner = await this.BannerModel.findOne({
            where : {banner_type : 'third' , banner_status:'active'},
            raw:true
        })

        return findBanner

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getBannersById(reqUser, id) {
    try {
      const data = await this.BannerModel.findOne({
        where: { id },
        attributes: ['id', 'banner_type', 'banner_images', 'banner_status', 'created_at', 'updated_at'],
      });
      return data
    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  async getAllBanners(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'banner_status';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];
      let whereClause = { deleted_at: null };

      if (filter_value) {
        whereClause[Op.or] = [
          { banner_type: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await this.BannerModel.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'banner_type', 'banner_images', 'banner_status', 'created_at', 'updated_at', 'created_by'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map((row) => {
        const bannerImages = row.banner_images.map((image) => ({
          id: image['id'],
          images: `${process.env.ProductS3Url}/${image['fileName']}`,
        }));
        return {
          ...row,
          banner_images: bannerImages,
        };
      });

      return {
        totalRecords: count,
        Product_Images_list: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Banners', 'Delete')
  async deleteBannersById(reqUser, id) {
    try {
      const banners = await this.BannerModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true,
        },
      );

      // await this.activityLogService.create({
      //   user_id: reqUser.id,
      //   module: 'Banners',
      //   action: 'Delete',
      //   message: `Banners Delete.`,
      //   ip_address: '127.0.0.1',
      // });


      return banners;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // async deleteBannerImageById(banner_id: number, image_id: string) {
  //   try {
  //     const existingBanner = await this.BannerModel.findOne({
  //       where: { id: banner_id, deleted_at: null },
  //     });

  //     if (
  //       existingBanner &&
  //       existingBanner.banner_images &&
  //       existingBanner.banner_images.length > 0
  //     ) {
  //       // Filter out the image with the specified ID
  //       existingBanner.banner_images =
  //         existingBanner.banner_images.filter(
  //           (image) => image['id'] !== image_id,
  //         );

  //       // Update the record in the database
  //       await existingBanner.save();
  //       console.log('Image removed successfully');

  //       // Prepare response
  //       const responseData = {
  //         remaining_images: existingBanner.banner_images,
  //       };
  //       return responseData;
  //     } else {
  //       throw new Error('Banner not found or no images available');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  // async updateBannerById(banner_id: number, updatedBanner: any): Promise<any> {
  //   try {
  //     const existingBanner = await this.BannerModel.findOne({
  //       where: { id: banner_id, deleted_at: null },
  //     });

  //     if (!existingBanner) {
  //       throw new Error('Banner not found');
  //     }

  //     // Update all fields with the provided data
  //     existingBanner.product_id = updatedBanner.product_id || existingBanner.product_id;
  //     existingBanner.banner_type = updatedBanner.banner_type || existingBanner.banner_type;
  //     existingBanner.promo_code_id = updatedBanner.promo_code_id || existingBanner.promo_code_id;
  //     existingBanner.banner_images = updatedBanner.banner_images || existingBanner.banner_images;
  //     existingBanner.banner_url = updatedBanner.banner_url || existingBanner.banner_url;

  //     // Save the updated banner entity
  //     await existingBanner.save();

  //     // Prepare and return the response
  //     const responseData = {
  //       updated_banner: existingBanner,
  //     };

  //     return responseData;
  //   } catch (error) {
  //     console.error('Error updating banner:', error);
  //     throw error;
  //   }
  // }

  // async updateBannerById(bannerId: number, updatedBanner: any, fileNames: string[]): Promise<any> {
  //   try {
  //     const existingBanner = await this.BannerModel.findOne({
  //       where: { id: bannerId, deleted_at: null },
  //     });

  //     if (!existingBanner) {
  //       throw new Error('Banner not found');
  //     }

  //     // Update all fields with the provided data
  //     existingBanner.product_id = updatedBanner.product_id || existingBanner.product_id;
  //     existingBanner.banner_type = updatedBanner.banner_type || existingBanner.banner_type;
  //     existingBanner.promo_code_id = updatedBanner.promo_code_id || existingBanner.promo_code_id;
  //     existingBanner.banner_images = fileNames || existingBanner.banner_images;
  //     existingBanner.banner_url = updatedBanner.banner_url || existingBanner.banner_url;

  //     // Save the updated banner entity
  //     await existingBanner.save();

  //     // Return the updated banner entity
  //     return existingBanner;
  //   } catch (error) {
  //     console.error('Error updating banner:', error);
  //     throw error;
  //   }
  // }
}
