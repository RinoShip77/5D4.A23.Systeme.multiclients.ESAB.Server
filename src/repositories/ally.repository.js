import {Ally} from "../models/ally.model.js";

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

    transform(ally, transformOptions = {}) 
    {

        //Peut-être plus tard
        //exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;

        delete ally._id;
        delete ally.__v;

        return ally;

    }
}

export default new AllyRepository();