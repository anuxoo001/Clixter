import Highlight from "../models/highlight.model.js";

export const createHighlight = async (req, res) => {
    try {
        const userId = req.id;
        const { title, cover, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "At least one item is required!" });
        }

        const highlight = await Highlight.create({
            user: userId,
            title: title || "Highlights",
            cover: cover || items[0].media,
            items,
        });

        return res.status(201).json({ success: true, message: "Highlight created.", highlight });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getHighlightsOfUser = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const highlights = await Highlight.find({ user: targetUserId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, highlights });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const addItemToHighlight = async (req, res) => {
    try {
        const userId = req.id;
        const highlightId = req.params.id;
        const { media, mediaType, caption } = req.body;

        if (!media) return res.status(400).json({ success: false, message: "media is required!" });

        const highlight = await Highlight.findById(highlightId);
        if (!highlight) return res.status(404).json({ success: false, message: "Highlight not found!" });
        if (highlight.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not allowed!" });
        }

        highlight.items.push({ media, mediaType: mediaType || "image", caption: caption || "" });
        await highlight.save();

        return res.status(200).json({ success: true, message: "Item added.", highlight });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteHighlight = async (req, res) => {
    try {
        const userId = req.id;
        const highlightId = req.params.id;

        const highlight = await Highlight.findById(highlightId);
        if (!highlight) return res.status(404).json({ success: false, message: "Highlight not found!" });
        if (highlight.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not allowed!" });
        }

        await Highlight.findByIdAndDelete(highlightId);
        return res.status(200).json({ success: true, message: "Highlight deleted." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
