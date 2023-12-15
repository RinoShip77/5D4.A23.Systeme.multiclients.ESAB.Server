import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import axios from 'axios';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';
import elements from '../utils/elements.js'
import ExplorationRepository from "../repositories/exploration.repository.js"
import ExplorerRepository from "../repositories/explorer.repository.js"
import allyRepository from '../repositories/ally.repository.js';

const router = express.Router();


class ExplorationsRoutes {
  constructor() {
    router.get('/:idExplorer/explorations', authorizationJWT, this.getAll); //Trouver les explorations d'un explorateur
    router.get('/:idExplorer/explorations/:idExploration', authorizationJWT, this.getOne); //Trouver une exploration précise d'un explorateur
    router.post('/:idExplorer/explorations', authorizationJWT, this.post); //Création d'une exploration à l'aide d'une clé de portal
  }

  // Récupérer une exploration à partir d'un id d'exploration
  async getOne(req, res, next) 
  {
    try 
    {
      const idExploration = req.params.idExploration;
      const idExplorer = req.params.idExplorer;

      let exploration = await ExplorationRepository.retrieveById(idExploration);

      if (!exploration) {
        return next(HttpError.NotFound(`L'exploration avec l'id "${idExploration}" n'existe pas!`));
      }

      let explorer = await ExplorerRepository.retrieveById(exploration.explorer);

      //Vérifie si le token correspond à l'explorateur trouvé
      const isMe = req.auth.email === explorer.email;
      if(!isMe) 
      {
          return next(HttpError.Forbidden());
      }

      exploration = exploration.toObject({ getters: false, virtuals: false });
      exploration = ExplorationRepository.transform(exploration);

      res.json(exploration).status(200);
    } 
    catch (error) 
    {
      return next(error);
    }
  }

  // Récupérer les exporations d'un user
  async getAll(req, res, next) 
  {
    try 
    {
      const idExplorer = req.params.idExplorer;

      let explorations = await ExplorationRepository.retrieveAll(idExplorer);

      explorations = explorations.map(e => {
        e = e.toObject({ getters: false, virtuals: false });
        e = ExplorationRepository.transform(e);
        return e;
      });

      let explorer = await ExplorerRepository.retrieveById(idExplorer);

      //Vérifie si le token correspond à l'explorateur trouvé
      const isMe = req.auth.email === explorer.email;
      if(!isMe) 
      {
          return next(HttpError.Forbidden());
      }

      //retourne les explorations
      res.status(200).json(explorations);

    } catch (error) {
      return next(error);
    }
  }

