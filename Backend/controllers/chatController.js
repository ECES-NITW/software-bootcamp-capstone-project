const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getProductConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        //TODO: Get the product details here , mainly the sellerID
        //Don't Continue if the user id is the sellerID

        let conversation = await Conversation.findOne({
            productId,
            buyerId: userId,
        });
        if (!conversation) {
            conversation = await Conversation.create({
                productId,
                buyerId: userId,
            });
        }

        return res.status(200).json({
            conversationId: conversation._id,
            lastMessage: conversation.lastMessage,
            buyerId: conversation.buyerId,
            sellerId: conversation.sellerId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.query;
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "conversationId is required",
            });
        }

        // Only a participant (buyer or seller) may read the thread.
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }
        const uid = req.user.id;
        if (
            String(conversation.buyerId) !== uid &&
            String(conversation.sellerId) !== uid
        ) {
            return res.status(403).json({
                success: false,
                message: "Not a participant of this conversation",
            });
        }

        const messages = await Message.find({ conversationId }).sort({
            createdAt: 1,
        });

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const addMessage = async (messageData) => {
    const conversationId = messageData.conversationId;
    const message = messageData.message;
    await Message.create({
        msgId: messageData.msgId,
        conversationId,
        sender: messageData.sender,
        message,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message,
    });
};

const getConversations = async (req, res) => {
    const userId = req.user.id;
    try {
        const chats = await Conversation.find({
            $or: [{ buyerId: userId }, { sellerId: userId }],
        })
            .sort({ updatedAt: -1 })
            .lean();
        const conversations = chats.map((c) =>
            String(c.sellerId) === userId
                ? { ...c, role: "seller" }
                : { ...c, role: "buyer" },
        );
        return res.status(200).json({
            success: true,
            conversations,
            conversation_count: conversations.length,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = {
    getProductConversation,
    getMessages,
    addMessage,
    getConversations,
};
