// models/SecretCode.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Import bcrypt

const secretCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensure that the code is unique
  },
});

// Hash the secret code before saving it
secretCodeSchema.pre('save', async function (next) {
  if (this.isModified('code')) {
    const hashedCode = await bcrypt.hash(this.code, 10); // Hash the code with salt rounds of 10
    this.code = hashedCode; // Store the hashed code
  }
  next();
});

const SecretCode = mongoose.models.SecretCode || mongoose.model('SecretCode', secretCodeSchema);

export default SecretCode;