  // Création d'une exploration
  async post(req, res, next) {
    try {

      const idExplorer = req.params.idExplorer;
      const explorationKey = req.body.key;

      let url = process.env.PORTAL_URL + explorationKey;
      let explorationData;

      //Vérifie si le token correspond à l'explorateur trouvé
      let explorer = await ExplorerRepository.retrieveById(idExplorer);
      const isMe = req.auth.email === explorer.email;
      if(!isMe) 
      {
          return next(HttpError.Forbidden());
      }

      //Appelle un api pour aller chercher une exploration
      await axios.get(url)
        .then(res => {
          explorationData = res.data;
        })
        .catch(err => {
          return next(err);
        });

      //Prend le ally de l'Exploration retournée par l'api
      let allyData;
      allyData = explorationData.ally;
      
      //Si on allié est présent dans l'exploration, on le crée
      let ally;
      let idAlly;
      if(allyData)
      {
        ally = await allyRepository.create(allyData);
        ally = ally.toObject({getters:false, virtuals:false});
        idAlly = ally._id;
        ally = allyRepository.transform(ally);
      }

      //Transformer l'exploration pour plus tard la créer
      let explorationTransformed = await ExplorationRepository.transformIntoExploration(explorationData, ally);

      //Ajoute l'explorateur et l'allié à l'exploration
      explorationTransformed.explorer = idExplorer;
      explorationTransformed.ally = idAlly;

      //Crée l'exploration
      let exploration = await ExplorationRepository.create(explorationTransformed);
      exploration = exploration.toObject({getters:false, virtuals:false});
      exploration = ExplorationRepository.transform(exploration);

      //Lance un random pour déterminer si on renvoit un bonus chest ou non
      let bonusChest;
      let randomChanceChest = Math.floor(Math.random() * 10);

      //chances de 1 à 3 (minimum de 1 et maximum de 3 éléments bonus)
      const max = 2;
      const min = 0;
      const randomElementQuantity = Math.random() * (max - min + 1) + min;

      //Ajoute un élément bonus selon le nombre aléatoire généré
      let randomElements = new Array();
      for(let i = 0; i < randomElementQuantity; i++ )
      {
        //chances de 1 à 5 (minimum de 1 et maximum de 5 quantité bonus)
        const maxElementQuantity = 4;
        const minElementQuantity = 0;
        //Génere une quantité aléatoire à donner pour l'élément
        let randomQuantity = Math.floor(Math.random() * (maxElementQuantity - minElementQuantity + 1) + minElementQuantity);

        //On ne veut pas offrir une quantité de 0
        if(randomQuantity == 0)
        {
          randomQuantity++;
        }

        //Ajout l'élément et sa quantité à la liste
        randomElements.push({"element" : elements[Math.floor(Math.random() * elements.length)].symbol, "quantity" : randomQuantity});
      }
      
      //2 chances sur 10
      if(randomChanceChest <= 1)
      {
        bonusChest = 
        {
          //nombre d'inox random entre 1 et 10
          inox: Math.floor(Math.random() * 10),
          //éléments qui équivaut à la liste précédemment générée
          elements: randomElements
        }
      }

      //ajoute les informais à l'Exploration
      exploration.chance = randomChanceChest;
      exploration.bonusChest = bonusChest;

      //Ajoute le Ally à l'information envoyée au user.
      if(ally)
      {
        exploration.ally = ally;
      }

      // Ici je retrieve l'explorer pour modifier sa location
      explorer.location = exploration.destination;

      // Si des inox et des éléments sont présent dans l'exploration
      if(exploration.vault.inox && exploration.vault.elements)
      {
        //Ajoute les inox de l'Exploration à l'inventaire de l'Explorateur
        explorer.inventory.inox += exploration.vault.inox;

        //Vérifie dans les éléments de l'exploration
        exploration.vault.elements.forEach(elementExploration => 
        {
          //Constante booléenne pour faire une vérification
          let exist = false;

          //Vérifie dans les éléments de l'explorateur
          explorer.inventory.elements.forEach(elementExplorer => 
          {
            //Si les 2 éléments concordent
            if(elementExploration.element === elementExplorer.element) 
            {
              //ajoute une quantité à l'élément à la place d'en créer un nouveau
              elementExplorer.quantity += elementExploration.element;
              exist = true;
            }
          });

          //S'il existe pas, ajoute un nouvel éléement à l'inventaire de l'explorateur
          if(!exist)
          {
            explorer.inventory.elements.push(elementExploration);
          }
        });

      }

      // Si l'Explorateur a eu la chance d'avoir un bonusChest
      if(bonusChest)
      {
        //Ajoute les inox de du bonusChest à l'inventaire de l'Explorateur
        explorer.inventory.inox += bonusChest.inox;

        //Vérifie dans chaque élément du bonusChest
        bonusChest.elements.forEach(elementBonus=> 
        {
          //Constante booléenne pour faire une vérification
          let exist = false;

          //Vérifie dans chaque élément de l'Explorateur
          explorer.inventory.elements.forEach(elementExplorer => 
          {
            //Si les 2 éléments concordent
            if(elementBonus.element === elementExplorer.element) 
            {
              //ajoute une quantité à l'élément à la place d'en créer un nouveau
              elementExplorer.quantity += elementBonus.element;
              exist = true;
            }
          });

          //S'il existe pas, ajoute un nouvel éléement à l'inventaire de l'explorateur
          if(!exist)
          {
            explorer.inventory.elements.push(elementBonus);
          }
        });

      }

      // Je dois maintenant le sauvegarder AWAIT IMPORTANT pour UPDATE des inox et elements en BD!
      await ExplorerRepository.update(idExplorer, explorer);

      res.status(201).json(exploration);
    } catch (err) {
      return next(err);
    }
  }

  
}

new ExplorationsRoutes();
export default router;