const ProductModel = require("../models/ProductModel"); // Assuming the schema is in a file named ProductModel.js

const fs = require("fs");
const {decodeToken} = require("../utils/token");

class ProductController {

    IMAGE_DIRECTORY = "./public/images/";

    constructor() {
        this.getProductById = this.getProductById.bind(this);
        this.createNewProduct = this.createNewProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
    }

    checkValidListVariants(productVariants) {
        let isValidVariantsImage = true;
        productVariants.forEach((variant) => {
            const {variantImage} = variant;
            if (!variantImage.includes("data:")) {
                isValidVariantsImage = false;
            }
        });

        return isValidVariantsImage;
    }

    async getListProducts(req, res, next) {

        const {filter, min, max, isFull} = req.query;

        let filterOptions = {};

        if (!isFull) {
            filterOptions.isActive = true;
        }

        if (filter && filter !== "all") {
            filterOptions.productCategory = filter;
        }

        if (min && max) {
            filterOptions.productPrice = {$gte: min, $lte: max};
        }

        const listProducts = await ProductModel.find(filterOptions);

        return res.status(200).json({
            status: "success",
            message: "Successfully get list products",
            data: listProducts
        });

    }

    async getProductsBySearchKey(_s, res) {
        const listProductData = await ProductModel.find({
            productName: {
                $regex: new RegExp(_s, "i")
            }
        });

        return res.status(200).json({
            status: "success search",
            data: listProductData
        });
    }

    async getProductById(req, res, next) {
        const {productId} = req.params;

        if (!productId) {
            return this.getListProducts();
        }

        try {
            const productDetails = await ProductModel.findById(productId);

            if (productDetails) {
                return res.status(200).json({
                    status: "success",
                    message: "Successfully fetch product details",
                    data: productDetails
                });
            } else {
                return res.status(400).json({
                    status: "success",
                    message: `Can't find any product with id ${productId}`,
                    data: []
                });
            }
        } catch (err) {
            if (err.name === "CastError") {
                return res.status(400).json({
                    status: "failure",
                    message: "Invalid productId"
                });
            }
        }
    }

