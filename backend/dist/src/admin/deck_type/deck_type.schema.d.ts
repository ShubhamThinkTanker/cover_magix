import { Model } from 'sequelize-typescript';
export declare class DeckType extends Model<DeckType> {
    id: number;
    deck_name: string;
    price: string;
    deck_image: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
