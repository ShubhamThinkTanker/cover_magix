export declare class PasswordService {
    static hashPassword(password: string): Promise<string>;
    comparePasswords(enteredPassword: string, storedPassword: string): Promise<boolean>;
}
