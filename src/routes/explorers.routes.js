import express from 'express';
import HttpError from 'http-errors';
import HttpStatus from 'http-status';
import { mongoose } from 'mongoose';

import explorerValidators from '../validators/explorer.validator.js'
import ExplorerRepository from "../repositories/explorer.repository.js"
import validator from '../middlewares/validator.js';
import BlacklistedJWTRepository from "../repositories/blacklistedJWT.repository.js";
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

class ExplorersRoutes {
    constructor() {
        // router.put('/:idExplorer', explorerValidators.partial(), validator, this.put);
        router.get('/:idExplorer', this.getOne);
        router.post('/', explorerValidators.complete(), validator, this.post); // Ajout d'un explorer
        router.get('/actions/login', authorizationJWT , this.login);
        router.get('/actions/logout', this.logout)
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

    // Route pour la connexion
    async getOne(req, res, next) {
        try {
        const idExplorer = req.params.idExplorer;

        let explorer = await ExplorerRepository.retrieveById(idExplorer);

        if (!explorer)
        {
            return next(HttpError.NotFound(`Il n'y a pas d'explorateur avec l'id :"${idExplorer}"`));
        }
    
        explorer = ally.toObject({ getters: false, virtuals: true });

        res.json(explorer).status(200);
        } catch (err)
        {
            return next(err);
        }
    }

    // Déconnexion d'un explorer (Blacklist de son token et redirection vers la page de connexion)
    async logout(req, res) {

        // Vérifier ce qui est stocké, supposer avoir stocké Ce qui se trouve après Bearer donc le token
        const tokenToInvalidate = req.headers.authorization.split(' ')[1];

        await BlacklistedJWTRepository.create(tokenToInvalidate);

        res.status(200).json({ message: 'Logged out successfully' });
        res.redirect('/login'); // TODO: !!! Redirection au Login à VALIDER !!!
    }

    // Création d'un explorer
    async post(req, res, next) {
        const newExplorer = req.body;

        let emailSearch = await ExplorerRepository.retrieveByEmail(newExplorer.email);
        let usernameSearch = await ExplorerRepository.retrieveByUsername(newExplorer.username);

        if(emailSearch.length)
        {
            return next(HttpError.Conflict("L'addresse email existe déja dans la base de données."));
        }

        if(usernameSearch.length)
        {
            return next(HttpError.Conflict("Le username existe déjà dans la base de données."));
        }

        //Si la requete est vide
        if(Object.keys(newExplorer).length === 0) 
        {//On retourne une erreur BadRequest
            return next(HttpError.BadRequest('Le client ne peut pas contenir aucune donnée'));
        }

        try {
            let explorer = await ExplorerRepository.create(newExplorer);

            explorer = explorer.toObject({getters:false, virtuals:false});
            explorer = ExplorerRepository.transform(explorer);
            const tokens = ExplorerRepository.generateJWT(explorer.email);
            res.status(201).json({explorer, tokens});
        } catch(err) {
            return next(err);
        }
    }

};

new ExplorersRoutes();
export default router;