import Explorer from "../models/explorer.model.js";

class ExplorerRepository {

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExplorer) {

        const retrieveQuery = Explorer.findById(idExplorer);

        return retrieveQuery;
    }

    create(explorer) {
        return Explorer.create(explorer);
    }
}

export default new ExplorerRepository();
