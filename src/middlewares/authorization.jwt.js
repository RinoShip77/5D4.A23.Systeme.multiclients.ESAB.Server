import { expressjwt } from "express-jwt";
import BlacklistedTokenRepository from "../repositories/blacklistedJWT.repository.js"

const authorizationJWT = expressjwt({
    secret: process.env.JWT_PRIVATE_SECRET,
    issuer: process.env.BASE_URL,
    algorithms: ['HS256'],
    isRevoked: async (req, token) => {
        //Gestion des tokens expirés/blacklist
        // Vérifiez si le token est blacklisté
        token = req.headers.authorization; // Récupérer le token dans la requête (si présent)

        if (!token) {
        return false; // Le token n'est pas présent, donc invalide
        }

        // Vérifiez si le token est blacklisté
        const blacklistedToken = await BlacklistedTokenRepository.findByToken(token);

        if (blacklistedToken) {
        return true; // Le token est blacklisté, renvoyez true
        }

        // Le token n'est ni blacklisté ni expiré, autorisez l'accès
        return false;
    }
});

const refreshJWT = expressjwt({
    secret: process.env.JWT_REFRESH_SECRET,
    issuer: process.env.BASE_URL,
    algorithms: ['HS256'],
    requestProperty: 'refreshToken'
});

// Essayer de gérer les token blacklisted

// const blacklistedJWT = async (req, res, next) => {
//   const token = req.header('Authorization').replace('Bearer ', '');

//   try {
//     // Check if the token is blacklisted
//     const tokenExists = await blacklistedToken.findByToken({ token });
//     if (tokenExists) {
//       return res.status(401).json({ message: 'Token is blacklisted' });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }

export {authorizationJWT, refreshJWT};