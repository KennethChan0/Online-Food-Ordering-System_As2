
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    //Email is the login credential and is unique, so the information page is read-only.
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //The database layer only allows the customer/restaurant, and the strategy registry to correspond.
    role: { type: String, required:true,enum: ['customer', 'restaurant'],
    default: 'customer', },
    //phone, restaurantAddress: trim to empty string by default, existing users without these two fields will not cause an error.
    phone: { type: String, trim: true, default: '' },
    restaurantAddress: { type: String, trim: true, default: '' },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
