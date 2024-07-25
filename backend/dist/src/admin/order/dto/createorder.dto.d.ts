export declare class CreateOrderDto {
    productId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    productName: string;
    price: number;
    description: string;
    stock: number;
    totalAmount: number;
    orderDate: Date;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    appliedCoupenId?: number;
    IGST?: number;
    SGST?: number;
    returnStatus: string;
    orderStatus: string;
}
