import express from 'express';
import paginate from 'express-paginate';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';

import explorerValidators from '../validators/explorer.validator.js'
import explorerRepository from "../repositories/explorer.repository.js"
import validator from '../middlewares/validator.js';

const router = express.Router();

class ExplorersRoutes {
    constructor() {
        router.get('/', paginate.middleware(20, 40), this.getAll);
        // router.put('/:idExplorer', explorerValidators.partial(), validator, this.put);
        router.get('/:idExplorer', this.getOne);
        // router.post('/', explorerValidators.complete(), validator, this.post); // Ajout d'un explorer
        router.post('/actions/login', this.login);
      }

      // Route pour la connexion
      async login(req, res, next) {
        const { email, username, password } = req.body;
        if((email && username) || email === "" || username === "") {
            return next(HttpError.BadRequest(''));
        }

        const result = await explorerRepository.login(email, username, password);
        if(result.explorer) {
            // Nous sommes connectés
            let explorer = result.explorer.toObject({getters:false, virtuals:false});
            explorer = explorerRepository.transform(explorer);
            const tokens = explorerRepository.generateJWT(explorer.email);
            res.status(201).json({explorer, tokens});
        } else {
            // Erreur lors de la connexion
            return next(result.err);
        }
    }

}

new ExplorersRoutes();
export default router;