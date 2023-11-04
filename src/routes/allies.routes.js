import express from 'express';
import paginate from 'express-paginate';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';

import AllyRepository from "../repositories/ally.repository.js"
import allyRepository from '../repositories/ally.repository.js';

const router = express.Router();

class AlliesRoutes {
    constructor() {
        router.get('/:idExplorer/allies', paginate.middleware(20, 40), this.getAll);
        router.get('/:idAlly/:idAlly', this.getOne);
      }
    
    // Récupérer une exploration à partir d'"un id d'exploration
    async getOne(req, res, next) {
        try {
        //   Peut-être mettre des options plus tard
        //   const retrieveOptions = {};
        //   if (req.query.embed && req.query.embed === '') {
        //     retrieveOptions. = true;
        //   }
    
          const idAlly = req.params.idAlly;
    
          let ally = await AllyRepository.retrieveById(idAlly);
    
          if (!ally)
            return next(HttpError.NotFound(`Le client avec l'id "${idAlly}" n'existe pas!`));
    
          ally = ally.toObject({ getters: false, virtuals: true });
          // Pas besoin de transform
          // ally = AllyRepository.transform(ally, retrieveOptions);
    
          res.json(ally).status(200);
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
    
          const allies = AllyRepository.retrieveAll(idExplorer);

          //Pour la pagination
          //const pageCount = Math.ceil(itemsCount / req.query.limit);
          //const hasNextPage = paginate.hasNextPages(req)(pageCount);
          //const pageArray = paginate.getArrayPages(req)(3, pageCount, req.query.page);

          allies = allies.map(a => {
            a = a.toObject({getters:false, virtuals:false});
            a = ordersRepository.transform(a);
            return a;
          });
    
          //retourne les allies
          res.status(200).json(allies);
    
        } catch (error) {
          return next(error);
        }
    }  
}

new AlliesRoutes();
export default router;