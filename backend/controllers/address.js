const Address = require('../models/address');

// Un gestionnaire d'erreurs unifié pour les fonctions async
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error('Erreur détaillée:', err);
        res.status(500).json({ 
            message: "Une erreur interne est survenue", 
            error: err.message
        });
    });
};

exports.createAddress = asyncHandler(async (req, res) => {
    const { _id, ...addressData } = req.body;
    const address = new Address({
        ...addressData,
        userId: req.auth.userId
    });
    await address.save();
    res.status(201).json({ message: 'Adresse créée avec succès', address });
});

exports.getAllAddresses = asyncHandler(async (req, res) => {
    const addresses = await Address.find({ userId: req.auth.userId });
    res.status(200).json(addresses || []);
});

exports.updateAddress = asyncHandler(async (req, res) => {
    const { addressId, ...updateData } = req.body;
    const updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId, userId: req.auth.userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedAddress) {
        return res.status(404).json({ message: 'Adresse non trouvée ou non autorisée' });
    }
    res.status(200).json({ message: 'Adresse mise à jour avec succès', address: updatedAddress });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
    const result = await Address.findOneAndDelete({ 
        _id: req.params.id, 
        userId: req.auth.userId 
    });

    if (!result) {
        return res.status(404).json({ message: 'Adresse non trouvée ou non autorisée' });
    }
    res.status(200).json({ message: 'Adresse supprimée avec succès' });
});

exports.validateAddress = (req, res, next) => {
    const { fullName, street, postalCode, city, country } = req.body;
    if (!fullName || !street || !postalCode || !city || !country) {
        return res.status(400).json({
            message: 'Tous les champs sont obligatoires',
            requiredFields: ['fullName', 'street', 'postalCode', 'city', 'country']
        });
    }
    next();
};
