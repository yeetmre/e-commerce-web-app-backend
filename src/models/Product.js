const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur']
  },
  price: {
    type: Number,
    required: [true, 'Ürün fiyatı zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  stock: {
    type: Number,
    required: [true, 'Stok miktarı zorunludur'],
    min: [0, 'Stok 0\'dan küçük olamaz'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Kategori zorunludur']
  },
  images: [{
    type: String,
    required: [true, 'En az bir ürün görseli zorunludur']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);