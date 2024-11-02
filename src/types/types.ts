// user types
export interface createNewUserReqBody {
    _id: string
    name: string
    email: string
    password: string
    photo: string
    role: string
    gender: string
    dob: Date
}

export interface loginUserReqBody {
    email: string
    password: string
}
// user types ends here


// product types
export interface newProductReqBody {
    name: string;
    brand: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    user:string
}


// search request query
// export type SearchReqQuery = {
//     search?: string;
//     maxPrice?: string;
//     minPrice?: string;
//     category?: string;
//     sort?: string;
//     page?: string;
// };

// search request query
export type SearchReqQuery = {
    search?: string;
    maxPrice?: string;
    minPrice?: string;
    category?: string;
    sort?: string;
    page?: string;
};



// base query for product searching 
// export interface BaseQuery {
//     name?: {
//         $regex: string;
//         $options: string;
//     };
//     maxPrice?: { $gte: number };
//     minPrice?: { $lte: number };
//     category?: string;
// }
// base query for product searching 
export interface BaseQuery {
    name?: {
        $regex: string;
        $options: string;
    };
    price?: {
        $gte?: number;
        $lte?: number;
    };
    category?: string;
}




//  invalidate Cache props
export type invalidateCacheProps = {
    product?: boolean
    order?: boolean
    admin?: boolean
    userId?: string
    productId:string[]
    orderId?: string
}


export type OrderedItemType = {
    name: string
    photo: string
    price: number
    quantity: number
    subtotal: number
    productId:string
}


export type ShippingInfoType = {
    address: string
    city: string
    state: string
    zipCode: number
    country: number
    mobile: number
}


export type BillingInfoType = {
    userId: string
    name: string
    email: string
    anyMessage: string
}

export interface NewOrderReqBody{
    billingInfo: BillingInfoType
    shippingInfo: ShippingInfoType
    tax: number
    shippingCharge: number
    discount: number
    subtotal: number
    total: number
    status: string
    orderedItems:OrderedItemType[]
    
}