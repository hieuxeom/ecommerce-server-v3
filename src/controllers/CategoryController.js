const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");

const productController = require("./ProductController");

const { decodeToken } = require("../utils/token");

class CategoryController {
    constructor() {
        this.getCategoryById = this.getCategoryById.bind(this);
        this.createNewCategory = this.createNewCategory.bind(this);
        this.editCategory = this.editCategory.bind(this);
    }

    async getAllCategories(req, res, next) {

        const { onlyActive } = req.query;

        let filterOptions = {};

        if (onlyActive === "true") {
            filterOptions.isActive = true;
        }

        const listCategories = await CategoryModel.find(filterOptions);

        return res.status(200).json({
            status: "success",
            message: "Successfully list categories",
            data: listCategories
        });
    }

    async getCategoryById(req, res, next) {
        const { categoryId } = req.params;

        if (!categoryId) {
            return this.getAllCategories(req, res, next);
        }

        const categoryData = await CategoryModel.findById(categoryId);

        if (categoryData) {
            return res.status(200).json({
                status: "success",
                message: "Successfully get category details",
                data: categoryData
            });
        } else {
            return res.status(204).json({
                status: "success",
                message: `Can't not find any category with id ${categoryId}`,
                data: categoryData
            });
        }
    }

    async createNewCategory(req, res, next) {

        const { categoryName, queryParams, isActive } = req.body;

        if (!categoryName) {
            return res.json(404).json({
                status: "failure",
                message: "Missing category name"
            });
        }

        if (!queryParams) {
            return res.json(404).json({
                status: "failure",
                message: "Missing queryParams"
            });
        }

        try {

            if (await this.isExistQueryParams(queryParams)) {
                return res.status(404).json({
                    status: "failure",
                    message: "Query params already exist, try again with a different value"
                });
            }

            const newCategory = new CategoryModel({
                categoryName,
                queryParams,
                isActive
            });
            await newCategory.save();

            return res.status(201).json({
                status: "success",
                message: "Successfully created new category"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }

    }

    async editCategory(req, res, next) {

        const { categoryId } = req.params;

        const { categoryName, queryParams, isActive } = req.body;

        const categoryData = await CategoryModel.findById(categoryId);

        if (categoryData.queryParams !== queryParams) {
            if (await this.isExistQueryParams(queryParams)) {
                return res.status(404).json({
                    status: "failure",
                    message: "Query params already exist, try again with a different value"
                });
            }
        }

        try {

            if (categoryData.queryParams !== queryParams) {
                const listProductsWithCategory = await ProductModel.find({
                    productCategory: categoryData.queryParams
                });

                const promiseChanges = listProductsWithCategory.map((product) => {
                    return new Promise((resolve, reject) => {
                        productController.handleChangeProductCategory(product._id, queryParams);
                    });
                });

                await Promise.all(promiseChanges);

            }

            await CategoryModel.findByIdAndUpdate(categoryId, {
                categoryName, queryParams, isActive
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully edited category details"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }

    }

    async changeActivationStatus(req, res, next) {

        const { categoryId } = req.params;

        const { isActive } = req.body;

        try {

            await CategoryModel.findByIdAndUpdate(categoryId, {
                isActive
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully changed category activation status"
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }

    }

    async deleteCategory(req, res, next) {
        const { categoryId } = req.params;

        try {

            await CategoryModel.findByIdAndDelete(categoryId);

            return res.status(200).json({
                status: "success",
                message: "Successfully deleted category"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }
    }

    async isExistQueryParams(queryParams) {
        const isExistQueryParams = await CategoryModel.find({
            queryParams
        });

        return isExistQueryParams.length > 0;
    }
}

module.exports = new CategoryController();
