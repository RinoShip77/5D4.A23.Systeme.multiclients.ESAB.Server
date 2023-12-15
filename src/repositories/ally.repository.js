import {Ally} from "../models/ally.model.js";

class AllyRepository {

    // Création d'un ally
    create(ally) 
    {
        return Ally.create(ally);
    }

    // Permet de récupérer un ally à partir d'un idAlly
    retrieveById(idAlly) {

        const retrieveQuery = Ally.findById(idAlly);

        return retrieveQuery;
    }

    // Permet de récupérer les ally à partir d'un idExplorer
    retrieveAll(idExplorer)
    {
        const retrieveQuery = Ally.find({'explorer':{$in:idExplorer}});
        
        return retrieveQuery;
    }

    transform(ally, transformOptions = {}) 
    {

        ally.href = `${process.env.BASE_URL}/explorers/${ally.explorer}/allies/${ally._id}`;
        delete ally._id;
        delete ally.__v;

        return ally;

    }

    update(idAlly, newAlly) {
        const filter = { _id: idAlly};
        return Ally.findOneAndUpdate(filter, { $set: Object.assign(newAlly) }, { new: true, runValidators: true });
    }
}

export default new AllyRepository();