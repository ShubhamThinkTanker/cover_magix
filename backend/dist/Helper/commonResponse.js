"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.CustomCatchBlockErrorMessage = exports.CustomResponse = exports.CustomErrorResponse = exports.LoginSuccess = exports.Success = void 0;
class Success {
    constructor(res, statusCode, data = {}, message) {
        const resData = {
            error: false,
            message: message,
            statusCode: statusCode,
            data
        };
        return res.status(statusCode).json(resData);
    }
}
exports.Success = Success;
class LoginSuccess {
    constructor(res, statusCode, access_token = {}, message) {
        const resData = {
            error: false,
            message: message,
            statusCode: statusCode,
            access_token
        };
        return res.status(statusCode).json(resData);
    }
}
exports.LoginSuccess = LoginSuccess;
class CustomErrorResponse {
    constructor(res, statusCode, message, errors = {}) {
        const resData = {
            error: true,
            statusCode: statusCode,
            message: message,
            errors,
        };
        return res.status(statusCode).json(resData);
    }
}
exports.CustomErrorResponse = CustomErrorResponse;
class CustomResponse {
    constructor(res, statusCode = 200, data = {}, message) {
        const resData = {
            error: true,
            message: message,
            statusCode: statusCode,
            data
        };
        return res.status(statusCode).json(resData);
    }
}
exports.CustomResponse = CustomResponse;
class CustomCatchBlockErrorMessage {
    constructor(res, statusCode, data, message) {
        const resData = {
            error: true,
            message: message,
            statusCode: statusCode,
            data: data
        };
        return res.status(statusCode).json(resData);
    }
}
exports.CustomCatchBlockErrorMessage = CustomCatchBlockErrorMessage;
class ValidationError extends Error {
    constructor(errorCode, errorMessage) {
        super(errorMessage);
        this.name = this.constructor.name;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=commonResponse.js.map