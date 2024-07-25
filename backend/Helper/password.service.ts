import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password?password:"123456C!", salt);
    return hashedPassword;
  }

  async comparePasswords(
    enteredPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }
}
