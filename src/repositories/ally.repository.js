import {Ally} from "../models/ally.model.js";

class AllyRepository {

    // Création d'une exploration
    create(ally) 
    {
        return Ally.create(ally);
    }

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idAlly) {

        const retrieveQuery = Ally.findById(idAlly);

        return retrieveQuery;
    }

    retrieveAll(idExplorer)
    {
        const retrieveQuery = Ally.find({'explorer':{$in:idExplorer}});
        
        return retrieveQuery;
    }

    transform(ally, transformOptions = {}) 
    {

        //Peut-être plus tard
        //exploration.href = `${process.env.BASE_URL}/explorations/${exploration._id}`;
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