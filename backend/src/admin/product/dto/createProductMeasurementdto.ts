interface ProductMeasurementDTO {
    product_id: number;
    product_measurement: { [key: string]: string }[];
    how_to_measure: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }
  