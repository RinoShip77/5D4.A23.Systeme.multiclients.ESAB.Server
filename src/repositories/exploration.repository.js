import {Exploration} from "../models/exploration.model.js";

class ExplorationRepository {

    retrieveAll(idExplorer)
    {
        const retrieveQuery = Exploration.find({'explorer':{$in:idExplorer}});
        
        return retrieveQuery;
    }

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExploration, idExplorer) {

        //const retrieveQuery = Exploration.find({$and: [ {'explorer': {$in:idExplorer}}, {'_id':{$in:idExploration}}]});
        const retrieveQuery = Exploration.findById(idExploration);

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
        exploration.href = `${process.env.BASE_URL}/explorers/${exploration.explorer}/explorations/${exploration._id}`;
        exploration.capture_href = `${process.env.BASE_URL}/explorers/${exploration.explorer}/allies/${exploration.ally}`;

        delete exploration._id;
        delete exploration.__v;
        delete exploration.ally;
        delete exploration.explorer;

        return exploration;

    }

    // Permet de retirer les imformations sesnsibles d'une exploration et créer son href avant de le retourner
    // TODO: Vérifier si on a besoin
    transformIntoExploration(explorationData, ally, transformOptions = {}) {

        //Peut-être plus tard
        //exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;

        delete explorationData.ally;

        if(ally)
        {
            explorationData.ally = ally._id;
        }

        delete explorationData.__v;

        return explorationData;

    }
}

export default new ExplorationRepository();