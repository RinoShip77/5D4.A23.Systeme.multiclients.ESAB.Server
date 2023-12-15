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

    // Permet de récupérer tous les explorateurs
    // Pas utilisé
    retrieveAll()
    {
        return Explorer.find();
    }

    // Permet de récupérer un explorateur à partir d'un idExplorer
    retrieveById(idExplorer) {

        const retrieveQuery = Explorer.findById(idExplorer);

        return retrieveQuery;
    }

    // Permet de récupérer un explorateur à partir d'un username
    retrieveByUsername(email){
        let retrieveQuery = Explorer.findOne({'username':{$in:email}});

        return retrieveQuery;
    }

    // Permet de récupérer un explorateur à partir d'un email
    retrieveByEmail(email){
        let retrieveQuery = Explorer.findOne({'email':{$in:email}});

        return retrieveQuery;
    }

    // Va chercher les explorateurs et 
    // Permet le tri du leaderboard selon la demande
    // Tri parfaitement et retourne les 25 premiers pour l'order by inox
    // Pour les autres, une autre fonction de tri est utilisée
    async retrieveOrderedBy(idExplorer, order)
    {
        const orderChoices = ["inox", "elements", "allies", "explorations"]

        const explorerQuery = Explorer.findById(idExplorer);

        let leaderboardsQuery;
        
        if(orderChoices.includes(order))
        {
            if(order == "inox")
            {
                leaderboardsQuery = Explorer.find().limit(25).sort('-inventory.inox');
            }
            if(order == "elements")
            {
                leaderboardsQuery = Explorer.find();
            }
            if(order == "allies")
            {
                //pas fait
                leaderboardsQuery = Explorer.find();

                leaderboardsQuery.populate('allies');
                explorerQuery.populate('allies');
            }
            if(order == "explorations")
            {
                leaderboardsQuery = Explorer.find();

                leaderboardsQuery.populate('explorations');
                explorerQuery.populate('explorations');
            }
            
            return await Promise.all([leaderboardsQuery, explorerQuery]);
            
        }

    }

    // Création d'un explorateur
    async create(explorer) {

        try {
            explorer.passwordHash = await argon2d.hash(explorer.password);
            delete explorer.password;
            return Explorer.create(explorer);
        } catch(err) {
            throw err;
        }
    }
    

    // Permet de retirer les informations sesnsibles d'un explorer et créer son href avant de le retourner
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

    update(idExplorer, newExplorer) 
    {
        const filter = { _id: idExplorer};
        return Explorer.findOneAndUpdate(filter, { $set: Object.assign(newExplorer) }, { new: true, runValidators: true });
    }

    // Permet le tri du leaderboard lorsqu'il doit être trié par explorations, allies ou elements
    // retourne les 25 premiers
    sortBy(leaderboards, order)
    {
        if(order == "explorations")
        {
            //Tri par le nombre d'explorations faites
            for(let i = 0; i<leaderboards.length; i++)
            {
                for(let j = 0; j<leaderboards.length; j++)
                {
                    if(leaderboards[j].explorations.length < leaderboards[i].explorations.length)
                    {
                        [leaderboards[i], leaderboards[j]] = [leaderboards[j], leaderboards[i]];
                    }
                }
            }
        }
        else if (order == "allies")
        {
            //Tri par le nombre d'allies
            for(let i = 0; i<leaderboards.length; i++)
            {
                let iundef = false;

                //Si l'explorateur n'a pas d'allies, ca crée un bug, donc je crée une liste 
                //vide pour empêche cette erreur
                if(leaderboards[i].allies == undefined)
                {
                    leaderboards[i].allies = new Array();
                    iundef = true;
                }
                
                for(let j = 0; j<leaderboards.length; j++)
                {
                    //Si l'explorateur n'a pas d'allies, ca crée un bug, donc je crée une liste 
                    //vide pour empêche cette erreur
                    if(leaderboards[j].allies == undefined)
                    {
                        leaderboards[j].allies = new Array();
                    }

                    if(leaderboards[i].allies.length > leaderboards[j].allies.length)
                    {
                        [leaderboards[j], leaderboards[i]] = [leaderboards[i], leaderboards[j]];
                        leaderboards[j].test = "test : " + leaderboards[j].allies.length;
                    }
                }
            }
        }
        else if (order = "elements")
        {
            //Tri par le nombre d'allies
            for(let i = 0; i<leaderboards.length; i++)
            {
                let firstExplorerElementQuantity = 0

                //Compte la quantité d'éléments total de chaque élément du premier explorateur à comparer
                for(let j = 0; j < leaderboards[i].inventory.elements.length; j++)
                {
                    firstExplorerElementQuantity += leaderboards[i].inventory.elements[j].quantity;
                }

                for(let k= 0; k<leaderboards.length; k++)
                {
                    let secondExplorerElementQuantity = 0

                    //Compte la quantité d'éléments total de chaque élément du deuxième explorateur à comparer
                    for(let h = 0; h < leaderboards[k].inventory.elements.length; h++)
                    {
                        secondExplorerElementQuantity += leaderboards[k].inventory.elements[h].quantity;
                    }

                    if(firstExplorerElementQuantity > secondExplorerElementQuantity)
                    {
                        [leaderboards[i], leaderboards[k]] = [leaderboards[k], leaderboards[i]];
                    }
                }
            }
        }
    
        //retourne les 25 premiers
        return leaderboards.slice(0, 25);
    }
}

export default new ExplorerRepository();
