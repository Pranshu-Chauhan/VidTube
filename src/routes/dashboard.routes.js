import Router from "express";
import { getChannelDashboard, getChannelVideos } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router = Router();

router.route("/stats").get(verifyJWT, getChannelDashboard);
router.route("/videos").get(verifyJWT, getChannelVideos);

export default router;