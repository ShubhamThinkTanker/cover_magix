export declare class Success {
    constructor(res: any, statusCode: any, data: {}, message: any);
}
export declare class LoginSuccess {
    constructor(res: any, statusCode: any, access_token: {}, message: any);
}
export declare class CustomErrorResponse {
    constructor(res: any, statusCode: any, message: any, errors?: {});
}
export declare class CustomResponse {
    constructor(res: any, statusCode: number, data: {}, message: any);
}
export declare class CustomCatchBlockErrorMessage {
    constructor(res: any, statusCode: any, data: any, message: any);
}
export declare class ValidationError extends Error {
    errorCode: number;
    errorMessage: string;
    constructor(errorCode: number, errorMessage: string);
}
