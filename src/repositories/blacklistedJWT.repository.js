import blacklistedJWT from "../models/blacklistedJWT.model.js";

class blacklistedJWTRepository {

    // Ajouter un token dans la blacklist
    async create(tokenToInvalidate) {
        try {
          const blacklistedToken = new blacklistedJWT({ token: tokenToInvalidate }); // Par défaut blacklist Date.now, donc je lui passe seulement le token à ajouter dans la blacklist
          await blacklistedToken.save();
          return blacklistedToken;
        } catch (error) {
          throw error;
        }
      }
    
      // Vérifier et retrouver si un token est dans la liste
      async findByToken(token) {
        try {
          const blacklistedToken = await blacklistedJWT.findOne({ token });
          return blacklistedToken;
        } catch (error) {
          throw error;
        }
      }
    
      // Retirer de la blacklist
      async deleteByToken(token) {
        try {
          await blacklistedJWT.deleteOne({ token });
        } catch (error) {
          throw error;
        }
      }
}

export default new blacklistedJWTRepository();
