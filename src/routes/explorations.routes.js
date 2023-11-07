import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import axios from 'axios';

import ExplorationRepository from "../repositories/exploration.repository.js"

const router = express.Router();


class ExplorationsRoutes {
    constructor() {
        router.get('/:idExplorer/explorations', this.getAll);
        router.get('/:idExploration', this.getOne);
        router.post('/actions/explore/:key', this.post);
      }
    
    // Récupérer une exploration à partir d'"un id d'exploration
    async getOne(req, res, next) {
        try {
        //   Peut-être mettre des options plus tard
        //   const retrieveOptions = {};
        //   if (req.query.embed && req.query.embed === '') {
        //     retrieveOptions. = true;
        //   }
    
          //const idExplorer = req.params.idExploration;

          const idExploration = req.params.idExploration;
    
          let Exploration = await ExplorationRepository.retrieveById(idExploration);
    
          if (!Exploration)
            return next(HttpError.NotFound(`L'exploration avec l'id "${idExploration}" n'existe pas!`));
    
            Exploration = Exploration.toObject({ getters: false, virtuals: true });
            // Pas besoin de transform
            // Exploration = explorationRepository.transform(Exploration, retrieveOptions);
    
          res.json(Exploration).status(200);
        } catch (error) {
          return next(error);
        }
    } 

    // Récupérer les exporations d'un user
    async getAll(req, res, next) {
      //Pour la pagination
      //const retrieveOptions = {
      //  skip: req.skip,
      //  limit: req.query.limit
      //};

      try {
        
        const idExplorer = req.params.idExplorer;
  
        const explorations = ExplorationRepository.retrieveAll(idExplorer);

        //Pour la pagination
        //const pageCount = Math.ceil(itemsCount / req.query.limit);
        //const hasNextPage = paginate.hasNextPages(req)(pageCount);
        //const pageArray = paginate.getArrayPages(req)(3, pageCount, req.query.page);

        explorations = explorations.map(e => {
          e = a.toObject({getters:false, virtuals:false});
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

            res.status(200).json(explorationData);
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