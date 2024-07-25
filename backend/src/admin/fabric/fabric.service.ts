import { BadRequestException, Injectable } from '@nestjs/common';
import { Fabrics } from './fabric.schema';
import { FabricsMaterial } from './fabricMaterial.schema';
import { Model } from 'sequelize-typescript';
import { Op, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from 'sequelize';
import * as ExcelJS from 'exceljs';
import { formatTimestamp } from 'Helper/dateFormat';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
interface FabricData extends Fabrics {
  fabric_images: Array<{
    id: number;
    fabric_id: number;
    color_name: string;
    color: string;
    fabric_image: string;
  }>;
}
@Injectable()
export class FabricService {
  constructor(
    @InjectModel(Fabrics) private fabricModel: typeof Fabrics,
    @InjectModel(FabricsMaterial)
    private fabricsMaterialModel: typeof FabricsMaterial,
    @InjectModel(ActivityLog) private ActivityLogModel: typeof ActivityLog,
    private activityLogService: ActivityLogService,
    private acivityLogger : ActivityLogger
  ) { }

  async FabricNameExist(reqBody) {
    try {
      const Fabric = await this.fabricModel.findOne({
        where: { fabric_name: reqBody.fabric_name },
        raw: true,
        nest: true,
      });

      return Fabric;
    } catch (error) {
      throw error;
    }
  }

  @ActivityLogger.createLog('Fabrics', 'Create')
  async CreateFabric(reqUser: any, createFabricDto: any): Promise<Fabrics> {
    try {
      const {
        fabric_name,
        material,
        ideal_for,
        feature,
        water_proof,
        uv_resistant,
        weight,
        warranty,
        fabric_type,
      } = createFabricDto;

      // Create a new category using Sequelize's create method
      const newCategory = await this.fabricModel.create({
        fabric_name: fabric_name,
        material: material,
        ideal_for: ideal_for,
        feature: feature,
        water_proof: water_proof,
        uv_resistant: uv_resistant,
        weight: weight,
        warranty: warranty,
        fabric_type: fabric_type,
        created_at: new Date(),
      });

      return newCategory;
    } catch (error) {
      console.error('Error creating Fabric:', error);
      throw new BadRequestException('Could not create Fabric.');
    }
  }

  @ActivityLogger.createLog('Fabric Material', 'Create')
  async createFabricMaterial(
    reqUser: any,
    createTiwDownDto: any,
    fileName: any,
  ): Promise<FabricsMaterial> {
    try {
      const { fabric_id, color_name, color, color_suggestions } = createTiwDownDto;

      // Create a new category using Sequelize's create method
      const newFabricMaterial = await this.fabricsMaterialModel.create({
        fabric_id: fabric_id,
        color_name: color_name,
        color: color,
        color_suggestions: color_suggestions,
        fabric_image: fileName,
        created_at: new Date(),
      });

      return newFabricMaterial;
    } catch (error) {
      console.error('Error creating Fabric Material:', error);
      throw new BadRequestException('Could not create Fabric Material.');
    }
  }


  // async FabricsMaterialById(fabric_id) {
  //   var data = await this.fabricsMaterialModel.findOne({
  //     where: { fabric_id, deleted_at: null },
  //     attributes: [
  //       'id',
  //       'fabric_id',
  //       'color_name',
  //       'color',
  //       'fabric_image',
  //     ],
  //     raw: true,
  //     nest: true,
  //   });

  //   // if (data) {
  //   //   var findMaterial = await this.fabricsMaterialModel.findAll({
  //   //     where: { fabric_id: id },
  //   //     attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image'],
  //   //     raw: true,
  //   //     nest: true,
  //   //   });

  //   //   // Function to prepend URL to fabric image URLs
  //   //   function prependUrlToFabricImages(images, baseUrl) {
  //   //     return images.map((image) => ({
  //   //       ...image,
  //   //       fabric_image: `${baseUrl}/${image.fabric_image}`,
  //   //     }));
  //   //   }

  //   //   // Prepend URL to fabric images
  //   //   const modifiedFabricImages = prependUrlToFabricImages(
  //   //     findMaterial,
  //   //     process.env.fabricMaterialS3Url,
  //   //   );

  //   //   // Add fabric images to the data object
  //   //   (data as FabricData).fabric_images = modifiedFabricImages;

  //   //   return data;
  //   // }

  //   return data;
  // }

  async FabricsMaterialById(fabricId) {
    try {
      const fabricMaterial = await this.fabricsMaterialModel.findAll({
        where: { fabric_id: fabricId, deleted_at: null },
        attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image', 'color_suggestions', 'created_at', 'updated_at'],
        raw: true,
        nest: true,
      });

      const modifiedRows = fabricMaterial.map((row) => {
        row.fabric_image = `${process.env.FabricS3Url}/${row.fabric_image}`;
        row.color = `${row.color}`;
        row.color_name = `${row.color_name}`;
        return row;
      });

      return modifiedRows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async allFabricMaterialsFind(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'id';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   whereClause[Op.or] = reqbody.filter_value.map(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     return { [key]: { [Op.like]: `%${value}%` } };
      //   });
      // }

      if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
        reqbody.filter_value.forEach(filter => {
          const key = Object.keys(filter)[0];
          const value = filter[key];
          if (key === 'fabric_id' || key === 'color_suggestions' || key === 'color' || key === 'created_at' || key === 'updated_at') {
            whereClause[key] = { [Op.like]: `%${value}%` };
          }
        });
      }

      const { count, rows } = await this.fabricsMaterialModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'fabric_id',
          'color_name',
          'color',
          'fabric_image',
          'color_suggestions',
          'created_at',
          'updated_at'
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      const modifiedRows = rows.map((row) => {
        row.fabric_image = `${process.env.FabricS3Url}/${row.fabric_image}`;
        row.color = `${row.color}`;
        row.color_name = `${row.color_name}`;
        row.createdAt = `${row.created_at}`;
        row.updatedAt = `${row.updated_at}`;
        return row;
      });

      return {
        totalRecords: count,
        Febric_Listing: modifiedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  @ActivityLogger.createLog('Fabric Material', 'Delete')
  async deletefabricMaterial(reqUser,id) {
    try {
      // Assuming Category is your Sequelize model
      const fabricMaterial = await this.fabricsMaterialModel.destroy({
        where: { id: id, deleted_at: null },
      });

      return fabricMaterial;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async FindfabricMaterial(id) {
    try {
      // Assuming Category is your Sequelize model
      const fabricMaterial = await this.fabricsMaterialModel.findOne({
        where: { id, deleted_at: null },
        attributes: ['fabric_image'],
        raw: true,
        nest: true,
      });

      return fabricMaterial;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async FabricById(id) {
    try {
      const data = await this.fabricModel.findOne({
        where: { id, deleted_at: null },
        attributes: ['id', 'fabric_name', 'material', 'ideal_for', 'feature', 'water_proof', 'uv_resistant', 'weight', 'warranty', 'fabric_type', 'created_at', 'updated_at'],
      });

      if (!data) {
        throw new Error('Fabric not found');
      }

      // Function to prepend URL to fabric image URLs
      function prependUrlToFabricImages(images, baseUrl) {
        return images.map((image) => ({
          ...image,
          fabric_image: `${baseUrl}/${image.fabric_image}`,
        }));
      }

      // Fetch fabric images
      const fabricImages = await this.fabricsMaterialModel.findAll({
        where: { fabric_id: id },
        attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image', 'color_suggestions'],
        raw: true,
      });

      // Prepend URL to fabric images
      const modifiedFabricImages = prependUrlToFabricImages(fabricImages, process.env.fabricMaterialS3Url);

      // Format timestamps and modify the data object
      const formattedData = {
        id: data.id,
        fabric_name: data.fabric_name,
        material: data.material,
        ideal_for: data.ideal_for,
        feature: data.feature,
        water_proof: data.water_proof,
        uv_resistant: data.uv_resistant,
        weight: data.weight,
        warranty: data.warranty,
        fabric_type: data.fabric_type,
        created_at: formatTimestamp(new Date(data.created_at)),
        updated_at: formatTimestamp(new Date(data.updated_at)),
        fabric_images: modifiedFabricImages,
      };

      return formattedData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allFabricFind(reqbody, reqUser) {
    try {
      let order_column = reqbody.order_column || 'fabric_name';
      let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC'; // Assuming order_direction is 'desc' or 'asc'
      let filter_value = reqbody.search || '';
      let offset =
        parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
      let limit = parseInt(reqbody.per_page) || 5;

      let order: Order = [[order_column, sort_order]]; // Properly structured order array

      let whereClause = { deleted_at: null }; // Assuming deleted_at field

      // if (filter_value) {
      //   whereClause[Op.or] = [
      //     { fabric_name: { [Op.like]: `%${filter_value}%` } },
      //   ];
      // }

      // if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
      //   reqbody.filter_value.forEach(filter => {
      //     const key = Object.keys(filter)[0];
      //     const value = filter[key];
      //     if (key === 'fabric_name' || key === 'material' || key === 'ideal_for' || key === 'feature' || key === 'water_proof' || key === 'uv_resistant' || key === 'weight' || key === 'warranty' || key === 'fabric_type' || key === 'created_at' || key === 'updated_at') {
      //       whereClause[key] = { [Op.like]: `%${value}%` };
      //     }
      //   });
      // }

      if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
        for (const key in reqbody.filter_value) {
          if (reqbody.filter_value.hasOwnProperty(key)) {
            const value = reqbody.filter_value[key];
            if (key === 'fabric_name' || key === 'material' || key === 'ideal_for' || key === 'feature' || key === 'water_proof' || key === 'uv_resistant' || key === 'weight' || key === 'warranty' || key === 'fabric_type' || key === 'created_at' || key === 'updated_at') {
              whereClause[key] = { [Op.like]: `%${value}%` };
            }
          }
        }
      }

      const { count, rows } = await this.fabricModel.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'fabric_name',
          'material',
          'ideal_for',
          'feature',
          'water_proof',
          'uv_resistant',
          'weight',
          'warranty',
          'fabric_type',
          'created_at',
          'updated_at'
        ],
        offset: offset,
        order: order,
        limit: limit,
        raw: true,
        nest: true,
      });

      // Format timestamps
      const formattedRows = rows.map(row => ({
        ...row,
        created_at: formatTimestamp(new Date(row.created_at)),
        updated_at: formatTimestamp(new Date(row.updated_at))
      }));

      return {
        totalRecords: count,
        Febric_Listing: formattedRows,
      };
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Fabrics', 'Delete')
  async deleteFabric(reqUser, id) {
    try {
      // Assuming Category is your Sequelize model
      const FabricDelete = await this.fabricModel.update(
        { deleted_at: new Date() },
        {
          where: { id },
          returning: true, // To return the updated row
        },
      );

      await this.fabricsMaterialModel.update(
        { deleted_at: new Date() },
        {
          where: { fabric_id: id },
          returning: true, // To return the updated row
        },
      );

      return FabricDelete;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async allFabricListingVL(reqUser) {
    try {
      var data = await Fabrics.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'fabric_name'],
        order: [['fabric_name', 'ASC']],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((fabric) => {
        return { value: fabric?.id, label: fabric?.fabric_name };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  async allFabricMaterialsListingVL(reqUser) {
    try {
      var data = await FabricsMaterial.findAll({
        where: { deleted_at: null },
        attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image', 'color_suggestions'],
        raw: true,
        nest: true,
      });

      const valueLabelPairs = data?.map((fabricMaterial) => {
        return { value: fabricMaterial?.id, label: { fabric_id: fabricMaterial?.fabric_id, color_name: fabricMaterial?.color_name, color: fabricMaterial?.color, fabric_image: fabricMaterial?.fabric_image, color_suggestions: fabricMaterial?.color_suggestions } };
      });

      return valueLabelPairs;
    } catch (error) {
      console.log('Error : ', error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  }

  @ActivityLogger.createLog('Fabrics', 'Update')
  async updateFabric(reqUser, id, reqBody) {
    try {
      const updateFabric = await this.fabricModel.update(
        {
          fabric_name: reqBody.fabric_name?.trim(),
          material: reqBody.material?.trim(),
          ideal_for: reqBody.ideal_for?.trim(),
          feature: reqBody.feature?.trim(),
          warranty: reqBody.warranty?.trim(),
          weight: reqBody.weight?.trim(),
          water_proof: reqBody?.water_proof,
          uv_resistant: reqBody.uv_resistant,
          fabric_type: reqBody.fabric_type,
        },
        {
          returning: true,
          where: { id: id, deleted_at: null },
        },
      );

      // The updatedCategory variable contains the number of affected rows
      // and possibly the updated rows if the "returning" option is set.

      return updateFabric;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @ActivityLogger.createLog('Fabric Material', 'Update')
  async updateFabricMaterial(reqUser, id, reqBody, file) {
    try {
      const updateFabricMaterial = await this.fabricsMaterialModel.update(
        {
          fabric_id: reqBody.fabric_id,
          color_name: reqBody.color_name?.trim(),
          color: reqBody.color?.trim(),
          fabric_image: file,
          color_suggestions: reqBody.color_suggestions,
        },
        { where: { id: id } }
      );
      return updateFabricMaterial;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async ExportExcel() {
    try {
      const FabricData = await this.fabricModel.findAll({
        where: {
          deleted_at: null
        },
        attributes: ['fabric_name', 'material', 'ideal_for', 'feature', 'water_proof', 'uv_resistant', 'weight', 'warranty', 'fabric_type'],
      });

      const FabricMaterialData = await this.fabricsMaterialModel.findAll({
        where: {
          deleted_at: null
        },
        attributes: ['color_name', 'color', 'fabric_image', 'color_suggestions']
      })

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fabrics');

      // Add headers
      const headers = [
        { header: 'No', width: 20 },
        { header: 'Fabric Name', key: 'fabric_name', width: 50 },
        { header: 'Material', key: 'material', width: 50 },
        { header: 'Ideal For', key: 'ideal_for', width: 50 },
        { header: 'Feature', key: 'feature', width: 50 },
        { header: 'Water Proof', key: 'water_proof', width: 20 },
        { header: 'UV Resistant', key: 'uv_resistant', width: 20 },
        { header: 'Weight', key: 'weight', width: 20 },
        { header: 'Warranty', key: 'warranty', width: 20 },
        { header: 'Fabric Type', key: 'fabric_type', width: 20 },
        { header: 'Fabric Color Name', key: 'color_name', width: 20 },
        { header: 'Fabric Color', key: 'color', width: 20 },
        { header: 'Fabric Image', key: 'fabric_image', width: 50 },
        { header: 'Fabric Color Suggestions', key: 'color_suggestions', width: 50 },
      ];

      worksheet.columns = headers;

      // Add data
      FabricData.forEach((data, index) => {
        const fabricMaterial = FabricMaterialData[index % FabricMaterialData.length];
        const fabricMaterials = FabricMaterialData.filter(material => material.fabric_id === data.id);
        const fabricColorSuggestions = Array.isArray(fabricMaterial.color_suggestions) ? fabricMaterial.color_suggestions : [];

        if (fabricMaterials) {
          const imageCell = worksheet.addRow([
            index + 1,
            data.fabric_name,
            data.material,
            data.ideal_for,
            data.feature,
            data.water_proof,
            data.uv_resistant,
            data.weight,
            data.warranty,
            data.fabric_type,
            fabricMaterial.color_name,
            fabricMaterial.color,
            fabricMaterial.fabric_image,
            fabricColorSuggestions
          ]).getCell('fabric_image');

          imageCell.value = {
            text: fabricMaterial.fabric_image,
            hyperlink: 'https://covermagix.s3.ap-south-1.amazonaws.com/upload/Fabric/' + encodeURIComponent(fabricMaterial.fabric_image)
          };

          imageCell.style = {
            ...imageCell.style,
            font: {
              color: { argb: 'FF0000FF' }, // Blue color for the hyperlink //red : FF0000
              underline: true
            }
          };
        }
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
