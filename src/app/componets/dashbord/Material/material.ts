export interface Material {
    product_name: string; 
    product_desc: string; 
    prod_unit: string; 
    prod_type: string; 
    other_type: string;
}

export interface Stock {
    client_id:string,
    date:string,
    location:string,
    remark:string,
    transferStockItems:[]
}