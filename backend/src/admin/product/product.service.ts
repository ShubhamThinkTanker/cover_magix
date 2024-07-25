import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Products } from './product.schema';
import { ProductsImage } from './productImage.schema';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Categories } from '../categories/categories.schema';
import { ProductsFeatures } from './productFeatures.schema';
import { FabricsMaterial } from '../fabric/fabricMaterial.schema';
import { Tie_Down } from '../tie_downs/tie_downs.schema';
import { Grommets } from '../grommets/grommets.schema';
import { Air_bags } from '../air_bags/air_bags.schema';
import slugify from 'slugify';
import { Order } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { ProductsFeaturesMaster } from './productFeatureMaster.schema';
import { ProductsMeasurement } from './product_measurement.schema ';
import {
  InputData,
  Measurement,
  MeasurementData,
} from './interfaces/product.measurement';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Products) private productModel: typeof Products,
    @InjectModel(ProductsImage)
    private ProductsImageModel: typeof ProductsImage,
    @InjectModel(ProductsFeatures)
    private productFeaturesModel: typeof ProductsFeatures,
    @InjectModel(ProductsFeaturesMaster)
    private productFeactureMasterModel: typeof ProductsFeaturesMaster,
    @InjectModel(ProductsMeasurement)
    private productsMeasurementModel: typeof ProductsMeasurement,
    @InjectModel(Tie_Down) private tiedownModel: typeof Tie_Down,
    @InjectModel(Grommets) private grommetsModel: typeof Grommets,
    @InjectModel(FabricsMaterial)
    private fabricMaterialModel: typeof FabricsMaterial,
    @InjectModel(Air_bags) private AirBagsModel: typeof Air_bags,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) {}

  async ProductNameExist(reqBody) {
    try {
      const products = await this.productModel.findOne({
        where: { product_name: reqBody.product_name, deleted_at: null },
        raw: true,
        nest: true,
      });

      return products;
    } catch (error) {
      throw error;
    }
  }

  @ActivityLogger.createLog('Products', 'Create')
  async createProduct(reqUser: any, reqBody: any): Promise<Products> {
    try {
      const {
        category_id,
        sub_category_id,
        product_name,
        description,
        product_slug_url,
        product_price,
        rating,
      } = reqBody;

      // Check if a product with the same product_slug_url already exists
      const existingProduct = await this.productModel.findOne({
        where: { product_name: product_name },
      });

      if (existingProduct) {
        throw new Error('This Product is already exists.');
      }

      // Create a new product using Sequelize's create method
      const newProduct = await this.productModel.create({
        category_id: category_id,
        sub_category_id: sub_category_id,
        product_name: product_name,
        product_slug_url: product_slug_url,
        description: description,
        product_price: product_price,
        rating: rating,
        created_at: new Date(),
      });

      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new BadRequestException(
        error.message || 'Could not create product.',
      );
    }
  }

  @ActivityLogger.createLog('Product Features', 'Create')
  async CreateProductFeatures(reqUser: any , data: any): Promise<ProductsFeatures> {
    try {
      const { product_id, grommet_id, tie_down_id, fabric_id } = data;
      if (product_id) {
        return this.productFeaturesModel.create({
          product_id,
          grommet_id,
          tie_down_id,
          fabric_id,
        });
      } else {
        throw new Error('This Product is not available');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Error creating product features');
    }
  }

  async GetAllProductsFeatures(reqbody) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      if (filter_value) {
        whereClause[Op.or] = [
          { product_name: { [Op.like]: `%${filter_value}%` } },
          { description: { [Op.like]: `%${filter_value}%` } },
          // Add more fields if needed for filtering
        ];
      }

      const { count, rows } = await ProductsFeatures.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Products,
            as: 'product',
            attributes: [
              'id',
              'category_id',
              'sub_category_id',
              'product_name',
              'description',
              'product_price',
              'meta_data',
              'created_at',
            ],
          },
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      // Map and fetch fabric, tie down, and grommet data for each product feature
      const mappedFeatures = await Promise.all(
        rows.map(async (feature) => {
          const fabric = feature.fabric_id
            ? await FabricsMaterial.findAll({
                where: { id: feature.fabric_id },
              })
            : null;
          const tieDown = feature.tie_down_id
            ? await Tie_Down.findAll({ where: { id: feature.tie_down_id } })
            : null;
          const grommet = feature.grommet_id
            ? await Grommets.findAll({ where: { id: feature.grommet_id } })
            : null;

          const fabricWithAttributes = fabric
            ? fabric.map(
                ({
                  id,
                  fabric_id,
                  color_name,
                  color,
                  fabric_image,
                  created_at,
                  updated_at,
                  deleted_at,
                }) => ({
                  id,
                  fabric_id,
                  color_name,
                  color,
                  fabric_image,
                }),
              )
            : [];

          // Add created_at, updated_at, and deleted_at attributes to tieDown objects
          const tieDownWithAttributes = tieDown
            ? tieDown.map(
                ({
                  id,
                  tie_down_name,
                  price,
                  tie_down_image,
                  created_at,
                  updated_at,
                  deleted_at,
                }) => ({
                  id,
                  tie_down_name,
                  price,
                  tie_down_image,
                }),
              )
            : [];

          // Add created_at, updated_at, and deleted_at attributes to grommet objects
          const grommetWithAttributes = grommet
            ? grommet.map(
                ({
                  id,
                  grommet_name,
                  price,
                  grommet_image,
                  created_at,
                  updated_at,
                  deleted_at,
                }) => ({
                  id,
                  grommet_name,
                  price,
                  grommet_image,
                }),
              )
            : [];

          return {
            id: feature.id,
            product: feature.product,
            fabric: fabricWithAttributes,
            tie_down: tieDownWithAttributes,
            grommet: grommetWithAttributes,
            meta_data: feature.meta_data,
          };
        }),
      );

      return {
        totalRecords: count,
        Product_Features_list: mappedFeatures,
      };
    } catch (error) {
      console.error('Error fetching all product features:', error);
      throw error;
    }
  }

  // async createProductImages(
  //   reqUser: any,
  //   createTiwDownDto: any,
  //   fileName: any,
  // ) {
  //   try {
  //     const { product_id } = createTiwDownDto;

  //     const existingProductImage = await this.ProductsImageModel.findOne({
  //       where: { product_id: product_id },
  //     });

  //     if (existingProductImage) {
  //       // Update the existing product image
  //       const updatedProductImage = await this.ProductsImageModel.update(
  //         {
  //           product_image: [...existingProductImage.product_image, fileName].flat(),
  //           updated_at: new Date(),
  //         },
  //         {
  //           where: { product_id: product_id, deleted_at: null },
  //         },
  //       );

  //       return updatedProductImage; // Return the result of update operation
  //     } else {
  //       // Create a new product image
  //       const newProductImage = await this.ProductsImageModel.create({
  //         product_id: product_id,
  //         product_image: fileName,
  //         created_at: new Date(),
  //       });

  //       return newProductImage; // Return the newly created product image
  //     }
  //   } catch (error) {
  //     console.error('Error creating Product Image:', error);
  //     throw new BadRequestException('Could not create Product Image.');
  //   }
  // }

  @ActivityLogger.createLog('Product Images', 'Create')
  async createProductImages(
    reqUser,
    createProductImageDto,
    filesWithId,
    defaultFilesWithId,
  ) {
    try {
      const { product_id } = createProductImageDto;
      const generatedIds = filesWithId.map((file) => file.id); // Extract UUIDs from filesWithId
      const defaultImageGeneratedIds = defaultFilesWithId.map(
        (file) => file.id,
      ); // Extract UUIDs from defaultFilesWithId

      const existingProductImage = await this.ProductsImageModel.findOne({
        where: { product_id: product_id },
      });

      if (existingProductImage) {
        const newImages = filesWithId.map((file, index) => ({
          id: file.id,
          fileName: file.fileName,
        }));

        const newDefaultImages = defaultFilesWithId.map((file, index) => ({
          id: file.id,
          fileName: file.fileName,
        }));

        const updatedProductImage = await this.ProductsImageModel.update(
          {
            product_image: [
              ...existingProductImage.product_image,
              ...newImages,
            ].flat(),

            // default_image: [
            //   ...existingProductImage.default_image, // update images everytime as we only need 2 default images
            //   ...newDefaultImages
            // ].flat(),

            updated_at: new Date(),
          },
          { where: { product_id: product_id, deleted_at: null } },
        );

        const updatedDefaultProductImage = await this.ProductsImageModel.update(
          {
            default_image: [
              // ...existingProductImage.default_image,
              ...newDefaultImages,
            ].flat(),
            updated_at: new Date(),
          },
          { where: { product_id: product_id, deleted_at: null } },
        );

        return {
          newImages,
          newDefaultImages,
          generatedIds,
          defaultImageGeneratedIds,
        }; // Return both newImages and generatedIds
      } else {
        const newImages = filesWithId.map((file) => ({
          id: file.id,
          fileName: file.fileName,
        }));

        const newDefaultImages = defaultFilesWithId.map((file) => ({
          id: file.id,
          fileName: file.fileName,
        }));

        const newProductImage = await this.ProductsImageModel.create({
          product_id: product_id,
          product_image: newImages,
          // add how_to_measure soon
          // how_to_measure: 'how_to_measure',
          default_image: newDefaultImages,
          created_at: new Date(),
        });

        return {
          newImages,
          newDefaultImages,
          generatedIds,
          defaultImageGeneratedIds,
        }; // Return both newImages and generatedIds
      }
    } catch (error) {
      console.error('Error creating Product Image:', error);
      throw new BadRequestException('Could not create Product Image.');
    }
  }

  // async GetAllProductsImage(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'id';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
  //     let filter_value = reqbody.search || '';
  //     let offset =
  //       parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;

  //     let order = [[order_column, sort_order]]; // Properly structured order array

  //     let whereClause = { deleted_at: null }; // Assuming deleted_at field

  //     if (filter_value) {
  //       whereClause[Op.or] = [
  //         { category_name: { [Op.like]: `%${filter_value}%` } },
  //       ];
  //     }

  //     const { count, rows } = await this.ProductsImageModel.findAndCountAll({
  //       where: whereClause,
  //       attributes: [
  //         'id', 'product_id', 'product_image'
  //       ],
  //       offset: offset,
  //       // order: order,
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     const modifiedRows = rows.map((row) => {
  //       row.product_image = `${process.env.ProductS3Url}/${row.product_image}`;
  //       return row;
  //     });

  //     return {
  //       totalRecords: count,
  //       Product_Images_list: modifiedRows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error; // Rethrow the error to handle it in the calling code
  //   }
  // }

  // async GetAllProductsImage(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'id';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
  //     let filter_value = reqbody.search || '';
  //     let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;

  //     let order = [[order_column, sort_order]];
  //     let whereClause = { deleted_at: null };

  //     if (filter_value) {
  //       whereClause[Op.or] = [
  //         { category_name: { [Op.like]: `%${filter_value}%` } },
  //       ];
  //     }

  //     const { count, rows } = await this.ProductsImageModel.findAndCountAll({
  //       where: whereClause,
  //       attributes: ['id', 'product_id', 'product_image'],
  //       offset: offset,
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     const modifiedRows = rows.map((row) => {
  //       // Check if ProductS3Url is an array
  //       //onst productS3Url = Array.isArray(process.env.ProductS3Url) ? process.env.ProductS3Url[0] : process.env.ProductS3Url;
  //       row.product_image = [`${process.env.ProductS3Url}/${row.product_image}`];
  //       return row;
  //     });

  //     return {
  //       totalRecords: count,
  //       Product_Images_list: modifiedRows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error;
  //   }
  // }

  async subCategoryWiseProductImage(subCategoryId) {
    try {
      // Retrieve productid for the productImage
      const products = await Products.findAll({
        where: { sub_category_id: subCategoryId, deleted_at: null },
        attributes: ['product_name'],
        include: [{ model: ProductsImage, attributes: ['default_image'] }],
        raw: true,
        nest: true,
      });
      console.log(products);
      return products;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async GetAllProductsImage(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];
      let whereClause = { deleted_at: null };

      if (filter_value) {
        whereClause[Op.or] = [
          { category_name: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await this.ProductsImageModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'product_id',
          'product_image',
          'default_image',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map((row) => {
        const productImages = row.product_image.map((image) => ({
          id: image['id'],
          images: `${process.env.ProductS3Url}/${image['fileName']}`,
        }));
        const defaultImages = row.default_image.map((image) => ({
          id: image['id'],
          images: `${process.env.ProductS3Url}/${image['fileName']}`,
        }));
        return {
          ...row,
          product_image: productImages,
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

  async ProductImagesByID(id) {
    try {
      // Assuming Category is your Sequelize model
      const productImages = await this.ProductsImageModel.findOne({
        where: { product_id: id },
        attributes: [
          'id',
          'product_id',
          'product_image',
          'created_at',
          'updated_at',
        ],
        raw: true,
        nest: true,
      });

      const modifiedRows = {
        id: productImages.id,
        product_id: productImages.product_id,
        product_image: productImages.product_image.map((image) => ({
          id: image['id'],
          images: `${process.env.ProductS3Url}/${image['fileName']}`,
        })),
      };

      return modifiedRows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Product Images', 'Delete')
  async deleteProductImageById( reqUser: any, product_id: number, image_id: string) {
    try {
      const existingProductImage = await this.ProductsImageModel.findOne({
        where: { product_id: product_id },
      });

      if (
        existingProductImage &&
        existingProductImage.product_image &&
        existingProductImage.product_image.length > 0
      ) {
        // Filter out the image with the specified ID
        existingProductImage.product_image =
          existingProductImage.product_image.filter(
            (image) => image['id'] !== image_id,
          );

        // Update the record in the database
        await existingProductImage.save();
        console.log('Image removed successfully');
        // Prepare response
        const responseData = {
          remaining_images: existingProductImage.product_image,
        };
        return responseData;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // async allProductListing(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'product_name';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
  //     let filter_value = reqbody.search || '';
  //     let offset =
  //       parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;

  //     let order: Order = [[order_column, sort_order]]; // Properly structured order array

  //     let whereClause = { deleted_at: null }; // Assuming deleted_at field

  //     if (filter_value) {
  //       whereClause[Op.or] = [
  //         { product_name: { [Op.like]: `%${filter_value}%` } },
  //       ];
  //     }

  //     console.log(filter_value, ':whereClause');

  //     const { count, rows } = await Products.findAndCountAll({
  //       where: whereClause,
  //       include: [
  //         { model: Categories, attributes: ['category_name'] },
  //         { model: Sub_Categories, attributes: ['sub_category_name'] },
  //       ],
  //       attributes: [
  //         'id',
  //         'category_id',
  //         'sub_category_id',
  //         'product_name',
  //         'description',
  //         'product_slug_url',
  //         'product_price',
  //         'meta_data',
  //         'created_at',
  //         'updated_at'
  //       ],
  //       offset: offset,
  //       order: order,
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     return {
  //       totalRecords: count,
  //       Product_listing: rows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error; // Rethrow the error to handle it in the calling code
  //   }
  // }

  async allProductListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'product_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { product_name: { [Op.like]: `%${filter_value}%` } },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'product_name' || key === 'product_price' || key === 'created_at' || key === 'updated_at') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (
              key === 'product_name' ||
              key === 'product_price' ||
              key === 'created_at' ||
              key === 'updated_at'
            ) {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await Products.findAndCountAll({
        where: whereClause,
        include: [
          { model: Categories, attributes: ['category_name'] },
          { model: Sub_Categories, attributes: ['sub_category_name'] },
        ],
        attributes: [
          'id',
          'category_id',
          'sub_category_id',
          'product_name',
          'description',
          'product_slug_url',
          'product_price',
          'meta_data',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const formattedRows = rows.map((row) => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
      }));

      return {
        totalRecords: count,
        Product_listing: formattedRows,
      };
    } catch (error) {
      console.log('Error:', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async ProductsById(reqUser, id) {
    try {
      const data = await this.productModel.findOne({
        where: { id, deleted_at: null },
        attributes: [
          'id',
          'category_id',
          'sub_category_id',
          'product_name',
          'description',
          'product_slug_url',
          'product_price',
          'meta_data',
          'created_at',
          'updated_at',
        ],
      });
      if (!data) {
        throw new Error('product not found');
      }

      // Format timestamps
      const formattedData = {
        ...data.get(), // Get the raw data object
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at)),
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Products', 'Delete')
  async deleteProduct(reqUser, id) {
    try {
      const productImages = await this.ProductsImageModel.update(
        { deleted_at: new Date() },
        {
          where: { product_id: id },
          returning: true,
        },
      );

      const productFeatures = await this.productFeaturesModel.update(
        { deleted_at: new Date() },
        {
          where: { product_id: id },
          returning: true,
        },
      );

      const AirBags = await this.AirBagsModel.update(
        { deleted_at: new Date() },
        {
          where: { product_id: id },
          returning: true,
        },
      );

      const product = await this.productModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true, // To return the updated row
        },
      );
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Products', 'Update')
  async updateProduct(reqUser, id, reqBody) {
    try {
      const existingProduct = await this.productModel.findOne({
        where: { product_name: reqBody.product_name },
      });

      if (existingProduct) {
        throw new Error('This Product is already exists.');
      }

      const updatedProduct = await this.productModel.update(
        {
          category_id: reqBody.category_id,
          sub_category_id: reqBody.sub_category_id,
          product_name: reqBody.product_name?.trim(),
          product_slug_url: reqBody.product_slug_url,
          description: reqBody.description?.trim(),
          product_price: reqBody.product_price,
          updated_at: new Date(),
        },
        {
          returning: true,
          where: { id: id, deleted_at: null },
        },
      );

      // The updatedCategory variable contains the number of affected rows
      // and possibly the updated rows if the "returning" option is set.

      return updatedProduct;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allProductsListingVL(reqUser) {
    try {
      var data = await Products.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'product_name'],
        order: [['product_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((product) => {
        return { value: product?.id, label: product?.product_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async allProductImagesListingVL(reqUser) {
    try {
      var data = await ProductsImage.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'product_id', 'product_image'],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((product) => {
        return {
          value: product?.id,
          label: {
            product_id: product?.product_id,
            product_image: product?.product_image,
          },
        };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  // async CreateProductFeaturesMaster(data: any): Promise<ProductsFeaturesMaster> {
  //   try {
  //     const { product_id, modules, features, custom_fields } = data
  //     if (product_id) {
  //       return this.productFeactureMasterModel.create({
  //         product_id, modules, features, custom_fields
  //       });
  //     } else {
  //       throw new Error('This Product is not available');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error('Error creating product features');
  //   }
  // }

  @ActivityLogger.createLog('Product Features Master', 'Create')
  async CreateProductFeaturesMaster(
    reqUser: any,
    data: any,
  ): Promise<ProductsFeaturesMaster> {
    try {
      const { product_id, modules, features, custom_fields } = data;

      // Check if a record with the given product_id already exists
      const existingRecord = await this.productFeactureMasterModel.findOne({
        where: { product_id },
      });

      if (existingRecord) {
        // If the record exists, update it
        await existingRecord.update({
          modules,
          features,
          custom_fields,
        });
        return existingRecord;
      } else {
        // If the record does not exist, create a new one
        return this.productFeactureMasterModel.create({
          product_id,
          modules,
          features,
          custom_fields,
        });
      }
    } catch (error) {
      console.log(error);
      throw new Error('Error creating or updating product features');
    }
  }

  async allProductFeaturesMasterListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      if (filter_value) {
        whereClause[Op.or] = [
          { product_name: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await ProductsFeaturesMaster.findAndCountAll({
        where: whereClause,
        include: [{ model: Products, attributes: ['id'] }],
        attributes: [
          'id',
          'product_id',
          'modules',
          'features',
          'custom_fields',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      return {
        totalRecords: count,
        Product_listing: rows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async ProductFeaturesMasterById(id) {
    try {
      const products = await this.productFeactureMasterModel.findAll({
        where: { product_id: id },
        attributes: [
          'id',
          'product_id',
          'modules',
          'features',
          'custom_fields',
          'created_at',
          'updated_at',
        ],
        raw: true,
        nest: true,
      });

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  calculateArea(data: InputData) {
    const { product_measurement, extra_material, material_price } = data;
    let total_area_sq_inches = 0;

    product_measurement.forEach((shape: MeasurementData) => {
      Object.values(shape).forEach((shapeData: Measurement) => {
        const { Height, Width, Depth } = shapeData;
        const area_sq_inches =
          2 * (Height * Width + Height * Depth + Width * Depth);
        total_area_sq_inches += area_sq_inches;
      });
    });

    const area_sq_meters = total_area_sq_inches * 0.00064516;
    const total_material_sq_meters = area_sq_meters * (1 + extra_material);
    const cost = total_material_sq_meters * material_price;

    return {
      area_sq_inches: total_area_sq_inches.toFixed(2),
      area_sq_meters: area_sq_meters.toFixed(2),
      total_material_sq_meters: total_material_sq_meters.toFixed(2),
      cost: cost.toFixed(2),
    };
  }

  // async productMeasurements(data: InputData): Promise<any> {
  //     try {
  //         const { product_id, product_measurement, extra_material, material_price, type } = data;

  //         if (!product_id) {
  //             throw new Error('Product ID is not provided');
  //         }
  //         const result = this.calculateArea(data);

  //         const createMeasurement = await this.productsMeasurementModel.create({
  //                 product_id,
  //                 product_measurement,
  //                 extra_material: extra_material.toString(),
  //                 material_price: material_price.toString(),
  //                 type,
  //                 area_sq_inches: result.area_sq_inches,
  //                 area_sq_meters: result.area_sq_meters,
  //                 total_material_sq_meters: result.total_material_sq_meters,
  //                 cost: result.cost,
  //               });

  //         return {
  //             product : createMeasurement.product_id,
  //             area_sq_inches: result.area_sq_inches,
  //             area_sq_meters: result.area_sq_meters,
  //             total_material_sq_meters: result.total_material_sq_meters,
  //             cost: result.cost
  //         };
  //     } catch (error) {
  //         throw new Error('Error calculating product measurement');
  //     }
  // }

  @ActivityLogger.createLog('Product Measurements', 'Create')
  async productMeasurements(reqUser: any , data: InputData): Promise<any> {
    try {
      const {
        product_id,
        product_measurement,
        extra_material,
        material_price,
        type,
      } = data;

      if (!product_id) {
        throw new Error('Product ID is not provided');
      }

      // Calculate the area and other values
      const result = this.calculateArea(data);

      // Check if a measurement already exists for this product_id
      const existingMeasurement = await this.productsMeasurementModel.findOne({
        where: { product_id },
      });

      let createOrUpdateMeasurement;

      if (existingMeasurement) {
        // Update the existing measurement
        await this.productsMeasurementModel.update(
          {
            product_measurement,
            extra_material: extra_material.toString(),
            material_price: material_price.toString(),
            type,
            area_sq_inches: result.area_sq_inches,
            area_sq_meters: result.area_sq_meters,
            total_material_sq_meters: result.total_material_sq_meters,
            cost: result.cost,
            updated_at: new Date(),
          },
          { where: { product_id } },
        );

        // Retrieve the updated measurement
        createOrUpdateMeasurement = await this.productsMeasurementModel.findOne(
          { where: { product_id } },
        );
      } else {
        // Create a new measurement
        createOrUpdateMeasurement = await this.productsMeasurementModel.create({
          product_id,
          product_measurement,
          extra_material: extra_material.toString(),
          material_price: material_price.toString(),
          type,
          area_sq_inches: result.area_sq_inches,
          area_sq_meters: result.area_sq_meters,
          total_material_sq_meters: result.total_material_sq_meters,
          cost: result.cost,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        });
      }

      return {
        product_id: createOrUpdateMeasurement.product_id,
        area_sq_inches: result.area_sq_inches,
        area_sq_meters: result.area_sq_meters,
        total_material_sq_meters: result.total_material_sq_meters,
        cost: result.cost,
      };
    } catch (error) {
      console.error('Error calculating product measurement:', error);
      throw new Error('Error calculating product measurement');
    }
  }

  async allProductMeasurementsListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      if (filter_value) {
        whereClause[Op.or] = [
          { product_name: { [Op.like]: `%${filter_value}%` } },
        ];
      }

      const { count, rows } = await ProductsMeasurement.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Products,
            attributes: ['id', 'product_name', 'product_slug_url'],
          },
        ],
        attributes: [
          'id',
          'area_sq_inches',
          'area_sq_meters',
          'total_material_sq_meters',
          'cost',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      return {
        totalRecords: count,
        Product_listing: rows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async productMeasurementsById(user, id) {
    try {
      const products = await this.productsMeasurementModel.findAll({
        where: { id: id },
        include: [
          {
            model: Products,
            attributes: ['id', 'product_name', 'product_slug_url'],
          },
        ],
        attributes: [
          'id',
          'area_sq_inches',
          'area_sq_meters',
          'total_material_sq_meters',
          'cost',
          'created_at',
          'updated_at',
        ],
        raw: true,
        nest: true,
      });

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allTrendingProductsListingVL() {
    try {
      const products = await Products.findAll({
        where: { deleted_at: null, rating: { [Op.gte]: 4 } },
        attributes: ['id', 'product_name', 'rating'],
        include: [{ model: ProductsImage, attributes: ['product_image'] }],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = products?.map((product) => {
        return {
          value: product?.id,
          label: {
            product_id: product?.id,
            product_name: product?.product_name,
            product_image: product?.images,
            ratings: product?.rating,
          },
        };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async filterProducts(
    sortByName?: boolean,
    minPrice?: number,
    maxPrice?: number,
    rating?: number,
  ): Promise<Products[]> {
    const where: any = {};

    if (minPrice) {
      where.product_price = { [Op.gte]: minPrice };
    }

    if (maxPrice) {
      where.product_price = where.product_price
        ? { ...where.product_price, [Op.lte]: maxPrice }
        : { [Op.lte]: maxPrice };
    }

    if (rating) {
      where.rating = rating;
    }

    const options: any = {
      where,
      include: [
        { model: ProductsImage, attributes: ['product_image'], as: 'images' },
      ],
    };

    if (sortByName) {
      options.order = [['product_name', 'ASC']];
    }

    options.attributes = [
      'id',
      'product_name',
      'description',
      'product_price',
      'created_at',
    ];

    return this.productModel.findAll(options);
  }

  //Export Excel
  async ExportExcel() {
    try {
      // product data
      const ProductData = await this.productModel.findAll({
        where: { deleted_at: null },
        attributes: [
          'id',
          'category_id',
          'sub_category_id',
          'product_name',
          'description',
          'product_slug_url',
          'product_price',
          'meta_data',
          'created_at',
        ],
      });

      // product image data
      const ProductsImageData = await this.ProductsImageModel.findAll({
        where: { deleted_at: null },
        attributes: ['product_image', 'product_id'],
      });

      // product measurement data
      const ProductsMeasurementData =
        await this.productsMeasurementModel.findAll({
          where: { deleted_at: null },
          attributes: [
            'product_id',
            'product_measurement',
            'type',
            'material_price',
            'extra_material',
            'area_sq_inches',
            'area_sq_meters',
            'total_material_sq_meters',
            'cost',
          ],
        });

      //Product Features Master data
      const ProductFeatureMasterData =
        await this.productFeactureMasterModel.findAll({
          where: { deleted_at: null },
          attributes: ['product_id', 'modules', 'features', 'custom_fields'],
        });

      // Map product images
      const productImageMap = ProductsImageData.reduce((map, imgData) => {
        let images;
        try {
          images =
            typeof imgData.product_image === 'string'
              ? JSON.parse(imgData.product_image)
              : imgData.product_image;
        } catch (error) {
          images = [];
        }
        map[imgData.product_id] = images;
        return map;
      }, {});

      // Map productmeasurements
      const productMeasurementMap = ProductsMeasurementData.reduce(
        (map, measurementData) => {
          const productId = measurementData.product_id;
          let measurements;
          try {
            measurements =
              typeof measurementData.product_measurement === 'string'
                ? JSON.parse(measurementData.product_measurement)
                : measurementData.product_measurement;
          } catch (error) {
            measurements = [];
          }
          if (!map[productId]) {
            map[productId] = [];
          }
          map[productId].push({
            ...measurementData.dataValues,
            product_measurement: measurements,
          });
          return map;
        },
        {},
      );

      //Map productFeaturesMaster
      const productFeatureMasterMap = ProductFeatureMasterData.reduce(
        (map, featureData) => {
          const productId = featureData.product_id;
          const dataValues: any = featureData.dataValues;
          dataValues.custom_fields = JSON.parse(dataValues.custom_fields);
          map[productId] = dataValues;
          return map;
        },
        {},
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Products');

      const headers = [
        { header: 'No', width: 20 },
        { header: 'category_id', key: 'category_id', width: 50 },
        { header: 'sub_category_id', key: 'sub_category_id', width: 50 },
        { header: 'product_name', key: 'product_name', width: 50 },
        { header: 'description', key: 'description', width: 50 },
        { header: 'product_slug_url', key: 'product_slug_url', width: 50 },
        { header: 'product_price', key: 'product_price', width: 50 },
        { header: 'meta_data', key: 'meta_data', width: 50 },
        { header: 'product_image_id', key: 'product_image_id', width: 50 },
        {
          header: 'product_image_fileName',
          key: 'product_image_fileName',
          width: 50,
        },
        {
          header: 'product_measurement',
          key: 'product_measurement',
          width: 50,
        },
        { header: 'type', key: 'type', width: 20 },
        { header: 'material_price', key: 'material_price', width: 20 },
        { header: 'extra_material', key: 'extra_material', width: 50 },
        { header: 'area_sq_inches', key: 'area_sq_inches', width: 50 },
        { header: 'area_sq_meters', key: 'area_sq_meters', width: 50 },
        {
          header: 'total_material_sq_meters',
          key: 'total_material_sq_meters',
          width: 50,
        },
        { header: 'cost', key: 'cost', width: 50 },
        { header: 'modules', key: 'modules', width: 50 },
        { header: 'features', key: 'features', width: 50 },
        { header: 'custom_fields', key: 'custom_fields', width: 50 },
      ];

      worksheet.columns = headers;

      ProductData.forEach((data, index) => {
        const productImages = productImageMap[data.id] || [];
        const productMeasurement = productMeasurementMap[data.id] || [];
        const productFeatureMaster = productFeatureMasterMap[data.id] || {};
        productImages.forEach((imgObj: { id: string; fileName: string }) => {
          const { id, fileName } = imgObj;

          productMeasurement.forEach((measurement: any) => {
            const customFields = productFeatureMaster.custom_fields || [];

            const row = worksheet.addRow([
              index + 1,
              data.category_id,
              data.sub_category_id,
              data.product_name,
              data.description,
              data.product_slug_url,
              data.product_price,
              data.meta_data,
              id,
              fileName,
              measurement.product_measurement || '',
              measurement.type || '',
              measurement.material_price || '',
              measurement.extra_material || '',
              measurement.area_sq_inches || '',
              measurement.area_sq_meters || '',
              measurement.total_material_sq_meters || '',
              measurement.cost || '',
              productFeatureMaster.modules || '',
              productFeatureMaster.features || '',
              customFields || '',
            ]);

            const fileNameCell = row.getCell('product_image_fileName');

            fileNameCell.value = {
              text: fileName,
              hyperlink: `https://covermagix.s3.ap-south-1.amazonaws.com/upload/Product/${encodeURIComponent(fileName)}`,
            };

            fileNameCell.style = {
              ...fileNameCell.style,
              font: {
                color: { argb: 'FF0000FF' }, // Blue color for the hyperlink
                underline: true,
              },
            };
          });
        });
      });

      // await workbook.xlsx.writeFile(filePath);
      const Buffer = await workbook.xlsx.writeBuffer();

      console.log('Excel file written successfully.');
      return Buffer;
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }

  async findProductForUserPanel(id) {
    try {
      const findProduct = await this.productModel.findAll({
        where: { id: id },
        include: [
          {
            model: ProductsImage,
            where: { product_id: id },
          },
          // {
          //   model: ProductsFeaturesMaster,
          //   where: { product_id: id },
          // },
        ],
        raw: true, // Set to false to get full Sequelize instances
      });

      return findProduct;
      console.log(findProduct, '::::::::::::findProduct');
    } catch (error) {
      throw error;
    }
  }
}
