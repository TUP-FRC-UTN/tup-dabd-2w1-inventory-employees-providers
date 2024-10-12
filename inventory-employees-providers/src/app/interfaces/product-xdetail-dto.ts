export interface ProductXDetailDTO {
    product_id: number;
    name: string;
    discontinued: boolean;
    reusable: boolean;
    min_amount_warning: number;
    category: string;
    detail: string;
    state: string;
    unit_price: number;
    supplier_id: number;


    /*//atributos del producto
    private Integer product_id;
    private String name;
    private boolean discontinued;
    private boolean reusable;
    private int min_amount_warning;
    private String category;
    //atributos del detalle
    private String detail;
    private DetailProductState state;
    private double unit_price;
    @JsonProperty("supplier_id")
    private Integer supplier_id;*/ 
}
