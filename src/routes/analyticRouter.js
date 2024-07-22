const express = require("express");
const router = express.Router();

const analyticController = require("../controllers/AnalyticController");
const { checkAdminRole } = require("../utils/middlewares-checker");

router.get("/", analyticController.getAnalyticsData);

module.exports = router;
