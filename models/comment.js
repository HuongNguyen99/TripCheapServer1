const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    idUser: { type: String },
    username: { type: String },
    idTicket: { type: String },
    idCreator: { type: String },
    message: { type: String },
    images: { type: Array },
    likeCount: { type: Number },
    disLikeCount: { type: Number },
    listUserLike: { type: Array },
    listUserDisLike: { type: Array }
    // name: { type: String, required: true },
    // image: { type: String },
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Comment', commentSchema);