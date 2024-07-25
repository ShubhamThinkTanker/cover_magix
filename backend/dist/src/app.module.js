"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_config_1 = require("../Helper/sequelize.config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./admin/auth/auth.module");
const categories_module_1 = require("./admin/categories/categories.module");
const dotenv_1 = require("dotenv");
const sub_categories_module_1 = require("./admin/sub_categories/sub_categories.module");
const grommets_module_1 = require("./admin/grommets/grommets.module");
const tie_downs_module_1 = require("./admin/tie_downs/tie_downs.module");
const fabric_module_1 = require("./admin/fabric/fabric.module");
const deck_type_module_1 = require("./admin/deck_type/deck_type.module");
const product_module_1 = require("./admin/product/product.module");
const air_bags_module_1 = require("./admin/air_bags/air_bags.module");
const auth_module_2 = require("./admin/user_auth/auth.module");
const zipper_module_1 = require("./admin/zipper/zipper.module");
const rating_module_1 = require("./admin/rating/rating.module");
const order_module_1 = require("./admin/order/order.module");
const promo_code_module_1 = require("./admin/promo_code/promo_code.module");
const banners_module_1 = require("./admin/banners/banners.module");
(0, dotenv_1.config)();
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forRoot(sequelize_config_1.sequelizeConfig),
            auth_module_1.AuthModule,
            categories_module_1.CategoryModule,
            sub_categories_module_1.SubCategoriesModule,
            grommets_module_1.GrommetsModule,
            tie_downs_module_1.TieDownsModule,
            fabric_module_1.FabricModule,
            deck_type_module_1.DeckTypeModule,
            product_module_1.ProductModule,
            air_bags_module_1.AirBagsModule,
            auth_module_2.UserAuthModule,
            zipper_module_1.ZipperModule,
            rating_module_1.RatingModule,
            order_module_1.OrderModule,
            promo_code_module_1.PromoCodeModule,
            banners_module_1.BannersModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map