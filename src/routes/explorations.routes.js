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

      //À Changer, (chercher dans les explorations de l'explorer)
      //let exploration = await ExplorationRepository.retrieveById(idExploration, idExplorer);
      let exploration = await ExplorationRepository.retrieveById(idExploration);

      if (!exploration) {
        return next(HttpError.NotFound(`L'exploration avec l'id "${idExploration}" n'existe pas!`));
      }

      exploration = exploration.toObject({ getters: false, virtuals: false });
      exploration = ExplorationRepository.transform(exploration);

      // Peut-être besoin de transform plus tard
      // exploration = explorationRepository.transform(exploration, retrieveOptions);

      //return location

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

      let explorations = await ExplorationRepository.retrieveAll(idExplorer);

      //Pour la pagination (peut-être)
      //const pageCount = Math.ceil(itemsCount / req.query.limit);
      //const hasNextPage = paginate.hasNextPages(req)(pageCount);
      //const pageArray = paginate.getArrayPages(req)(3, pageCount, req.query.page);

      explorations = explorations.map(e => {
        e = e.toObject({ getters: false, virtuals: false });
        e = ExplorationRepository.transform(e);
        return e;
      });

      //retourne les allies
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

      //Appelle le serveur pour aller chercher une exploration
      await axios.get(url)
        .then(res => {
          explorationData = res.data;
        })
        .catch(err => {
          return next(err);
        });

      let allyData;
      allyData = explorationData.ally;
      
      //Si on allié est présent dans l'exploration
      let ally;
      let idAlly;
      if(allyData)
      {
        ally = await allyRepository.create(allyData);
        ally = ally.toObject({getters:false, virtuals:false});
        idAlly = ally._id;
        ally = allyRepository.transform(ally);
      }

      //Transformer l'exploration pour la créer dans les données de l'allié
      let explorationTransformed = await ExplorationRepository.transformIntoExploration(explorationData, ally);

      explorationTransformed.explorer = idExplorer;
      explorationTransformed.ally = idAlly;

      //Crée l'exploration
      let exploration = await ExplorationRepository.create(explorationTransformed);
      exploration = exploration.toObject({getters:false, virtuals:false});
      exploration = ExplorationRepository.transform(exploration);

      //Ajoute le id de l'ally à l'exploration qui sera plus tard mis-à-jour
      //Suite à plusieurs autres transformations

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
        //chances de 1 à 5 (minimum de 5 et maximum de 5 quantité bonus)
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

      // Ici je retrieve l'explorer pour modifier sa location
      let explorer = await ExplorerRepository.retrieveById(idExplorer);
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