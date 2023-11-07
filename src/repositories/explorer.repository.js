import Explorer from "../models/explorer.model.js";

class ExplorerRepository {

    // Connexion d'un explorer
    async login(email, username, password) {

        const explorer = await Explorer.findOne({$or: [{email: email}, {username: username}]});
        if(!explorer) {
            return { err: HttpError.Unauthorized() }
        }
        //Nous avons un compte avec le email ou username
        //Vérification du bon mot de passe
        if(await this.validatePassword(password, explorer)) {
            return { explorer };
        } else {
            // Mauvais mot de passe
            return { err: HttpError.Unauthorized() }
        }

    }

    // Générer un jwt pour un explorer
    generateJWT(email) {
        const accessToken = jwt.sign(
            {email}, 
            process.env.JWT_PRIVATE_SECRET, 
            {expiresIn: process.env.JWT_LIFE, issuer:process.env.BASE_URL});

        const refreshToken = jwt.sign(
            {email}, 
            process.env.JWT_REFRESH_SECRET, 
            {expiresIn: process.env.JWT_REFRESH_LIFE, issuer:process.env.BASE_URL});

        return { accessToken, refreshToken };
    }

    // Vérification du mdp
    async validatePassword(password, explorer) {
        try {
            return await argon2d.verify(explorer.passwordHash, password);
        } catch(err) {
            throw err;
        }
    }

    // Permet de récupérer un ally à partir d'un id
    retrieveById(idExplorer) {

        const retrieveQuery = Explorer.findById(idExplorer);

        return retrieveQuery;
    }

    //TEAMATE B
    retrieveByUsername(email){
        let retrieveQuery = Explorer.find({'username':{$in:email}});

        return retrieveQuery;
    }

    //TEAMATE B
    retrieveByEmail(email){
        let retrieveQuery = Explorer.find({'email':{$in:email}});

        return retrieveQuery;
    }

    // Création d'un explorer
    create(explorer) {
        return Explorer.create(explorer);
    }

    // Permet de retirer les imformations sesnsibles d'un explorer et créer son href avant de le retourner
    transform(explorer, transformOptions = {}) {

        //account.href = `${process.env.BASE_URL}/explorers/${explorer._id}`;

        delete explorer._id;
        delete explorer.__v;
        delete explorer.password; //supprime le mot de passe en clair de l'objet avant de le sauvegarder
        delete explorer.passwordHash;

        return explorer;

    }
}

export default new ExplorerRepository();
