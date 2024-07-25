"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const cors_middleware_1 = require("../Helper/cors.middleware");
const cors = require("cors");
const common_2 = require("@nestjs/common");
let MainModule = exports.MainModule = class MainModule {
    configure(consumer) {
        consumer.apply(cors_middleware_1.CorsMiddleware).forRoutes('*');
    }
};
exports.MainModule = MainModule = __decorate([
    (0, common_1.Module)({
        imports: [app_module_1.AppModule],
    })
], MainModule);
async function bootstrap() {
    const app = await core_1.NestFactory.create(MainModule);
    app.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Star Cover')
        .setDescription('Star_Cover API')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/docs', app, document);
    app.useGlobalPipes(new common_2.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        disableErrorMessages: false,
    }));
    await app.listen(5000);
}
bootstrap();
//# sourceMappingURL=main.js.map