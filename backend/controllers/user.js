const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                name: req.body.name,
                prenom: req.body.prenom,
                email: req.body.email,
                phone: req.body.phone,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        ),
                        name: user.name,
                        prenom: user.prenom,
                        email: user.email
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.deleteAccount = (req, res, next) => {
    // Récupérer l'ID de l'utilisateur depuis le token d'authentification
    const userId = req.auth.userId;

    User.findByIdAndDelete(userId)
        .then(() => res.status(200).json({ message: 'Compte supprimé avec succès' }))
        .catch(error => res.status(400).json({ error }));
};