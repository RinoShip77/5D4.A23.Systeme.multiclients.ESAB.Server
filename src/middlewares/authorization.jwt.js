import { expressjwt } from "express-jwt";

const authorizationJWT = expressjwt({
    secret: process.env.JWT_PRIVATE_SECRET,
    issuer: process.env.BASE_URL,
    algorithms: ['HS256'],
    isRevoked: async (req, token) => {
        //Gestion des tokens expirés/blacklist
    }
});

const refreshJWT = expressjwt({
    secret: process.env.JWT_REFRESH_SECRET,
    issuer: process.env.BASE_URL,
    algorithms: ['HS256'],
    requestProperty: 'refreshToken'
});

export {authorizationJWT, refreshJWT};