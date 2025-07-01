const PaymentMethod = require('../models/payment');
const mongoose = require('mongoose');

exports.addPaymentMethod = async (req, res) => {
    try {
        const { cardType, cardholderName, cardNumber, expiryMonth, expiryYear, paypalEmail, paypalName, applePayDeviceId, applePayName } = req.body;
        const userId = req.auth.userId;

        let paymentData = {
            userId,
            cardType
        };

        // Validation et traitement selon le type de paiement
        if (['visa', 'mastercard', 'amex'].includes(cardType)) {
            // Validation pour les cartes de crédit
            if (!cardNumber || !cardNumber.match(/^[0-9]{16}$/)) {
                return res.status(400).json({ message: 'Le numéro de carte doit contenir exactement 16 chiffres' });
            }

            if (!expiryMonth || !expiryMonth.match(/^(0[1-9]|1[0-2])$/)) {
                return res.status(400).json({ message: 'Mois d\'expiration invalide' });
            }

            if (!expiryYear || !expiryYear.match(/^[0-9]{2}$/)) {
                return res.status(400).json({ message: 'Année d\'expiration invalide' });
            }

            if (!cardholderName) {
                return res.status(400).json({ message: 'Le nom du titulaire est requis' });
            }

            // Chiffrement du numéro de carte
            const encryptedCardNumber = PaymentMethod.encryptCardNumber(cardNumber);
            const lastFourDigits = cardNumber.slice(-4);

            paymentData = {
                ...paymentData,
                cardholderName,
                encryptedCardNumber,
                lastFourDigits,
                expiryMonth,
                expiryYear
            };
        } else if (cardType === 'paypal') {
            // Validation pour PayPal
            if (!paypalEmail || !paypalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                return res.status(400).json({ message: 'Email PayPal invalide' });
            }

            if (!paypalName) {
                return res.status(400).json({ message: 'Le nom PayPal est requis' });
            }

            paymentData.paypalEmail = paypalEmail;
            paymentData.paypalName = paypalName;
        } else if (cardType === 'applepay') {
            // Validation pour Apple Pay
            if (!applePayDeviceId) {
                return res.status(400).json({ message: 'ID de l\'appareil Apple Pay requis' });
            }

            if (!applePayName) {
                return res.status(400).json({ message: 'Le nom Apple Pay est requis' });
            }

            paymentData.applePayDeviceId = applePayDeviceId;
            paymentData.applePayName = applePayName;
        }

        const newPaymentMethod = new PaymentMethod(paymentData);
        await newPaymentMethod.save();
        
        // Préparer la réponse selon le type
        let responseData = {
            _id: newPaymentMethod._id,
            cardType: newPaymentMethod.cardType
        };

        if (['visa', 'mastercard', 'amex'].includes(cardType)) {
            responseData = {
                ...responseData,
                cardholderName: newPaymentMethod.cardholderName,
                cardNumber: `**** **** **** ${newPaymentMethod.lastFourDigits}`,
                expiryMonth: newPaymentMethod.expiryMonth,
                expiryYear: newPaymentMethod.expiryYear
            };
        } else if (cardType === 'paypal') {
            responseData.paypalEmail = newPaymentMethod.paypalEmail;
            responseData.paypalName = newPaymentMethod.paypalName;
        } else if (cardType === 'applepay') {
            responseData.applePayDeviceId = newPaymentMethod.applePayDeviceId;
            responseData.applePayName = newPaymentMethod.applePayName;
        }
        
        res.status(201).json({
            message: 'Moyen de paiement ajouté avec succès',
            paymentMethod: responseData
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du moyen de paiement', error: error.message });
    }
};

exports.getAllPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find({ userId: req.auth.userId });
        res.status(200).json(paymentMethods.map(method => {
            let responseData = {
                _id: method._id,
                cardType: method.cardType
            };

            if (['visa', 'mastercard', 'amex'].includes(method.cardType)) {
                responseData = {
                    ...responseData,
                    cardholderName: method.cardholderName,
                    cardNumber: method.lastFourDigits ? `**** **** **** ${method.lastFourDigits}` : undefined,
                    expiryMonth: method.expiryMonth,
                    expiryYear: method.expiryYear
                };
            } else if (method.cardType === 'paypal') {
                responseData.paypalEmail = method.paypalEmail;
                responseData.paypalName = method.paypalName;
            } else if (method.cardType === 'applepay') {
                responseData.applePayDeviceId = method.applePayDeviceId;
                responseData.applePayName = method.applePayName;
            }

            return responseData;
        }));
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des moyens de paiement', error: error.message });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID de moyen de paiement invalide' });
        }

        const result = await PaymentMethod.findOneAndDelete({
            _id: req.params.id,
            userId: req.auth.userId
        });

        if (!result) {
            return res.status(404).json({ message: 'Moyen de paiement non trouvé' });
        }

        res.status(200).json({ 
            message: 'Moyen de paiement supprimé avec succès',
            deletedPayment: {
                id: result._id,
                cardType: result.cardType
            }
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la suppression du moyen de paiement', 
            error: error.message 
        });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {
        const { cardType, cardholderName, cardNumber, expiryMonth, expiryYear } = req.body;
        const paymentId = req.params.id;
        const userId = req.auth.userId;

        // Validation de l'ID
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ message: 'ID de moyen de paiement invalide' });
        }

        // Validation des données
        if (cardNumber && !cardNumber.match(/^[0-9]{16}$/)) {
            return res.status(400).json({ message: 'Le numéro de carte doit contenir exactement 16 chiffres' });
        }

        if (expiryMonth && !expiryMonth.match(/^(0[1-9]|1[0-2])$/)) {
            return res.status(400).json({ message: 'Mois d\'expiration invalide' });
        }

        if (expiryYear && !expiryYear.match(/^[0-9]{2}$/)) {
            return res.status(400).json({ message: 'Année d\'expiration invalide' });
        }

        // Préparer les données de mise à jour
        const updateData = {
            cardType,
            cardholderName,
            expiryMonth,
            expiryYear
        };

        // Si un nouveau numéro de carte est fourni, le chiffrer
        if (cardNumber) {
            updateData.encryptedCardNumber = PaymentMethod.encryptCardNumber(cardNumber);
            updateData.lastFourDigits = cardNumber.slice(-4);
        }

        // Mettre à jour le moyen de paiement
        const updatedPayment = await PaymentMethod.findOneAndUpdate(
            { _id: paymentId, userId: userId },
            updateData,
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Moyen de paiement non trouvé' });
        }

        res.status(200).json({
            message: 'Moyen de paiement mis à jour avec succès',
            paymentMethod: {
                _id: updatedPayment._id,
                cardType: updatedPayment.cardType,
                cardholderName: updatedPayment.cardholderName,
                cardNumber: `**** **** **** ${updatedPayment.lastFourDigits}`,
                expiryMonth: updatedPayment.expiryMonth,
                expiryYear: updatedPayment.expiryYear
            }
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la mise à jour du moyen de paiement', 
            error: error.message 
        });
    }
};