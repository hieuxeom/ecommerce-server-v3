const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const commentController = require("../controllers/CommentController");
const reviewController = require("../controllers/ReviewController");
const {checkAdminRole, checkToken} = require("../utils/middlewares-checker");

// user route
router.get("/", productController.getListProducts);
router.get("/colors", productController.getProductColors);
router.get("/arrivals", productController.getNewArrivals);
router.get("/top-sell", productController.getTopSell);

router.get("/:productId", productController.getProductById);
router.get("/:productId/:variantKey", productController.getOnlyVariant);
router.post("/:productId/views", productController.increaseProductView);

router.get("/:productId/comments", commentController.getAllComments);
router.post("/:productId/comments", checkToken, commentController.createNewComment);

router.get("/:productId/reviews", reviewController.getAllReviews);
router.post("/:productId/reviews", checkToken, reviewController.createNewReview);

router.put("/:productId/activation", checkAdminRole, productController.changeProductActivationStatus);
router.post("/", checkAdminRole, productController.createNewProduct);

router.put("/:productId", checkAdminRole, productController.editProduct);

router.delete("/:productId", checkAdminRole, productController.removeProduct);

module.exports = router;
