import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from '../src/admin/auth/auth.schema';
import { config } from 'dotenv'; // Adjust the path as per your project structure
config()
declare global {
  namespace Express {
    interface Request {
      user: Admin | null;
    }
  }
}



@Injectable()
export class EnsureAdminAuthenticatedMiddleware implements NestMiddleware {
  constructor(@InjectModel(Admin) private adminModel: typeof Admin) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]; // Get the token from headers
    console.log('token: ', token);

    if (!token) {
      throw new UnauthorizedException('Not authorized, no token');
    }
    try {

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode token
    
      const admin = await this.adminModel.findOne({ where: { id: decoded.id } });
      if (!admin) {
        throw new UnauthorizedException('Not authorized, user not found');
      }
    
      req.user = admin; // Assign admin to the request object for later use
      next(); // Proceed to the next middleware
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new UnauthorizedException('Not authorized, token failed');
    }
  }
}
