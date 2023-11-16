import {Exploration} from "../models/exploration.model.js";

class ExplorationRepository {

    retrieveAll(idExplorer)
    {
        const retrieveQuery = Exploration.find(idExplorer);
        retrieveQuery.populate('explorer');
        
        return retrieveQuery;
    }

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExploration) {

        const retrieveQuery = Exploration.findById(idExploration);
        retrieveQuery.populate('explorer');

        return retrieveQuery;
    }

    // Création d'une exploration
    create(exploration) 
    {
        return Exploration.create(exploration);
    }

    // Permet de retirer les imformations sesnsibles d'une exploration et créer son href avant de le retourner
    // TODO: Vérifier si on a besoin
    transform(exploration, transformOptions = {}) {

        //Peut-être plus tard
        //exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;

        //delete exploration.{"_id": {$in: elements}};
        delete exploration.__v;

        return exploration;

    }

    // Permet de retirer les imformations sesnsibles d'une exploration et créer son href avant de le retourner
    // TODO: Vérifier si on a besoin
    transformIntoExploration(explorationData, transformOptions = {}) {

        //Peut-être plus tard
        //exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;

        delete explorationData.ally;
        delete explorationData.__v;

        return explorationData;

    }
}

export default new ExplorationRepository();