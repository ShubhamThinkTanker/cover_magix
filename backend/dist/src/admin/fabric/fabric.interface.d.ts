export declare class CreateFabric {
    id: number;
    fabric_name: string;
    material: string;
    ideal_for: string;
    feature: string;
    water_proof: number;
    uv_resistant: number;
    weight: string;
    warranty: string;
    fabric_type: number;
    fabric_images: FabricImage[];
}
export interface FabricImage {
    id: number;
    fabric_id: number;
    color_name: string;
    color: string;
    fabric_image: string;
}
export declare class CreateFabricMaterial {
    color_name: string;
    color: string;
    fabric_image: string;
    created_at: Date;
    constructor(color_name: string, color: string, fabric_image: string, created_at: Date);
}
