import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

import AllyRepository from "../repositories/ally.repository.js"
import allyRepository from '../repositories/ally.repository.js';

const router = express.Router();

class AlliesRoutes {
    constructor() {
        router.get('/:idExplorer/allies', this.getAll); //Trouver les allies d'un explorateur
        router.get('/:idExplorer/allies/:idAlly', authorizationJWT, this.getOne); //Trouver un ally précis d'un explorateur
        router.post('/:idExplorer/allies/:idAlly', authorizationJWT, this.post); //Explorer
      }
    
    // Récupérer une exploration à partir d'"un id d'exploration
    async getOne(req, res, next) {
        try {
        //   Peut-être mettre des options plus tard
        //   const retrieveOptions = {};
        //   if (req.query.embed && req.query.embed === '') {
        //     retrieveOptions. = true;
        //   }
    
          const idExplorer = req.params.idExplorer;
          const idAlly = req.params.idAlly;
    
          //À Changer (prendre en compte le idExplorer)
          let ally = await AllyRepository.retrieveById(idAlly);
    
          if (!ally)
          {
            return next(HttpError.NotFound(`Le client avec l'id "${idAlly}" n'existe pas!`));
          }
    
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
    
          let allies = await AllyRepository.retrieveAll(idExplorer);

          //Pour la pagination
          //const pageCount = Math.ceil(itemsCount / req.query.limit);
          //const hasNextPage = paginate.hasNextPages(req)(pageCount);
          //const pageArray = paginate.getArrayPages(req)(3, pageCount, req.query.page);

          allies = allies.map(a => {
            a = a.toObject({getters:false, virtuals:false});
            a = AllyRepository.transform(a);
            return a;
          });
    
          //retourne les allies
          res.status(200).json(allies);
    
        } catch (error) {
          return next(error);
        }
    }  

    // Capture d'un ally
    async post(req, res, next) {
      try {

        const idExplorer = req.params.idExplorer;
        const idAlly = req.params.idAlly;


        let allyData = await AllyRepository.retrieveById(idAlly);

        if(allyData.explorer == undefined)
        {
          allyData.explorer = idExplorer;
        }
        else
        {
          //res.status(201).json("Cet allié a déjà été capturé");
          //throw "allié non";
        }
        
        
        let ally = await AllyRepository.update(idAlly, allyData);
        

        res.status(201).json({Réussi: "Capturé avec succès", ally});

        //Ajouter dans la base de données! (À faire plus tard)
        //let exploration = await ExplorationRepository.create(req.body);
        //exploration = exploration.toObject({getters:false, virtuals:false});
        //exploration = ExplorationRepository.transform(exploration);
        //res.status(201).json({exploration, tokens});
      } catch (err) {
        return next(err);
      }
    }
}

new AlliesRoutes();
export default router;