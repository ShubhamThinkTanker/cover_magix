import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Sub_Categories } from './sub_categories.schema';
import { Categories } from '../categories/categories.schema';
import { Products } from '../product/product.schema';
import slugify from 'slugify';
import { Order } from 'sequelize';
import { ProductsImage } from '../product/productImage.schema';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(Sub_Categories) private subcategoryModel: typeof Sub_Categories,
    @InjectModel(Products) private ProductModel: typeof Products,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) { }

  async SubCategoryNameExist(reqBody) {
    try {
      const categories = await this.subcategoryModel.findOne({
        where: { sub_category_name: reqBody.sub_category_name, deleted_at: null },
        raw: true,
        nest: true,
      });

      return categories;
    } catch (error) {
      throw error;
    }
  }

  @ActivityLogger.createLog('SubCategory', 'Create')
  async createCategory(
    reqUser: any,
    createSubCategoryDto: any,
    fileName: any,
  ): Promise<Sub_Categories> {
    try {
      const { category_id, sub_category_name, sub_catetgory_slug_url, description } = createSubCategoryDto;

      // const sub_category_name_slug_url = slugify(sub_category_name, { lower: true });
      // console.log(sub_category_name_slug_url)


      // Create a new category using Sequelize's create method
      const newSubCategory = await this.subcategoryModel.create({
        category_id: category_id,
        sub_category_name: sub_category_name,
        sub_catetgory_slug_url: sub_catetgory_slug_url,
        sub_category_image: fileName,
        description: description,
        created_at: new Date()
      });

      return newSubCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new BadRequestException('Could not create category.');
    }
  }

  // async allSubCategoryListing(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'sub_category_name';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
  //     let filter_value = reqbody.search || '';
  //     let offset =
  //       parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;


  //     let order: Order = [[order_column, sort_order]]; // Properly structured order array

  //     let whereClause = { deleted_at: null }; // Assuming deleted_at field

  //     if (filter_value) {
  //       whereClause[Op.or] = [
  //         { sub_category_name: { [Op.like]: `%${filter_value}%` }, deleted_at: null },

  //       ];
  //     }

  //     const { count, rows } = await Sub_Categories.findAndCountAll({
  //       where: whereClause,
  //       include: [
  //         { model: Categories, attributes: ['category_name'] }
  //       ],
  //       attributes: ['id', 'category_id', 'sub_category_name', 'sub_catetgory_slug_url', 'created_at','updated_at'],
  //       offset: offset,
  //       order: order,
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     return {
  //       totalRecords: count,
  //       Sub_Categorie_listing: rows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error; // Rethrow the error to handle it in the calling code
  //   }
  // }

  async allSubCategoryListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'sub_category_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]];

      let whereClause = { deleted_at: null };

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { sub_category_name: { [Op.like]: `%${filter_value}%` }, deleted_at: null },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'sub_category_name' || key === 'category_id') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      // let categoryFilter = {};
      // if (Array.isArray(reqbody.filter_value)) {
      //   reqbody.filter_value.forEach(filter => {
      //     if (filter.category_name) {
      //       categoryFilter = {
      //         category_name: {
      //           [Op.like]: `%${filter.category_name}%`
      //         }
      //       };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'sub_category_name' || key === 'category_id') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }
  
      let categoryFilter = {};
      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        if (reqbody.filter_value.category_name) {
          categoryFilter = {
            category_name: {
              [Op.like]: `%${reqbody.filter_value.category_name}%`
            }
          };
        }
      }

      const { count, rows } = await Sub_Categories.findAndCountAll({
        where: whereClause,
        include: [
          { model: Categories, 
            attributes: ['category_name'] , 
            where: categoryFilter
          }
        ],
        attributes: ['id', 'category_id', 'sub_category_name', 'sub_catetgory_slug_url', 'sub_category_image', 'description', 'created_at', 'updated_at'],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      // Format timestamps
      const modifiedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
        sub_category_image: `${process.env.CategorySubcategoryS3Url}/${row.sub_category_image}`
      }));

      return {
        totalRecords: count,
        Sub_Categorie_listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async SubCategoriesById(reqUser, id) {
    try {
      const data = await this.subcategoryModel.findOne({ where: { id, deleted_at: null }, attributes: ['id', 'category_id', 'sub_category_name', 'sub_catetgory_slug_url', 'created_at', 'updated_at'] });

      if (!data) {
        throw new Error('Subcategory not found');
      }

      // Format timestamps
      const formattedData = {
        ...data.get(), // Get the raw data object
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at))
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('SubCategory', 'Delete')
  async deleteSubCategorie(reqUser, id) {
    try {

      const Product = await this.ProductModel.update(
        { deleted_at: new Date() },
        {
          where: { category_id: id },
          returning: true,
        }
      );

      const Subcategory = await this.subcategoryModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true // To return the updated row
        }
      );
      return Subcategory
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('SubCategory', 'Update')
  async updateSubCategories(reqUser, id, reqBody, file) {
    try {
      // const sub_category_name_slug_url = slugify(reqBody.sub_category_name?.trim(), { lower: true });
      // console.log(sub_category_name_slug_url)
      const updatedSubCategory = await this.subcategoryModel.update(
        {
          category_id: reqBody.category_id,
          sub_category_name: reqBody.sub_category_name?.trim(),
          sub_catetgory_slug_url: reqBody.sub_catetgory_slug_url,
          sub_category_image: file,
          updated_at: new Date()
        },
        {
          returning: true,
          where: { id: id, deleted_at: null }
        }
      );

      // The updatedCategory variable contains the number of affected rows
      // and possibly the updated rows if the "returning" option is set.

      return updatedSubCategory;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allSubCategoriesListingVL(reqUser) {
    try {
      var data = await Sub_Categories.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'sub_category_name'],
        order: [['sub_category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map(subcategory => {
        return { value: subcategory?.id, label: subcategory?.sub_category_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async SubCategoriesListingVLByID(reqUser, id) {
    try {
      var data = await Sub_Categories.findAll({
        where: { id: id, deleted_at: null },
        attributes: ['id', 'sub_category_name'],
        order: [['sub_category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map(subcategory => {
        return { value: subcategory?.id, label: subcategory?.sub_category_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async getSubcategoryWiseProducts(subCategoryId) {
    try {
      // Retrieve subcategories for the category
      const products = await Products.findAll({
        where: { sub_category_id: subCategoryId, deleted_at: null },
        attributes: ['id', 'product_name', 'product_slug_url', 'product_price'],
        include: [{ model: ProductsImage, attributes: ['product_image'] }],
        raw: true,
        nest: true,
      });

      const product = products.map(product => ({
        value: product.id,
        label: {
          product: product?.product_name,
          product_slug: product?.product_slug_url,
          price: product?.product_price,
          images: product?.images
        }
      }))

      return product;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  //Export Excel
  async ExportExcel() {
    try {
      const SubCategoryData = await this.subcategoryModel.findAll({
        where: {
          deleted_at: null
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('SubCategories');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Category ID', key: 'category_id', width: 30 },
        { header: 'Sub Category Name', key: 'sub_category_name', width: 20 },
        { header: 'Sub Category Slug URL', key: 'sub_catetgory_slug_url', width: 20 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = SubCategoryData.map((filedata, index) => ({
        id: index + 1,
        category_id: filedata.category_id,
        sub_category_name: filedata.sub_category_name,
        sub_catetgory_slug_url: filedata.sub_catetgory_slug_url,
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach(data => {
        worksheet.addRow([
          data.id,
          data.category_id,
          data.sub_category_name,
          data.sub_catetgory_slug_url,
          data.created_at,
          data.updated_at
        ]);
      });

      // await workbook.xlsx.writeFile(filePath);

      const Buffer = await workbook.xlsx.writeBuffer();

      console.log("Excel file written successfully.");
      return Buffer;
    } catch (error) {
      throw error;
    }
  }
}
