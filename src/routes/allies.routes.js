import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

import AllyRepository from "../repositories/ally.repository.js"
import ExplorerRepository from '../repositories/explorer.repository.js';

const router = express.Router();

class AlliesRoutes {
    constructor() {
        router.get('/:idExplorer/allies', authorizationJWT, this.getAll); //Trouver les alliés d'un explorateur
        router.get('/:idExplorer/allies/:idAlly', authorizationJWT, this.getOne); //Trouver un allié précis d'un explorateur
        router.post('/:idExplorer/allies/:idAlly', authorizationJWT, this.post); //Création d'un ally (capture de l'ally de l'idAlly)
      }
    
    // Récupérer un ally à partir d'un id d'un ally
    async getOne(req, res, next) 
    {
        try 
        {
          const idExplorer = req.params.idExplorer;
          const idAlly = req.params.idAlly;
    
  
          let ally = await AllyRepository.retrieveById(idAlly);
    
          if (!ally)
          {
            return next(HttpError.NotFound(`l'ally avec l'id "${idAlly}" n'existe pas!`));
          }

          //Si l'ally n'a pas encore été capturé
          if (ally.explorer == undefined)
          {
            return next(HttpError.Unauthorized(`l'ally ne vous appartient pas`));
          }

          //Vérifie si le token correspond à l'explorateur trouvé
          let explorer = await ExplorerRepository.retrieveById(ally.explorer);
          const isMe = req.auth.email === explorer.email;
          if(!isMe) 
          {
            return next(HttpError.Forbidden());
          }
    
          ally = ally.toObject({ getters: false, virtuals: false });
          ally = AllyRepository.transform(ally);
    
          res.json(ally).status(200);
        } catch (error) {
          return next(error);
        }
    }  
    
    // Récupérer les allies d'un user
    async getAll(req, res, next) 
    {
        try 
        {
          
          const idExplorer = req.params.idExplorer;
    
          let allies = await AllyRepository.retrieveAll(idExplorer);

          allies = allies.map(a => {
            a = a.toObject({getters:false, virtuals:false});
            a = AllyRepository.transform(a);
            return a;
          });

          let explorer = await ExplorerRepository.retrieveById(idExplorer);
          const isMe = req.auth.email === explorer.email;
          if(!isMe) 
          {
            return next(HttpError.Forbidden());
          }
    
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
        let explorer = await ExplorerRepository.retrieveById(idExplorer);

        //Erreur
        //Si le ally appartient déjà à quelqu'un, il ne peut pas être capturé
        if(allyData.explorer != undefined)
        {
          return res.status(409).json("Cet allié a déjà été capturé");
        }

        //Vérifie si le token correspond à l'explorateur trouvé
        const isMe = req.auth.email === explorer.email;
        if(!isMe) 
        {
          return next(HttpError.Forbidden());
        }

        //constantes et variables pour vérifier les élements du
        //ally et de l'explorateur, pour être en mesure de payer
        const elementsAlly = allyData.kernel;
        const elementsExplorer = explorer.inventory.elements;

        //Vérifie pour chaque élément de l'ally
        for(let i = 0; i < elementsAlly.length; i++)
        {
          //Variable pour vérifié si l'élément est présent dans l'inventaire de l'Explorateur et payé
          let elementPayed = false;

          //Vérifie pour chaque élément de l'explorateur
          for(let j = 0; j < elementsExplorer.length; j++)
          {
            //Si les 2 éléments correspondent et que l'explorer en a au moins 1
            if((elementsExplorer[j].element == elementsAlly[i]) && (elementsExplorer[j].quantity > 0))
            {

              //Paye l'élément qui correspond et le retire d el'inventaire de l'explorateur
              explorer.inventory.elements[j].quantity = explorer.inventory.elements[j].quantity - 1;

              elementPayed = true;
            }
          }

          //Erreur
          //Si l'explorateur n'a pas pu payer l'élément
          if(!elementPayed)
          {
            return res.status(409).json("Vous n'avez pas assez d'éléments pour payer cet allié");
          }
        }

        //Si tous les contraintes sont respectées, on update l'ally et l'explorateur
        allyData.explorer = idExplorer;
        let ally = await AllyRepository.update(idAlly, allyData);
        ally = ally.toObject({getters:false, virtuals:false});
        ally = await AllyRepository.transform(ally);
        await ExplorerRepository.update(idExplorer, explorer);
        
        res.status(201).json({Réussi: "Capturé avec succès", ally});
      } catch (err) {
        return next(err);
      }
    }
}

new AlliesRoutes();
export default router;