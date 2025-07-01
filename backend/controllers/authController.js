const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    try {
        const { name, prenom, email, password, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            prenom,
            email,
            password: hashedPassword,
            phone
        });

        await user.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { userId: user._id },
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            userId: user._id,
            token,
            name: user.name,
            prenom: user.prenom,
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des données utilisateur' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, prenom, phone, email } = req.body;
        const userId = req.auth.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, prenom, phone, email },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des données' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du compte' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Aucun compte associé à cet email' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            'RESET_TOKEN_SECRET',
            { expiresIn: '1h' }
        );

        // Store reset token and expiry in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // For now, just return success (you'll need to implement email sending later)
        res.status(200).json({ 
            message: 'Instructions de réinitialisation envoyées à votre adresse email',
            // In development, you might want to return the token for testing
            resetToken: resetToken 
        });

    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid reset token and token not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Le token de réinitialisation est invalide ou a expiré'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Mot de passe réinitialisé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({
            message: 'Erreur lors de la réinitialisation du mot de passe'
        });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token non fourni' });
        }

        // Vérifier si le token est valide et n'a pas expiré
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Le token de réinitialisation est invalide ou a expiré'
            });
        }

        // Si le token est valide, renvoyer une réponse de succès
        res.status(200).json({ message: 'Token valide' });

    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        res.status(500).json({
            message: 'Erreur lors de la vérification du token'
        });
    }
};