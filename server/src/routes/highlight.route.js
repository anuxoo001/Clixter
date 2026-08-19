import express from "express";
import { addItemToHighlight, createHighlight, deleteHighlight, getHighlightsOfUser } from "../controllers/highlight.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post('/' , verifyToken, createHighlight);
router.post('/:id/item' , verifyToken, addItemToHighlight);
router.get('/:userId' , verifyToken, getHighlightsOfUser);
router.delete('/:id' , verifyToken, deleteHighlight);

export default router;