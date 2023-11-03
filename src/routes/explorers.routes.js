import express from 'express';
import paginate from 'express-paginate';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';

import explorerValidators from '../validators/explorer.validator.js'
import ExplorerRepository from "../repositories/explorer.repository.js"
import validator from '../middlewares/validator.js';
import BlacklistedJWTRepository from "../repositories/blacklistedJWT.repository.js";
import { authorizationJWT, refreshJW } from '../middlewares/authorization.jwt.js';

const router = express.Router();

class ExplorersRoutes {
    constructor() {
        router.get('/', paginate.middleware(20, 40), this.getAll);
        // router.put('/:idExplorer', explorerValidators.partial(), validator, this.put);
        router.get('/:idExplorer', this.getOne);
        // router.post('/', explorerValidators.complete(), validator, this.post); // Ajout d'un explorer
        router.post('/actions/login', authorizationJWT , this.login);
        router.post('/actions/logout', this.logout)
      }

      // Route pour la connexion
      async login(req, res, next) {
        const { email, username, password } = req.body;
        if((email && username) || email === "" || username === "") {
            return next(HttpError.BadRequest(''));
        }

        const result = await ExplorerRepository.login(email, username, password);
        if(result.explorer) {
            // Nous sommes connectés
            let explorer = result.explorer.toObject({getters:false, virtuals:false});
            explorer = ExplorerRepository.transform(explorer);
            const tokens = ExplorerRepository.generateJWT(explorer.email);
            res.status(201).json({explorer, tokens});
        } else {
            // Erreur lors de la connexion
            return next(result.err);
        }
    }

    // Déconnexion d'un explorer (Blacklist de son token et redirection vers la page de connexion)
    logout(req, res) {

        // Vérifier ce qui est stocké, supposer avoir stocké Ce qui se trouve après Bearer donc le token
        const tokenToInvalidate = req.headers.authorization.split(' ')[1];

        BlacklistedJWTRepository.create(tokenToInvalidate);

        res.status(200).json({ message: 'Logged out successfully' });
        res.redirect('/login'); // TODO: !!! Redirection au Login à VALIDER !!!
    }

    // Création d'un explorer
    async post(req, res, next) {
        try {
            let explorer = await ExplorerRepository.create(req.body);
            explorer = explorer.toObject({getters:false, virtuals:false});
            explorer = ExplorerRepository.transform(explorer);
            const tokens = ExplorerRepository.generateJWT(explorer.email);
            res.status(201).json({explorer, tokens});
        } catch(err) {
            return next(err);
        }

    }

}

new ExplorersRoutes();
export default router;