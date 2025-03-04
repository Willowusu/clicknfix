const Chat = require('../models/chat.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

// Create new chat
exports.createChat = async (req, res) => {
    try {
        const {
            type,
            participants,
            booking,
            settings
        } = req.body;

        // Validate required fields
        if (!type || !participants || participants.length < 2) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newChat = new Chat({
            type,
            participants,
            booking,
            settings,
            status: 'active'
        });

        await newChat.save();

        // Notify participants
        await Promise.all(participants.map(participant =>
            new Notification({
                recipient: participant.user,
                type: 'chat_created',
                title: 'New Chat Created',
                message: `You have been added to a new ${type} chat`,
                data: {
                    chat: newChat._id,
                    booking: booking
                },
                deliveryChannels: [
                    { type: 'in_app' },
                    { type: 'push' }
                ]
            }).save()
        ));

        return res.status(201).json({
            message: "Chat created successfully",
            chat: newChat
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get chat by ID
exports.getChat = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid chat ID" });
        }

        const chat = await Chat.findById(id)
            .populate('participants.user', 'name avatar')
            .populate('booking')
            .populate('messages.sender', 'name avatar')
            .populate('metadata.createdBy', 'name')
            .populate('metadata.closedBy', 'name');

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        return res.status(200).json(chat);
    } catch (error) {
        console.error("Error retrieving chat:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, messageType, media, location } = req.body;
        const senderId = req.user._id; // Assuming user info is attached by auth middleware

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid chat ID" });
        }

        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Verify sender is a participant
        if (!chat.participants.some(p => p.user.equals(senderId))) {
            return res.status(403).json({ message: "Not authorized to send messages in this chat" });
        }

        const message = {
            sender: senderId,
            content,
            messageType,
            media,
            location,
            status: 'sent',
            metadata: {
                deviceInfo: req.headers['user-agent']
            }
        };

        chat.messages.push(message);
        await chat.save();

        // Notify other participants
        const otherParticipants = chat.participants
            .filter(p => !p.user.equals(senderId))
            .map(p => p.user);

        await Promise.all(otherParticipants.map(recipient =>
            new Notification({
                recipient,
                type: 'chat_message',
                title: 'New Message',
                message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                data: {
                    chat: chat._id,
                    message: message._id
                },
                deliveryChannels: [
                    { type: 'in_app' },
                    { type: 'push' }
                ]
            }).save()
        ));

        return res.status(200).json({
            message: "Message sent successfully",
            chatMessage: message
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid chat ID" });
        }

        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await chat.markAsRead(userId);

        return res.status(200).json({
            message: "Messages marked as read"
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get user's active chats
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status = 'active' } = req.query;

        const chats = await Chat.find({
            'participants.user': userId,
            status
        })
            .populate('participants.user', 'name avatar')
            .populate('booking')
            .sort('-updatedAt')
            .limit(50);

        return res.status(200).json(chats);
    } catch (error) {
        console.error("Error retrieving user chats:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Archive chat
exports.archiveChat = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid chat ID" });
        }

        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await chat.archive(userId, reason);

        return res.status(200).json({
            message: "Chat archived successfully"
        });
    } catch (error) {
        console.error("Error archiving chat:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get chat statistics
exports.getChatStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user._id;

        const stats = await Chat.aggregate([
            {
                $match: {
                    'participants.user': mongoose.Types.ObjectId(userId),
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalChats: { $sum: 1 },
                    activeChats: {
                        $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
                    },
                    totalMessages: { $sum: { $size: "$messages" } },
                    averageMessagesPerChat: { $avg: { $size: "$messages" } }
                }
            }
        ]);

        return res.status(200).json(stats[0] || {
            totalChats: 0,
            activeChats: 0,
            totalMessages: 0,
            averageMessagesPerChat: 0
        });
    } catch (error) {
        console.error("Error getting chat stats:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = exports; 