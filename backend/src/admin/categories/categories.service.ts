import { BadRequestException, Injectable } from '@nestjs/common';
import { Categories } from './categories.schema'; // Assuming this is your Sequelize model
import { Model } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
// import { Op, Sequelize } from 'sequelize';
import { Op, Sequelize } from 'sequelize';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Products } from '../product/product.schema';
import slugify from 'slugify';
import { Order } from 'sequelize';
import { ProductsImage } from '../product/productImage.schema';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';

class UpdatePositionDto {
  id: number;
  old_position: number;
  new_position: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories) private categoryModel: typeof Categories,
    @InjectModel(Sub_Categories)
    private SubCategoryModel: typeof Sub_Categories,
    @InjectModel(Products) private ProductModel: typeof Products,
  ) { }

  // async createCategory(
  //   reqUser: any,
  //   reqBody: any,
  // ): Promise<Categories> {
  //   try {
  //     const { category_name, status, include_store_menu, category_slug_url, description } = reqBody;

  //     const addPosition = await this.categoryModel.findAll({
  //       where: {
  //         include_store_menu: 1,
  //       },
  //     });

  //     // Create a new category using Sequelize's create method
  //     const newCategory = await this.categoryModel.create({
  //       category_name: category_name,
  //       category_slug_url: category_slug_url,
  //       description: description,
  //       status: status,
  //       include_store_menu: include_store_menu,
  //       created_at: new Date(),
  //     });

  //     return newCategory;
  //   } catch (error) {
  //     console.error('Error creating category:', error);
  //     throw new BadRequestException('Could not create category.');
  //   }
  // }

  async createCategory(reqUser: any, CreateCategory: any, fileName: string): Promise<Categories> {
    const { category_name, status, include_store_menu, category_slug_url, description } = CreateCategory;

    let position = include_store_menu === '0' ? 0 : 1;

    if (include_store_menu === '0') {
      const storeMenuCategories = await this.categoryModel.findAll({
        where: {
          include_store_menu: 0,
        },
        order: [['Position', 'DESC']],
        limit: 1,
        attributes: ['Position'],
      });

      if (storeMenuCategories.length > 0) {
        position = storeMenuCategories[0].Position + 1;
      }
    }

    return this.categoryModel.create({
      category_name,
      category_slug_url,
      category_image: fileName,
      description,
      status,
      include_store_menu,
      Position: position,
      created_at: new Date(),
    });
  }

  async categoryNameExist(reqBody) {
    try {
      const categories = await this.categoryModel.findOne({
        where: { category_name: reqBody.category_name, deleted_at: null },
        raw: true,
        nest: true,
      });

      return categories;
    } catch (error) {
      throw error;
    }
  }

  // async allCategoryListing(reqbody, reqUser) {
  //   try {
  //     let order_column = reqbody.order_column || 'category_name';
  //     let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
  //     let filter_value = reqbody.search || '';
  //     let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
  //     let limit = parseInt(reqbody.per_page) || 5;

  //     let orders = [[order_column, sort_order]];// Properly structured order array

  //     let whereClause = { deleted_at: null }; // Assuming deleted_at field

  //     // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
  //     //   whereClause[Op.or] = reqbody.filter_value.map(filter => {
  //     //     const key = Object.keys(filter)[0];
  //     //     const value = filter[key];
  //     //     return { [key]: { [Op.like]: `%${value}%` } };
  //     //   });
  //     // }

  //     // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
  //     //   reqbody.filter_value.forEach(filter => {
  //     //     const key = Object.keys(filter)[0];
  //     //     const value = filter[key];
  //     //     if (key === 'category_name' || key === 'status' || key === 'include_store_menu' || key === 'position' || key === 'created_at' || key === 'updated_at') {
  //     //       whereClause[key] = { [Op.like]: `%${value}%` };
  //     //     }
  //     //   });
  //     // }

  //     if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
  //       for (const key in reqbody.filter_value) {
  //         if (reqbody.filter_value.hasOwnProperty(key)) {
  //           const value = reqbody.filter_value[key];
  //           if (key === 'category_name' || key === 'status' || key === 'include_store_menu' || key === 'position' || key === 'created_at' || key === 'updated_at') {
  //             whereClause[key] = { [Op.like]: `%${value}%` };
  //           }
  //         }
  //       }
  //     }

  //     const { count, rows } = await Categories.findAndCountAll({
  //       where: whereClause,
  //       attributes: [
  //         'id',
  //         'category_name',
  //         'status',
  //         'include_store_menu',
  //         'category_image',
  //         'description',
  //         'position',
  //         'category_slug_url',
  //         'created_at',
  //         'updated_at'
  //       ],
  //       offset: offset,
  //       order: [['category_name', 'ASC']], // Ensure order is by category_name ascending
  //       limit: limit,
  //       raw: true,
  //       nest: true,
  //     });

  //     const modifiedRows = rows.map(row => ({
  //       ...row,
  //       created_at: formatTimestamp(new Date(row.created_at)),
  //       updated_at: formatTimestamp(new Date(row.updated_at)),
  //       category_image: `${process.env.CategorySubcategoryS3Url}/${row.category_image}`
  //     }));

  //     return {
  //       totalRecords: count,
  //       Category_listing: modifiedRows,
  //     };
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error; // Rethrow the error to handle it in the calling code
  //   }
  // }

  async allCategoryListing(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'category_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;
      let type = reqbody.type;

      let order: Order = [[order_column, sort_order]];

      // Define whereClause with an index signature to allow dynamic properties
      let whereClause: {
        [key: string]: any;
        deleted_at: null | any;
        [Op.or]?: any;
      } = { deleted_at: null };

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (
              key === 'category_name' ||
              key === 'status' ||
              key === 'include_store_menu' ||
              key === 'position' ||
              key === 'created_at' ||
              key === 'updated_at'
            ) {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      if (type === 2) {
        (whereClause as any).include_store_menu = 0; // Type assertion to allow dynamic property
        order = [['Position', 'ASC']];
      }

      const { count, rows } = await this.categoryModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'category_name',
          'status',
          'include_store_menu',
          'category_image',
          'description',
          'position',
          'category_slug_url',
          'created_at',
          'updated_at',
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map((row) => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at)),
        category_image: `${process.env.CategorySubcategoryS3Url}/${row.category_image}`,
      }));

      return {
        totalRecords: count,
        Category_listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }

  async CategoriesById(reqUser, id) {
    try {
      const data = await this.categoryModel.findOne({
        where: { id, deleted_at: null },
      });

      if (!data) {
        throw new Error('Category not found');
      }

      // Format timestamps
      const formattedData = {
        ...data.get(), // Get the raw data object
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at)),
        category_image: `${process.env.CategorySubcategoryS3Url}/${data.category_image}`,
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Category', 'Update')
  async updateCategories(reqUser, id, reqBody, file) {
    try {
      const updatedCategory = await this.categoryModel.update(
        {
          category_name: reqBody.category_name?.trim(),
          category_slug_url: reqBody.category_slug_url,
          status: reqBody.status,
          category_image: file,
          Position: reqBody.Position,
          description: reqBody.description,
          include_store_menu: reqBody.include_store_menu,
          updated_at: new Date(),
        },
        {
          returning: true,
          where: { id: id, deleted_at: null },
        },
      );

      // The updatedCategory variable contains the number of affected rows
      // and possibly the updated rows if the "returning" option is set.

      return updatedCategory;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // async updateCategories(reqUser, id, reqBody, file) {
  //   try {
  //     let position = 0; // Default position

  //     // Determine position based on include_store_menu value
  //     if (reqBody.include_store_menu === 0) {
  //       const storeMenuCategories = await this.categoryModel.findAll({
  //         where: {
  //           include_store_menu: 0,
  //         },
  //         order: [['Position', 'DESC']],
  //         limit: 1,
  //         attributes: ['Position']
  //       });

  //       // Increment the position if there are categories with include_store_menu 0
  //       if (storeMenuCategories.length > 0) {
  //         position = storeMenuCategories[0].Position + 1;
  //       }
  //     }

  //     // Update the category
  //     const updatedCategory = await this.categoryModel.update(
  //       {
  //         category_name: reqBody.category_name?.trim(),
  //         category_slug_url: reqBody.category_slug_url,
  //         status: reqBody.status,
  //         category_image: file,
  //         description: reqBody.description,
  //         include_store_menu: reqBody.include_store_menu,
  //         Position: position, // Assign the determined position
  //         updated_at: new Date(),
  //       },
  //       {
  //         returning: true,
  //         where: { id: id, deleted_at: null },
  //       },
  //     );

  //     return updatedCategory;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  @ActivityLogger.createLog('Category', 'Delete')
  async deleteCategorie(reqUser, id) {
    try {
      const Product = await this.ProductModel.update(
        { deleted_at: new Date() },
        {
          where: { category_id: id },
          returning: true,
        },
      );

      const subcategory = await this.SubCategoryModel.update(
        { deleted_at: new Date() },
        {
          where: { category_id: id },
          returning: true,
        },
      );

      // Assuming Category is your Sequelize model
      const category = await this.categoryModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true, // To return the updated row
        },
      );

      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allCategoryListingVL(reqUser) {
    try {
      var data = await Categories.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'category_name'],
        order: [['category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((category) => {
        return { value: category?.id, label: category?.category_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async allCategoryListingVLStatus(reqUser) {
    try {
      var data = await Categories.findAll({
        where: { deleted_at: null, status: 'yes' },
        attributes: ['category_slug_url', 'category_name'],
        order: [['category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((category) => {
        return {
          value: category?.category_slug_url,
          label: category?.category_name,
        };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async getCategoryWithSubcategories(reqUser, categoryId) {
    try {
      // Retrieve subcategories for the category
      const subcategories = await Sub_Categories.findAll({
        where: { category_id: categoryId, deleted_at: null },
        attributes: ['id', 'sub_category_name'],
        order: [['sub_category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const subCategory = subcategories.map((subcategory) => ({
        value: subcategory.id,
        label: subcategory.sub_category_name,
      }));

      return subCategory;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  // async updateCategoryPositions(positions) {
  //   try {
  //     const categoryIds = Object.keys(positions);

  //     // Fetch categories that match the names in the JSON
  //     const categories = await Categories.findAll({
  //       where: {
  //         id: categoryIds,
  //         deleted_at: null
  //       }
  //     });

  //     // Update the Position field for each category
  //     for (const category of categories) {
  //       if (positions[category.id] !== undefined) {
  //         category.Position = positions[category.id];
  //       }
  //     }

  //     const position = await categories.map(category => category.save());

  //     return position;

  //   } catch (error) {
  //     console.log('Error updating category positions:', error);
  //     throw error;
  //   }
  // }

  // async getCategoryWiseProducts(reqUser) {
  //   try {
  //     const categories = await Categories.findAll({
  //       where: { deleted_at: null },
  //       attributes: ['category_name', 'category_slug_url'],
  //       raw: true,
  //       nest: true,
  //     });

  //     // Retrieve subcategories for the category
  //     const subcategories = await Sub_Categories.findAll({
  //       where: { deleted_at: null },
  //       attributes: ['sub_category_name', 'sub_catetgory_slug_url'],
  //       raw: true,
  //       nest: true,
  //     });

  //     const products = await Products.findAll({
  //       where: { deleted_at: null },
  //       attributes: ['product_name', 'product_slug_url'],
  //       raw: true,
  //       nest: true,
  //     });

  //     console.log(products , subcategories , categories , "createdwwwwwwwwwwwwww")

  //     const allCategoryListing = subcategories.map(subcategory => ({
  //       value: subcategory.id,
  //       label: subcategory.sub_category_name
  //     }))

  //     return subcategories;
  //   } catch (error) {
  //     console.log('Error : ', error);
  //     throw error;
  //   }
  // }

  async getCategoryWiseSubcategoriesAndProducts() {
    try {
      const categories = await Categories.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'Position', 'category_name', 'category_slug_url'],
        order: [['category_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const subcategories = await Sub_Categories.findAll({
        where: { deleted_at: null },
        attributes: [
          'id',
          'category_id',
          'sub_category_name',
          'sub_catetgory_slug_url',
        ],
        raw: true,
        nest: true,
      });

      const products = await Products.findAll({
        where: { deleted_at: null },
        attributes: [
          'id',
          'sub_category_id',
          'product_name',
          'product_slug_url',
        ],
        raw: true,
        nest: true,
      });

      // Create a mapping of subcategories by category ID
      const subcategoriesByCategory = subcategories.reduce(
        (acc, subcategory) => {
          const categoryId = subcategory.category_id;
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(subcategory);
          return acc;
        },
        {},
      );

      // Create a mapping of products by subcategory ID
      const productsBySubcategory = products.reduce((acc, product) => {
        const subcategoryId = product.sub_category_id;
        if (!acc[subcategoryId]) {
          acc[subcategoryId] = [];
        }
        acc[subcategoryId].push(product);
        return acc;
      }, {});

      // Construct the response
      const allCategoryListing = categories.map((category) => {
        const subcategories = subcategoriesByCategory[category.id] || [];
        const subcategoriesWithProducts = subcategories.map((subcategory) => {
          const products = productsBySubcategory[subcategory.id] || [];
          return {
            subcategory_slug: {
              value: subcategory.sub_category_name,
              label: subcategory.sub_catetgory_slug_url,
            },
            products: products.map((product) => ({
              value: product.product_name,
              label: product.product_slug_url,
            })),
          };
        });

        return {
          category_slug: {
            position: category.Position,
            value: category.category_name,
            label: category.category_slug_url,
          },
          sub_category: subcategoriesWithProducts,
        };
      });

      return { all_category: categories };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  async getCategoryWiseSubcategoriesAndProductsByID(categoryId) {
    try {
      // Fetch category, subcategories, and products in parallel
      const [categories, subcategories, products] = await Promise.all([
        Categories.findAll({
          where: { id: categoryId, deleted_at: null },
          attributes: ['id', 'Position', 'category_name', 'category_slug_url'],
          raw: true,
          nest: true,
        }),
        Sub_Categories.findAll({
          where: { category_id: categoryId, deleted_at: null },
          attributes: [
            'id',
            'category_id',
            'sub_category_name',
            'sub_catetgory_slug_url',
          ],
          raw: true,
          nest: true,
        }),
        Products.findAll({
          where: { deleted_at: null },
          attributes: [
            'id',
            'sub_category_id',
            'product_name',
            'product_slug_url',
          ],
          raw: true,
          nest: true,
        }),
      ]);

      // Create a mapping of products by subcategory ID
      const productsBySubcategory = products.reduce((acc, product) => {
        const subcategoryId = product.sub_category_id;
        if (!acc[subcategoryId]) {
          acc[subcategoryId] = [];
        }
        acc[subcategoryId].push(product);
        return acc;
      }, {});

      // Create a mapping of subcategories by category ID
      const subcategoriesWithProducts = subcategories.map((subcategory) => {
        const products = productsBySubcategory[subcategory.id] || [];
        return {
          subcategory_slug: {
            value: subcategory.sub_category_name,
            label: subcategory.sub_catetgory_slug_url,
          },
          products: products.map((product) => ({
            value: product.product_name,
            label: product.product_slug_url,
          })),
        };
      });

      // Construct the response
      const allCategoryListing = categories.map((category) => ({
        category_slug: {
          position: category.Position,
          value: category.category_name,
          label: category.category_slug_url,
        },
        sub_category: subcategoriesWithProducts,
      }));

      return { all_category: allCategoryListing };
    } catch (error) {
      console.error('Error fetching category data:', error);
      throw new Error('Error fetching category data');
    }
  }

  async getCategoryWiseProducts(categoryId) {
    try {
      // Retrieve subcategories for the category
      const products = await Products.findAll({
        where: { category_id: categoryId, deleted_at: null },
        attributes: [
          'id',
          'product_name',
          'product_slug_url',
          'product_price',
          'created_at',
          'updated_at',
        ],
        include: [{ model: ProductsImage, attributes: ['product_image'] }],
        raw: true,
        nest: true,
      });

      const product = products.map((product) => ({
        value: product.id,
        label: {
          product: product.product_name,
          product_slug: product.product_slug_url,
          price: product?.product_price,
          images: product?.images,
        },
      }));

      return product;
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  //Export Excel
  async ExportExcel() {
    try {
      const CategoryData = await this.categoryModel.findAll({
        where: {
          deleted_at: null,
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Categories');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Category Name', key: 'category_name', width: 20 },
        { header: 'Category Slug URL', key: 'category_slug_url', width: 20 },
        { header: 'Status', key: 'status', width: 30 },
        { header: 'Include Store Menu', key: 'include_store_menu', width: 30 },
        { header: 'Position', key: 'Position', width: 30 },
        { header: 'Date', key: 'created_at', width: 20 },
        { header: 'Date', key: 'updated_at', width: 20 },
      ];

      worksheet.columns = headers;

      // Add data
      const exportData = CategoryData.map((filedata, index) => ({
        id: index + 1,
        category_name: filedata.category_name,
        category_slug_url: filedata.category_slug_url,
        status: filedata.status,
        include_store_menu: filedata.include_store_menu,
        Position: filedata.Position,
        created_at: filedata.created_at,
        updated_at: filedata.updated_at,
      }));

      exportData.forEach((data) => {
        worksheet.addRow([
          data.id,
          data.category_name,
          data.category_slug_url,
          data.status,
          data.include_store_menu,
          data.Position,
          data.created_at,
          data.updated_at,
        ]);
      });

      // await workbook.xlsx.writeFile(filePath);
      const Buffer = await workbook.xlsx.writeBuffer();

      console.log('Excel file written successfully.');
      return Buffer;
    } catch (error) {
      throw error;
    }
  }

  async positionWiseListing(type?: number) {
    try {
      let categoryData;
      if (type === 2) {
        categoryData = await this.categoryModel.findAll({
          where: {
            include_store_menu: 1,
          },
          order: [['Position', 'ASC']],
        });
      } else {
        categoryData = await this.categoryModel.findAll();
      }
      return categoryData;
    } catch (error) {
      console.error('Error: ', error);
      throw error;
    }
  }

  // async updateCategoryPositions(body: any) {

  //   var findData = await this.categoryModel.findAll({ raw: true })

  //   let categoryToUpdate = findData.find(cat => cat.id === body.id);

  //   // Adjust positions
  //   if (categoryToUpdate) {
  //     let { oldPosition, newPosition } = body;

  //     // Move downwards
  //     if (newPosition > oldPosition) {
  //       findData.forEach(cat => {
  //         if (cat.Position > oldPosition && cat.Position <= newPosition) {
  //           cat.Position -= 1;
  //         }
  //       });
  //     }
  //     // Move upwards
  //     else if (newPosition < oldPosition) {
  //       findData.forEach(cat => {
  //         if (cat.Position < oldPosition && cat.Position >= newPosition) {
  //           cat.Position += 1;
  //         }
  //       });
  //     }

  //     // Update the position of the target category
  //     categoryToUpdate.Position = newPosition;
  //   }

  //   const data = findData.map((index) => {
  //     this.categoryModel.update({ Position: index.Position }, { where: { id: index.id } })
  //   })

  //   return data

  // }

  // async updateCategoryPositions(body: any) {
  //   // Retrieve all categories from the database
  //   const findData = await this.categoryModel.findAll({ raw: true });

  //   // Find the category to update
  //   const categoryToUpdate = findData.find(cat => cat.id === body.id);

  //   if (categoryToUpdate) {
  //     const { oldPosition, newPosition } = body;

  //     // Define the direction of movement
  //     const direction = Math.sign(newPosition - oldPosition);

  //     // Move categories between oldPosition and newPosition
  //     findData.forEach(cat => {
  //       if (cat.Position !== categoryToUpdate.Position) {
  //         if (
  //           (direction === 1 && cat.Position > oldPosition && cat.Position <= newPosition) ||
  //           (direction === -1 && cat.Position < oldPosition && cat.Position >= newPosition)
  //         ) {
  //           cat.Position += direction;
  //         }
  //       }
  //     });

  //     // Update the position of the target category
  //     categoryToUpdate.Position = newPosition;

  //     // Update positions in the database
  //     const promises = findData.map(({ id, Position }) =>
  //       this.categoryModel.update({ Position }, { where: { id } })
  //     );

  //     await Promise.all(promises);
  //   }

  //   // Prepare the response in the desired format
  //   const response = [
  //     { "id": body.id, "oldPosition": body.oldPosition, "newPosition": body.newPosition }
  //   ];

  //   return response;
  // }

  async updateCategoryPositions(body) {
    try {
      // Retrieve the list of categories from the database
      let data = await this.categoryModel.findAll({ raw: true });

      // Extract old and new positions
      const oldPosition = body.oldPosition;
      const newPosition = body.newPosition;

      // Update categories' positions
      const categories = data.map((category) => {
        if (category.id === body.id) {
          return { ...category, Position: newPosition };
        } else if (
          oldPosition < newPosition &&
          category.Position > oldPosition &&
          category.Position <= newPosition
        ) {
          return { ...category, Position: category.Position - 1 };
        } else if (
          oldPosition > newPosition &&
          category.Position >= newPosition &&
          category.Position < oldPosition
        ) {
          return { ...category, Position: category.Position + 1 };
        }
        return category;
      });

      // Update the database with the new positions
      for (const category of categories) {
        await this.categoryModel.update(
          { Position: category.Position },
          { where: { id: category.id } },
        );
      }

      // Collect details of updated categories
      const updatedCategories = categories.filter((category) => {
        if (category.id === body.id) {
          return true;
        } else if (
          oldPosition < newPosition &&
          category.Position >= oldPosition &&
          category.Position <= newPosition
        ) {
          return true;
        } else if (
          oldPosition > newPosition &&
          category.Position >= newPosition &&
          category.Position < oldPosition
        ) {
          return true;
        }
        return false;
      });

      // Generate the response
      const response = updatedCategories.map((category) => {
        return {
          id: category.id,
          oldPosition: oldPosition,
          newPosition: category.Position,
        };
      });

      // Return the response
      return response;
    } catch (error) {
      // Handle error
      console.error(error);
      throw error;
    }
  }

  async AllCategoriesUserMenuBar() {
    try {
      const findAllCategories = await this.categoryModel.findAll({
        where: { status: 1 },
        include: [
          {
            model: this.SubCategoryModel,
            attributes: [
              'id',
              'category_id',
              'sub_category_name',
              'sub_catetgory_slug_url',
              'sub_category_image', // Make sure to include this if needed
            ],
          },
        ],
        attributes: [
          'id',
          'category_name',
          'category_slug_url',
          'include_store_menu',
          'Position',
        ],
        raw: true,
      });

      const allProducts: any[] = [];
      const categoryMap = new Map<number, any>();

      // Assuming `data` is your input data array
      findAllCategories.forEach((item: any) => {
        // Push all items to the allProducts array
        allProducts.push(item);

        const categoryId = item.id;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            category_name: item.category_name,
            category_slug_url: item.category_slug_url,
            include_store_menu: item.include_store_menu,
            Position: item.Position,
            sub_categories: [],
          });
        }

        if (item['sub_categories.id']) {
          // Check if sub-category exists
          const subCategory: any = {
            id: item['sub_categories.id'],
            category_id: item['sub_categories.category_id'],
            sub_category_name: item['sub_categories.sub_category_name'],
            sub_catetgory_slug_url:
              item['sub_categories.sub_catetgory_slug_url'],
            sub_category_image: item['sub_categories.sub_category_image'],
          };

          categoryMap.get(categoryId)!.sub_categories.push(subCategory);
        }
      });

      // Create an array from the categoryMap and sort it by Position
      const sortedCategories: any[] = Array.from(categoryMap.values()).sort(
        (a, b) => (a.Position || 0) - (b.Position || 0),
      );

      // Create the final result array
      const resultArray: any[] = [
        {
          category_name: 'All Products',
          categories: sortedCategories.map((category) => ({
            id: category.id,
            category_name: category.category_name,
            category_slug_url: category.category_slug_url,
            include_store_menu: category.include_store_menu,
            Position: category.Position,
            sub_categories: category.sub_categories,
          })),
        },
      ];

      sortedCategories.forEach((category) => {
        if (category.include_store_menu === 1) {
          resultArray.push({
            category_name: category.category_name,
            Position: category.Position,
            sub_categories: category.sub_categories,
          });
        }
      });

      // console.log(resultArray)

      return resultArray;
    } catch (error) {
      throw error;
    }
  }
}
