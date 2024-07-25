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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleFilesInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const multer = require("multer");
let MultipleFilesInterceptor = exports.MultipleFilesInterceptor = class MultipleFilesInterceptor {
    constructor(fields) {
        this.fields = fields;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const multerFields = this.fields.map(field => ({
            name: field.name,
            maxCount: field.maxCount,
        }));
        return new rxjs_1.Observable(observer => {
            const upload = multer().fields(multerFields);
            upload(request, response, err => {
                if (err) {
                    observer.error(err);
                }
                else {
                    observer.next(next.handle());
                    observer.complete();
                }
            });
        });
    }
};
exports.MultipleFilesInterceptor = MultipleFilesInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Array])
], MultipleFilesInterceptor);
//# sourceMappingURL=multiple-files.interceptor.js.map