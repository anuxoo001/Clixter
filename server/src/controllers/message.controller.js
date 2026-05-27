import { getSocketId ,io } from "../config/socket.js";
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {messageText} = req.body;
        // console.log(req.body)

        let conversation = await Conversation.findOne({
            participants: {$all: [senderId , receiverId]}
        })
        
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId , receiverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message:messageText,
            isSeen:false
        })

        if (newMessage) conversation.messages.push(newMessage._id)

        await Promise.all([conversation.save() , newMessage.save()])

        //implement socket io for real time data transfer
        const receiverSocketId = getSocketId(receiverId);
        if(receiverSocketId){
            // console.log("id:",receiverSocketId)
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(201).json({success: true, newMessage})
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getAllMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: {$all: [senderId , receiverId]}
        }).populate('messages')
        
        if (!conversation) return res.status(201).json({success: true, messages: []})

        return res.status(201).json({success: true, messages: conversation?.messages})
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const markSeen = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        await Message.updateMany(
        {
            senderId,
            receiverId,
            isSeen: false,
        },
        {
            $set: { isSeen: true },
        }
        );

        return res.status(201).json({success: true, message: 'seend'})

        
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}