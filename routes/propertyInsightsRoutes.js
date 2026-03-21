import express from "express";
import {
    getPropertyPriceInsights,
    getMicromarketComparison,
    getRentalSupplyInsights,
    getPropertyHeatmapData,
    getPropertyStatistics,
    getTrendingProperties,
    getPriceTrends,
    getAmenitiesPopularity
} from "../controllers/propertyInsightsController.js";

const router = express.Router();

// Property Price Insights Routes
router.get("/price-insights", getPropertyPriceInsights);
router.get("/micromarket-comparison", getMicromarketComparison);
router.get("/rental-supply", getRentalSupplyInsights);
router.get("/heatmap", getPropertyHeatmapData);
router.get("/statistics", getPropertyStatistics);
router.get("/trending", getTrendingProperties);
router.get("/price-trends", getPriceTrends);
router.get("/amenities-popularity", getAmenitiesPopularity);

export default router;
