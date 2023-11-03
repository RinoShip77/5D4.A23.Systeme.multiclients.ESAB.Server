import express from 'express';
import paginate from 'express-paginate';
import HttpError from 'http-errors';
import { mongoose } from 'mongoose';

import explorerValidators from '../validators/explorer.validator.js'
import explorerRepository from "../repositories/explorer.repository.js"
import validator from '../middlewares/validator.js';

const router = express.Router();

class ExplorersRoutes {
    constructor() {
        router.get('/', paginate.middleware(20, 40), this.getAll);
        // router.put('/:idExplorer', explorerValidators.partial(), validator, this.put);
        router.get('/:idExplorer', this.getOne);
        // router.post('/', explorerValidators.complete(), validator, this.post); // Ajout d'un explorer
      }
}

new ExplorersRoutes();
export default router;