    async getOnlyVariant(req, res, next) {
        const {productId, variantKey} = req.params;

        try {
            const productDetails = await ProductModel.findById(productId);

            const {productVariants} = productDetails;

            return res.status(200).json({
                status: "success",
                message: "Successfully get variant data",
                data: productVariants.find((item) => item.variantKey === variantKey)
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getProductColors(req, res, next) {
        const productData = await ProductModel.find({});

        const listColors = [...new Set(productData.map((item) => item.productColor))];

        return res.status(200).json({
            status: "success",
            message: "",
            data: listColors
        });

    }

    async createNewProduct(req, res, next) {
        const {
            productName,
            productPrice,
            isDiscount,
            discountPercents,
            productCategory,
            productVariants,
            isActive
        } = req.body;

        const checkRequired = [
            !productName && "productName",
            !productPrice && "productPrice",
            isDiscount === undefined && "isDiscount",
            isDiscount && !discountPercents && "discountPercents",
            !productCategory && "productCategory",
            !productVariants && "productVariants"
        ].filter((item) => item);

        if (checkRequired.length > 0) {
            return res.status(404).json({
                status: "failure",
                message: "Missing required field(s), please fill all required fields before submitting",
                missingFields: checkRequired
            });
        }

        try {

            if (!this.checkValidListVariants(productVariants)) {
                return res.status(400).json({
                    status: "failure",
                    message: "Each variation must have an image"
                });
            }

            productVariants.forEach((variant) => {
                const {variantKey, variantImage, variantPrice} = variant;

                let parseImageExt = variantImage.split(";")[0].split("/")[1];

                const imageExt = parseImageExt === "jpeg" ? "jpg" : parseImageExt;

                const fileName = `${productName.split(" ").join("")}-${variantKey}.${imageExt}`;

                const base64data = variantImage.replace(/^data:.*,/, "");

                fs.writeFile(this.IMAGE_DIRECTORY + fileName, base64data, "base64", (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: `${err.name} - ${err.message}`
                        });
                    }
                });

                variant.variantImage = fileName;
            });

            const newProduct = new ProductModel({
                productName,
                productPrice,
                isDiscount,
                discountPercents,
                productCategory,
                productVariants,
                isActive
            });

            await newProduct.save();

            return res.status(201).json({
                status: "success",
                message: "Successfully created new product"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async editProduct(req, res, next) {

        const {productId} = req.params;
        const {
            productName,
            productPrice,
            isDiscount,
            discountPercents,
            productCategory,
            productVariants,
            isActive
        } = req.body;

        console.log(req.body);

        try {
            const checkRequired = [
                !productName && "productName",
                !productPrice && "productPrice",
                isDiscount === undefined && "isDiscount",
                isDiscount && !discountPercents && "discountPercents",
                !productCategory && "productCategory",
                !productVariants && "productVariants"
            ].filter((item) => item);

            if (checkRequired.length > 0) {
                return res.status(404).json({
                    status: "failure",
                    message: "Missing required field(s), please fill all required fields before submitting",
                    missingFields: checkRequired
                });
            }

            productVariants.forEach((variant) => {
                const {variantKey, variantImage} = variant;

                if (variantImage.includes("data:")) {

                    let parseImageExt = variantImage.split(";")[0].split("/")[1];

                    const imageExt = parseImageExt === "jpeg" ? "jpg" : parseImageExt;
                    const fileName = `${productName.split(" ").join("")}-${variantKey}.${imageExt}`;

                    const base64data = variantImage.replace(/^data:.*,/, "");

                    fs.writeFile(this.IMAGE_DIRECTORY + fileName, base64data, "base64", (err) => {

                        if (err) {
                            return res.status(500).json({
                                status: "error",
                                message: `${err.name} - ${err.message}`
                            });
                        }
                    });
                    variant.variantImage = fileName;
                }
            });

            let updateData = {
                productName,
                productPrice,
                isDiscount,
                discountPercents,
                productCategory,
                productVariants,
                isActive
            };

            await ProductModel.findByIdAndUpdate(productId, updateData);

            return res.status(201).json({
                status: "success",
                message: "Successfully edited product details"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }

    }

    async changeProductActivationStatus(req, res, next) {

        try {
            const {isActive} = req.body;
            const {productId} = req.params;

            await ProductModel.findByIdAndUpdate(productId, {
                isActive
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully changed product activation status"
            });
        } catch (err) {

            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async removeProduct(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found"
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                });
            }

            const {productId} = req.params;

            await ProductModel.findByIdAndDelete(productId);

            return res.status(200).json({
                status: "success",
                message: "Product deleted successfully"
            });

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired "
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }

    }

    async handleChangeProductCategory(productId, newCategoryName) {
        const productData = await ProductModel.findById(productId);

        if (!productData) {
            return false;
        }

        productData.productCategory = newCategoryName;
        await productData.save();
        return true;
    }

    async getNewArrivals(req, res, next) {
        try {
            const newArrivalsProduct = await ProductModel.find({
                isActive: true
            }).sort({"createdAt": -1}).limit(4);
            return res.status(200).json({
                status: "success",
                message: "Successfully get new arrival products",
                data: newArrivalsProduct
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }
    }

    async getTopSell(req, res, next) {
        try {
            const topSells = await ProductModel.find({
                isActive: true
            }).sort({"soldCount": -1}).limit(4);
            return res.status(200).json({
                status: "success",
                message: "Successfully get new arrival products",
                data: topSells
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }
    }

    async increaseProductView(req, res, next) {
        try {
            const {productId} = req.params;

            await ProductModel.findByIdAndUpdate(productId, {
                    $inc: {
                        views: 1
                    }
                }
            );

            return res.status(200).json({
                status: "success"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }
    }
}

module.exports = new ProductController();
