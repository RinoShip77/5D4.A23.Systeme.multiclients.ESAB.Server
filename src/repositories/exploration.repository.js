import Exploration from "../models/exploration.model.js";

class ExplorationRepository {

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExploration) {

        const retrieveQuery = Exploration.findById(idExploration);

        return retrieveQuery;
    }

}

export default new ExplorationRepository();