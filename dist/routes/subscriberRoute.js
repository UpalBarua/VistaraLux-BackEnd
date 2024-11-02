import express from "express";
import { allSubscriber, doSubscribe } from "../controllers/subscriberController.js";
const router = express.Router();
router.post("/do-subscribe", doSubscribe);
router.get("/all", allSubscriber);
export default router;
