import { getSocketId ,io } from "../config/socket.js";
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {messageText} = req.body;

        if (!messageText || !messageText.trim()) {
            return res.status(400).json({ success: false, message: "Message text is required" });
        }

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
            message: messageText.trim(),
            isSeen:false
        })

        if (newMessage) conversation.messages.push(newMessage._id)

        await Promise.all([conversation.save() , newMessage.save()])

        //implement socket io for real time data transfer
        const receiverSocketId = getSocketId(receiverId);
        if(receiverSocketId){
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

        // Mark messages FROM the chat partner (req.params.id) TO the current user as seen
        await Message.updateMany(
        {
            senderId: receiverId,
            receiverId: senderId,
            isSeen: false,
        },
        {
            $set: { isSeen: true },
        }
        );

        // Let the chat partner know their messages were seen
        const partnerSocketId = getSocketId(receiverId);
        if (partnerSocketId) {
            io.to(partnerSocketId).emit('messageSeen', {
                chatWith: senderId,
                receiverId,
            });
        }

        return res.status(201).json({success: true, message: 'seen'})

        
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getConversations = async (req, res) => {
    try {
        const currentUserId = req.id;

        const user = await User.findById(currentUserId).populate('messageInbox', '-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found!' });

        const inboxUsers = user.messageInbox || [];

        const conversations = await Promise.all(
            inboxUsers.map(async (partner) => {
                const conversation = await Conversation.findOne({
                    participants: { $all: [currentUserId, partner._id] },
                }).populate('messages');

                const messages = (conversation?.messages || []).sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                const lastMessage = messages[messages.length - 1] || null;
                const unreadCount = messages.filter(
                    (m) => m.senderId.toString() === partner._id.toString() && !m.isSeen
                ).length;

                return {
                    user: partner,
                    lastMessage,
                    unreadCount,
                    lastMessageAt: lastMessage?.createdAt || null,
                };
            })
        );

        conversations.sort((a, b) => {
            const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return tb - ta;
        });

        return res.status(200).json({ success: true, conversations });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}