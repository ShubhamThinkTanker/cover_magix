declare enum PromoType {
    FIRST_ORDER = "first_order",
    CAT = "cat",
    SUB_CAT = "sub_cat",
    PRO = "pro"
}
declare enum Status {
    PENDING = "pending",
    PROCESS = "process",
    ACTIVE = "active",
    EXPIRED = "expired"
}
export declare class CreatePromoDto {
    promo_type: PromoType;
    code: string;
    description: string;
    max_user: number;
    status: Status;
    discount_per: number;
    header_Promo: boolean;
}
export {};
