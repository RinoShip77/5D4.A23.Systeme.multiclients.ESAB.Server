import mongoose from 'mongoose';

const blacklistedJWTSchema = mongoose.Schema({

    token: {
        type: String,
        required: true,
        unique: true, // Ensure tokens are unique
      },
      blacklistedAt: {
        type: Date,
        default: Date.now, // Store the date when the token was blacklisted
      },
});

export default mongoose.model('blacklistedJWT', blacklistedJWTSchema);