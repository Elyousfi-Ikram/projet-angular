const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentMethodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardType: {
        type: String,
        required: true,
        enum: ['visa', 'mastercard', 'amex', 'paypal', 'applepay']
    },
    cardholderName: {
        type: String,
        required: function() {
            return ['visa', 'mastercard', 'amex'].includes(this.cardType);
        },
        trim: true
    },
    encryptedCardNumber: {
        type: String,
        required: function() {
            return ['visa', 'mastercard', 'amex'].includes(this.cardType);
        }
    },
    lastFourDigits: {
        type: String,
        required: function() {
            return ['visa', 'mastercard', 'amex'].includes(this.cardType);
        }
    },
    expiryMonth: {
        type: String,
        required: function() {
            return ['visa', 'mastercard', 'amex'].includes(this.cardType);
        },
        match: /^(0[1-9]|1[0-2])$/
    },
    expiryYear: {
        type: String,
        required: function() {
            return ['visa', 'mastercard', 'amex'].includes(this.cardType);
        },
        match: /^[0-9]{2}$/
    },
    // Champs spécifiques pour PayPal
    paypalEmail: {
        type: String,
        required: function() {
            return this.cardType === 'paypal';
        },
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    paypalName: {
        type: String,
        required: function() {
            return this.cardType === 'paypal';
        },
        trim: true
    },
    // Champs spécifiques pour Apple Pay
    applePayDeviceId: {
        type: String,
        required: function() {
            return this.cardType === 'applepay';
        }
    },
    applePayName: {
        type: String,
        required: function() {
            return this.cardType === 'applepay';
        },
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Fonction pour chiffrer le numéro de carte
paymentMethodSchema.statics.encryptCardNumber = function(cardNumber) {
    const algorithm = 'aes-256-cbc';
    // Clé de 32 octets (256 bits) pour AES-256
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);