const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, required: true},
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    userType: { type: String, required: true},
    qualifications: { type: String, required: false},
});

const User = mongoose.model('User', userSchema);

module.exports = User;