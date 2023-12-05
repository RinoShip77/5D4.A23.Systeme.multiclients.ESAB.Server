import express from 'express';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';
import axios from 'axios';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

import ExplorationRepository from "../repositories/exploration.repository.js"
import allyRepository from '../repositories/ally.repository.js';

const router = express.Router();


class ExplorationsRoutes {
  constructor() {
    router.get('/:idExplorer/explorations', authorizationJWT, this.getAll); //Trouver les explorations d'un explorateur
    router.get('/:idExplorer/explorations/:idExploration', authorizationJWT, this.getOne); //Trouver une exploration précise d'un explorateur
    router.post('/:idExplorer/explorations', authorizationJWT, this.post); //Explorer
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

      await axios.get(url)
        .then(res => {
          explorationData = res.data;
        })
        .catch(err => {
          return next(err);
        });

      let ally;
      let allyData;

      if(ally)
      {
        allyData = explorationData.ally;
        allyData.explorer = idExplorer;
      }
      
      if(allyData)
      {
        ally = await allyRepository.create(allyData);
        ally = ally.toObject({getters:false, virtuals:false});
        ally = allyRepository.transform(ally);
      }

      let explorationTransformed = await ExplorationRepository.transformIntoExploration(explorationData, ally);

      explorationTransformed.explorer = idExplorer;

      // let exploration = await ExplorationRepository.create(explorationData.ally);
      let exploration = await ExplorationRepository.create(explorationTransformed);

      exploration = exploration.toObject({getters:false, virtuals:false});
      exploration = ExplorationRepository.transform(exploration);

      //Lance un random pour déterminer si on renvoit un bonus chest ou non
      let bonusChest;
      let randomChanceChest = Math.floor(Math.random() * 10);

      //random d'array pour les élements
      //random quantité
      let elementsArray = ["test", "test1", "test2", "test3"];

      //1 à 3
      //let randomElementQuantity = Math.floor(Math.random() * 10)
      let randomElement = elementsArray[Math.floor(Math.random() * elementsArray.length)];
      let randomQuantity = Math.floor(Math.random() * 10);

      //On ne veut pas offrir un quantité de 0
      if(randomQuantity == 0)
      {
        randomQuantity++;
      }

      //2 chances sur 10
      if(randomChanceChest == 1 || randomChanceChest == 2)
      {
        bonusChest = 
        {
          //nombre d'inox random entre 1 et 10
          "inox": Math.floor(Math.random() * 10),
          "elements": 
          [
            {
              "element": randomElement,
              "quantity": randomQuantity
            }
          ]
        }
      }

      exploration.ally = ally;
      exploration.chance = randomChanceChest;
      exploration.bonusChest = bonusChest;

      res.status(201).json(exploration);

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

new ExplorationsRoutes();
export default router;