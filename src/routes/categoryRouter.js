const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController");
const {checkAdminRole} = require("../utils/middlewares-checker");

router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.put("/:categoryId/activation", checkAdminRole, categoryController.changeActivationStatus);
router.put("/:categoryId", checkAdminRole, categoryController.editCategory);
router.delete("/:categoryId", checkAdminRole, categoryController.deleteCategory);
router.post("/", checkAdminRole, categoryController.createNewCategory);

module.exports = router;
