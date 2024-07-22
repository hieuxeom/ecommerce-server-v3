const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoryModel = new Schema(
    {
        categoryName: {type: String, required: true},
        queryParams: {type: String, required: true},
        isActive: {type: Boolean, default: true}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("categories", CategoryModel);
