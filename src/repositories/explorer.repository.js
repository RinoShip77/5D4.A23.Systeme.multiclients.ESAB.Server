import { v4 as uuidv4 } from 'uuid';
import argon2d from 'argon2';
import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

import {Explorer} from "../models/explorer.model.js";

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

    retrieveByUsername(email){
        let retrieveQuery = Explorer.findOne({'username':{$in:email}});

        return retrieveQuery;
    }

    retrieveByEmail(email){
        let retrieveQuery = Explorer.findOne({'email':{$in:email}});

        return retrieveQuery;
    }

    // Création d'un explorer
    async create(explorer) {

        try {
            explorer.passwordHash = await argon2d.hash(explorer.password);
            delete explorer.password;
            return Explorer.create(explorer);
        } catch(err) {
            throw err;
        }
    }

    // Permet de retirer les imformations sesnsibles d'un explorer et créer son href avant de le retourner
    transform(explorer, transformOptions = {}) {

        //Peut-être plus tard
        //account.href = `${process.env.BASE_URL}/explorers/${explorer._id}`;

        explorer.href = `${process.env.BASE_URL}/explorers/${explorer._id}`;

        delete explorer._id;
        delete explorer.__v;
        delete explorer.password; //supprime le mot de passe en clair de l'objet avant de le sauvegarder
        delete explorer.passwordHash;

        return explorer;

    }

    update(idExplorer, newExplorer) {
        const filter = { _id: idExplorer};
        return Explorer.findOneAndUpdate(filter, { $set: Object.assign(newExplorer) }, { new: true, runValidators: true });
    }
}

export default new ExplorerRepository();
