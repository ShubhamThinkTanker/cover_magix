"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FabricService = void 0;
const common_1 = require("@nestjs/common");
const fabric_schema_1 = require("./fabric.schema");
const fabricMaterial_schema_1 = require("./fabricMaterial.schema");
const sequelize_1 = require("sequelize");
const sequelize_2 = require("@nestjs/sequelize");
const ExcelJS = require("exceljs");
const dateFormat_1 = require("../../../Helper/dateFormat");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
let FabricService = exports.FabricService = class FabricService {
    constructor(fabricModel, fabricsMaterialModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.fabricModel = fabricModel;
        this.fabricsMaterialModel = fabricsMaterialModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async FabricNameExist(reqBody) {
        try {
            const Fabric = await this.fabricModel.findOne({
                where: { fabric_name: reqBody.fabric_name },
                raw: true,
                nest: true,
            });
            return Fabric;
        }
        catch (error) {
            throw error;
        }
    }
    async CreateFabric(reqUser, createFabricDto) {
        try {
            const { fabric_name, material, ideal_for, feature, water_proof, uv_resistant, weight, warranty, fabric_type, } = createFabricDto;
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
        }
        catch (error) {
            console.error('Error creating Fabric:', error);
            throw new common_1.BadRequestException('Could not create Fabric.');
        }
    }
    async createFabricMaterial(reqUser, createTiwDownDto, fileName) {
        try {
            const { fabric_id, color_name, color, color_suggestions } = createTiwDownDto;
            const newFabricMaterial = await this.fabricsMaterialModel.create({
                fabric_id: fabric_id,
                color_name: color_name,
                color: color,
                color_suggestions: color_suggestions,
                fabric_image: fileName,
                created_at: new Date(),
            });
            return newFabricMaterial;
        }
        catch (error) {
            console.error('Error creating Fabric Material:', error);
            throw new common_1.BadRequestException('Could not create Fabric Material.');
        }
    }
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
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async allFabricMaterialsFind(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'id';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (Array.isArray(reqbody.filter_value) && reqbody.filter_value.length > 0) {
                reqbody.filter_value.forEach(filter => {
                    const key = Object.keys(filter)[0];
                    const value = filter[key];
                    if (key === 'fabric_id' || key === 'color_suggestions' || key === 'color' || key === 'created_at' || key === 'updated_at') {
                        whereClause[key] = { [sequelize_1.Op.like]: `%${value}%` };
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async deletefabricMaterial(reqUser, id) {
        try {
            const fabricMaterial = await this.fabricsMaterialModel.destroy({
                where: { id: id, deleted_at: null },
            });
            return fabricMaterial;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async FindfabricMaterial(id) {
        try {
            const fabricMaterial = await this.fabricsMaterialModel.findOne({
                where: { id, deleted_at: null },
                attributes: ['fabric_image'],
                raw: true,
                nest: true,
            });
            return fabricMaterial;
        }
        catch (error) {
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
            function prependUrlToFabricImages(images, baseUrl) {
                return images.map((image) => ({
                    ...image,
                    fabric_image: `${baseUrl}/${image.fabric_image}`,
                }));
            }
            const fabricImages = await this.fabricsMaterialModel.findAll({
                where: { fabric_id: id },
                attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image', 'color_suggestions'],
                raw: true,
            });
            const modifiedFabricImages = prependUrlToFabricImages(fabricImages, process.env.fabricMaterialS3Url);
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
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
                fabric_images: modifiedFabricImages,
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allFabricFind(reqbody, reqUser) {
        try {
            let order_column = reqbody.order_column || 'fabric_name';
            let sort_order = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filter_value = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[order_column, sort_order]];
            let whereClause = { deleted_at: null };
            if (reqbody.filter_value && typeof reqbody.filter_value === 'object') {
                for (const key in reqbody.filter_value) {
                    if (reqbody.filter_value.hasOwnProperty(key)) {
                        const value = reqbody.filter_value[key];
                        if (key === 'fabric_name' || key === 'material' || key === 'ideal_for' || key === 'feature' || key === 'water_proof' || key === 'uv_resistant' || key === 'weight' || key === 'warranty' || key === 'fabric_type' || key === 'created_at' || key === 'updated_at') {
                            whereClause[key] = { [sequelize_1.Op.like]: `%${value}%` };
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
            const formattedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at))
            }));
            return {
                totalRecords: count,
                Febric_Listing: formattedRows,
            };
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async deleteFabric(reqUser, id) {
        try {
            const FabricDelete = await this.fabricModel.update({ deleted_at: new Date() }, {
                where: { id },
                returning: true,
            });
            await this.fabricsMaterialModel.update({ deleted_at: new Date() }, {
                where: { fabric_id: id },
                returning: true,
            });
            return FabricDelete;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async allFabricListingVL(reqUser) {
        try {
            var data = await fabric_schema_1.Fabrics.findAll({
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
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async allFabricMaterialsListingVL(reqUser) {
        try {
            var data = await fabricMaterial_schema_1.FabricsMaterial.findAll({
                where: { deleted_at: null },
                attributes: ['id', 'fabric_id', 'color_name', 'color', 'fabric_image', 'color_suggestions'],
                raw: true,
                nest: true,
            });
            const valueLabelPairs = data?.map((fabricMaterial) => {
                return { value: fabricMaterial?.id, label: { fabric_id: fabricMaterial?.fabric_id, color_name: fabricMaterial?.color_name, color: fabricMaterial?.color, fabric_image: fabricMaterial?.fabric_image, color_suggestions: fabricMaterial?.color_suggestions } };
            });
            return valueLabelPairs;
        }
        catch (error) {
            console.log('Error : ', error);
            throw error;
        }
    }
    async updateFabric(reqUser, id, reqBody) {
        try {
            const updateFabric = await this.fabricModel.update({
                fabric_name: reqBody.fabric_name?.trim(),
                material: reqBody.material?.trim(),
                ideal_for: reqBody.ideal_for?.trim(),
                feature: reqBody.feature?.trim(),
                warranty: reqBody.warranty?.trim(),
                weight: reqBody.weight?.trim(),
                water_proof: reqBody?.water_proof,
                uv_resistant: reqBody.uv_resistant,
                fabric_type: reqBody.fabric_type,
            }, {
                returning: true,
                where: { id: id, deleted_at: null },
            });
            return updateFabric;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateFabricMaterial(reqUser, id, reqBody, file) {
        try {
            const updateFabricMaterial = await this.fabricsMaterialModel.update({
                fabric_id: reqBody.fabric_id,
                color_name: reqBody.color_name?.trim(),
                color: reqBody.color?.trim(),
                fabric_image: file,
                color_suggestions: reqBody.color_suggestions,
            }, { where: { id: id } });
            return updateFabricMaterial;
        }
        catch (error) {
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
            });
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Fabrics');
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
                            color: { argb: 'FF0000FF' },
                            underline: true
                        }
                    };
                }
            });
            const Buffer = await workbook.xlsx.writeBuffer();
            console.log("Excel file written successfully.");
            return Buffer;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabrics', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "CreateFabric", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabric Material', 'Create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "createFabricMaterial", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabric Material', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "deletefabricMaterial", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabrics', 'Delete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "deleteFabric", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabrics', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "updateFabric", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Fabric Material', 'Update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FabricService.prototype, "updateFabricMaterial", null);
exports.FabricService = FabricService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_2.InjectModel)(fabric_schema_1.Fabrics)),
    __param(1, (0, sequelize_2.InjectModel)(fabricMaterial_schema_1.FabricsMaterial)),
    __param(2, (0, sequelize_2.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], FabricService);
//# sourceMappingURL=fabric.service.js.map