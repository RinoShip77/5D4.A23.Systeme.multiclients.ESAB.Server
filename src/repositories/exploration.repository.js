import {Exploration} from "../models/exploration.model.js";

class ExplorationRepository {

    // Permet de récupérer les explorations à partir d'un idExplorer
    retrieveAll(idExplorer)
    {
        const retrieveQuery = Exploration.find({'explorer':{$in:idExplorer}});
        
        return retrieveQuery;
    }

    // Permet de récupérer une exploration à partir d'un idExploration
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

    // Permet de retirer les imformations sesnsibles d'une exploration et créer ses href avant de le retourner
    transform(exploration, transformOptions = {}) {

        
        exploration.href = `${process.env.BASE_URL}/explorers/${exploration.explorer}/explorations/${exploration._id}`;

        if(exploration.ally != undefined)
        {
            exploration.capture_href = `${process.env.BASE_URL}/explorers/${exploration.explorer}/allies/${exploration.ally}`;
        }

        delete exploration._id;
        delete exploration.__v;
        delete exploration.ally;
        delete exploration.explorer;

        return exploration;

    }

    // Permet de retirer les imformations sesnsibles pour être en mesure de la créer
    transformIntoExploration(explorationData, ally, transformOptions = {}) {


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