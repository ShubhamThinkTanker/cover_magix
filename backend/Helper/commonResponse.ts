
export class Success {

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

export class LoginSuccess {

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

export class CustomErrorResponse {
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

export class CustomResponse {
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

export class CustomCatchBlockErrorMessage {
  constructor(res, statusCode, data, message) {
    const resData = {
      error: true,
      message: message,
      statusCode: statusCode,
      data:data
    };
    return res.status(statusCode).json(resData);
  }
}

// export class ValidationError extends Error {
//   constructor(res,errorCode, errorMessage) {
//     super();
//     const errorData = {    
//       errorCode: errorCode,
//       errorMessage: errorMessage
//     };
//     return res.status(errorCode).json(errorData);
//   }
// };
export class ValidationError extends Error {
  errorCode: number;
  errorMessage: string;

  constructor(errorCode: number, errorMessage: string) {
    super(errorMessage);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}

