import Ally from "../models/ally.model.js";

class AllyRepository {

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idAlly) {

        const retrieveQuery = Ally.findById(idAlly);

        return retrieveQuery;
    }

    retrieveAll(idExplorer)
    {
        const retrieveQuery = Ally.findAll(idExplorer);
        
        return retrieveQuery;
    }

}

export default new AllyRepository();