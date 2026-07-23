const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getProductConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const sellerId = req.query.sellerId;

        let conversation = await Conversation.findOne({
            productId,
            buyerId: userId,
        });
        //Creating a Conversation
        if (!conversation) {
            conversation = await Conversation.create({
                productId,
                buyerId: userId,
                sellerId,
            });
        }

        const messages = await Message.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            conversationId: conversation._id,
            messages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const addMessage = async (messageData) => {
    try{
        await Message.create({
            msgId:messageData.msgId,
            conversationId:messageData.conversationId,
            sender:messageData.sender,
            message:messageData.message
        })
    }
    catch(error){
        throw error
    }
};

module.exports = { getProductConversation, addMessage };

