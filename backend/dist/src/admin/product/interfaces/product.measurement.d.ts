export interface Measurement {
    Height: number;
    Width: number;
    Depth: number;
}
export interface MeasurementData {
    shape1: Measurement;
    shape2: Measurement;
}
export interface InputData {
    type: number;
    product_id: number;
    product_measurement: MeasurementData[];
    extra_material: number;
    material_price: number;
}
