import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  refreshToken: {
    type: String,
    default: null
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = bcrypt.hashSync(Date.now().toString(), 10);
  this.refreshToken = refreshToken;
  return refreshToken;
};

// Method to verify refresh token
userSchema.methods.verifyRefreshToken = function(token) {
  return bcrypt.compareSync(token, this.refreshToken);
};

const User = mongoose.model('User', userSchema);
export default User; 