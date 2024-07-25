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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const createorder_dto_1 = require("./dto/createorder.dto");
const commonResponse_1 = require("../../../Helper/commonResponse");
let OrderController = exports.OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(createOrderDto, req, res) {
        try {
            const createdOrder = await this.orderService.createOrder(createOrderDto);
            if (createdOrder) {
                return new commonResponse_1.Success(res, 200, createdOrder, '🎉 Order Created Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'Something went wrong during order creation');
            }
        }
        catch (error) {
            console.error('Create Order Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getAllOrderList(req, res) {
        try {
            const orderListing = await this.orderService.allOrderListing(req.user, req.body);
            if (orderListing) {
                return new commonResponse_1.Success(res, 200, orderListing, '🎉 All Orders Listed Successfully!');
            }
            else {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'Something went wrong');
            }
        }
        catch (error) {
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async getByIdOrderList(id, req, res) {
        try {
            if (!req.user) {
                return new commonResponse_1.CustomErrorResponse(res, 401, 'Invalid User login', 'Invalid Login credential');
            }
            const ListData = await this.orderService.getOrderById(req.user, id);
            if (!ListData) {
                return new commonResponse_1.CustomErrorResponse(res, 500, 'AirBags not found', 'AirBagID doesnot found in database');
            }
            return new commonResponse_1.Success(res, 200, ListData, '🔍 AirBags Found Successfully!');
        }
        catch (error) {
            console.log('Create Block Error -> ', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async deleteOrderById(orderId, req, res) {
        try {
            await this.orderService.deleteOrderById(req.user, orderId);
            return new commonResponse_1.Success(res, 200, {}, 'Order deleted successfully!');
        }
        catch (error) {
            if (error) {
                return new commonResponse_1.CustomErrorResponse(res, 404, 'Order not found', error.message);
            }
            console.error('Error:', error);
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
    async findByStatus(order_status, req, res) {
        try {
            if (!order_status) {
                return new commonResponse_1.CustomResponse(res, 400, {}, 'order_status is required');
            }
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(order_status)) {
                return new commonResponse_1.CustomResponse(res, 400, {}, `Invalid order status: ${order_status}`);
            }
            const result = await this.orderService.findByStatus(order_status);
            return new commonResponse_1.CustomResponse(res, 200, result, 'Success');
        }
        catch (error) {
            return new commonResponse_1.CustomCatchBlockErrorMessage(res, 500, error.toString(), 'Something went wrong');
        }
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createorder_dto_1.CreateOrderDto,
        Request,
        Response]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getAllOrderList", null);
__decorate([
    (0, common_1.Get)('list/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Response]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getByIdOrderList", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Response]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrderById", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Body)('order_status')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request, Response]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findByStatus", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map