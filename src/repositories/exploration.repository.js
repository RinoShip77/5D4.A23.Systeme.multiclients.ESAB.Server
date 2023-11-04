import Exploration from "../models/exploration.model.js";

class ExplorationRepository {

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExploration) {

        const retrieveQuery = Exploration.findById(idExploration);

        return retrieveQuery;
    }

    // Création d'une exploration
    create(exploration) {
       // return Exploration.create(exploration);
    }

    // Permet de retirer les imformations sesnsibles d'une exploration et créer son href avant de le retourner
    // TODO: Vérifier si on a besoin
    transform(exploration, transformOptions = {}) {

        exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;

        delete exploration._id;
        delete exploration.__v;

        return exploration;

    }
}

export default new ExplorationRepository();