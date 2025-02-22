const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
    select: false,
    validate: {
      validator: function(value) {
        // En az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(value);
      },
      message: 'Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir'
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'İsim çok kısa'],
    maxlength: [50, 'İsim çok uzun']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Soyisim çok kısa'],
    maxlength: [50, 'Soyisim çok uzun']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Password hash middleware - salt rounds arttırıldı
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Salt rounds 12'ye çıkarıldı (daha güvenli ama daha yavaş)
  this.password = await bcrypt.hash(this.password, 12);
  
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Şifre değişikliğinden sonra token geçerli mi kontrolü
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Başarısız login denemelerini kontrol et
userSchema.methods.incrementLoginAttempts = async function() {
  // Kilitleme süresi geçtiyse sıfırla
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = undefined;
    this.accountLocked = false;
  } else {
    this.failedLoginAttempts += 1;
    
    // 5 başarısız denemeden sonra hesabı kilitle
    if (this.failedLoginAttempts >= 5 && !this.accountLocked) {
      this.accountLocked = true;
      this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 dakika
    }
  }
  await this.save();
};

// Başarılı login sonrası
userSchema.methods.successfulLogin = async function() {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.accountLocked = false;
  this.lastLogin = Date.now();
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;