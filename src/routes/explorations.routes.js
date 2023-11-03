import express from 'express';
import paginate from 'express-paginate';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';

import explorationRepository from "../repositories/exploration.repository.js"

const router = express.Router();

class ExplorationsRoutes {
    constructor() {
        router.get('/', paginate.middleware(20, 40), this.getAll);
        router.get('/:idExploration', this.getOne);
      }
    
    // Récupérer une exploration à partir d'"un id d'exploration
    async getOne(req, res, next) {
        try {
        //   Peut-être mettre des options plus tard
        //   const retrieveOptions = {};
        //   if (req.query.embed && req.query.embed === '') {
        //     retrieveOptions. = true;
        //   }
    
          const idExploration = req.params.idExploration;
    
          let Exploration = await explorationRepository.retrieveById(idExploration);
    
          if (!Exploration)
            return next(HttpError.NotFound(`Le client avec l'id "${idExploration}" n'existe pas!`));
    
            Exploration = Exploration.toObject({ getters: false, virtuals: true });
            // Pas besoin de transform
            // Exploration = explorationRepository.transform(Exploration, retrieveOptions);
    
          res.json(Exploration).status(200);
        } catch (error) {
          return next(error);
        }
    }  
}

new ExplorationsRoutes();
export default router;