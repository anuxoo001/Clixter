import express from "express"
import verifyToken from "../middlewares/verifyToken.js"
import { getAllMessages, getConversations, markSeen, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.post('/send/:id', verifyToken, sendMessage);
router.get('/conversations', verifyToken, getConversations);
router.get('/getall/:id', verifyToken, getAllMessages)
router.get('/:id/markseen' , verifyToken, markSeen)


export default router