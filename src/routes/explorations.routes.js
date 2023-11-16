import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import axios from 'axios';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

import ExplorationRepository from "../repositories/exploration.repository.js"

const router = express.Router();


class ExplorationsRoutes {
    constructor() {
        router.get('/:idExplorer/explorations', authorizationJWT, this.getAll); //Trouver les explorations d'un explorateur
        router.get('/:idExplorer/explorations/:idExploration', authorizationJWT, this.getOne); //Trouver une exploration précise d'un explorateur
        router.post('/actions/explore/:key', authorizationJWT, this.post); //Explorer
      }
    
    // Récupérer une exploration à partir d'"un id d'exploration
    async getOne(req, res, next) {
        try {
        //   Peut-être mettre des options plus tard
        //   const retrieveOptions = {};
        //   if (req.query.embed && req.query.embed === '') {
        //     retrieveOptions. = true;
        //   }
    
          
          const idExplorer = req.params.idExploration;

          const idExploration = req.params.idExploration;
    
          //À Changer, (chercher dans les explorations de l'explorer)
          let exploration = await ExplorationRepository.retrieveById(idExploration);
    
          if (!exploration)
          {
            return next(HttpError.NotFound(`L'exploration avec l'id "${idExploration}" n'existe pas!`));
          }
    
            exploration = exploration.toObject({ getters: false, virtuals: true });

            // Peut-être besoin de transform plus tard
            // exploration = explorationRepository.transform(exploration, retrieveOptions);
    
          res.json(exploration).status(200);
        } catch (error) {
          return next(error);
        }
    } 

    // Récupérer les exporations d'un user
    async getAll(req, res, next) {

      //Pour la pagination (peut-être)
      //const retrieveOptions = {
      //  skip: req.skip,
      //  limit: req.query.limit
      //};

      try {
        
        const idExplorer = req.params.idExplorer;
  
        const explorations = ExplorationRepository.retrieveAll(idExplorer);

        //Pour la pagination (peut-être)
        //const pageCount = Math.ceil(itemsCount / req.query.limit);
        //const hasNextPage = paginate.hasNextPages(req)(pageCount);
        //const pageArray = paginate.getArrayPages(req)(3, pageCount, req.query.page);

        explorations = explorations.map(e => {
          e = e.toObject({getters:false, virtuals:false});
          e = ordersRepository.transform(e);
          return e;
        });
  
        //retourne les allies
        res.status(200).json(explorations);
  
      } catch (error) {
        return next(error);
      }
  }  
    
    // Création d'une exploration
    async post(req, res, next) 
    {
        try {

            const explorationKey = req.params.key;

            let url = process.env.PORTAL_URL + explorationKey;
            let explorationData;

            await axios.get(url)
            .then(res => {
              explorationData = res.data;
            })
            .catch(err => {
              return next(err);
            });

            res.status(201).json(explorationData);

            //Ajouter dans la base de données! (À faire plus tard)
            //let exploration = await ExplorationRepository.create(req.body);
            //exploration = exploration.toObject({getters:false, virtuals:false});
            //exploration = ExplorationRepository.transform(exploration);
            //res.status(201).json({exploration, tokens});
        } catch(err) {
            return next(err);
        }
    }
}

new ExplorationsRoutes();
export default router;