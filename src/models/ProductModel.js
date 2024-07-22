const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductReview = new Schema(
    {
        userName: {type: String, required: true},
        reviewContent: {type: String, required: true},
        reviewStar: {type: Number, required: true}
    },
    {
        timestamps: true
    }
);
const ProductComment = new Schema(
    {
        userName: {type: String, required: true},
        commentContent: {type: String, required: true}
    },
    {
        timestamps: true
    }
);

const VariantPrice = new Schema({
    originalPrice: {type: Number, required: true},
    discountPrice: {type: Number, required: true}
});

const ProductVariants = new Schema(
    {
        variantKey: {type: String, required: true},
        variantLabel: {type: String, required: true},
        variantImage: {type: String, required: true},
        variantStock: {type: Number, required: true},
        variantPrice: {type: VariantPrice, required: true}
    }
);

const ProductModel = new Schema(
    {
        productName: {type: String, required: true},

        productPrice: {type: String, required: true},

        isDiscount: {type: Boolean, default: false},

        discountPercents: {type: Number, default: 0, min: 0, max: 100},

        productCategory: {type: String, required: true},

        productReviews: {type: [ProductReview], default: []},

        productComments: {type: [ProductComment], default: []},

        productRating: {type: Number, default: 5},

        productVariants: {type: [ProductVariants], defaults: []},

        isDeleted: {type: Boolean, default: false},

        isActive: {type: Boolean, default: true},

        views: {type: Number, default: 0},

        soldCount: {type: Number, default: 0}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("product", ProductModel);
