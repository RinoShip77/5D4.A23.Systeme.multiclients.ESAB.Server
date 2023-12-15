import express from 'express'
import cors from 'cors'
import expressRateLimit from 'express-rate-limit';
import schedule from 'node-schedule';
import elements from './utils/elements.js'

//import core
import database from './core/database.js';
import errors from './core/errors.js';

//import routes
import AlliesRoutes from './routes/allies.routes.js';
import ExplorationsRoutes from './routes/explorations.routes.js';
import ExplorersRoutes from './routes/explorers.routes.js';

//import Repo pour ajouter les inox et les éléments aux explorateurs
import ExplorerRepository from './repositories/explorer.repository.js';

const app = express();

database();

app.use(express.json());
app.use(cors());


//Ajout de 2 inox, 
//à chaque explorateur
//à chaque 5 minutes
schedule.scheduleJob('*/5 * * * *', async function()
{
    let explorers = await ExplorerRepository.retrieveAll();

    for(let i = 0; i < explorers.length; i++)
    {
        explorers[i].inventory.inox = explorers[i].inventory.inox + 2;
        await ExplorerRepository.update(explorers[i]._id, explorers[i]);
        console.log("2 inox ajoutés à : " + explorers[i].username);
    }
});

//Ajout de 1 à 3 éléments de chaque élément existant, 
//à chaque explorateur
//à chaque heure
schedule.scheduleJob('0 * * * *', async function()
{
    let explorers = await ExplorerRepository.retrieveAll();

    for(let i = 0; i < explorers.length; i++)
    {
        for(let j = 0; j < elements.length; j++)
        {
            //chances de 1 à 3 (minimum de 1 et maximum de 3 quantité)
            //Génere une quantité aléatoire à donner pour l'élément
            let randomQuantity = Math.floor(Math.random() * 3) + 1;

            //Élément à ajouté
            let elementToAdd = {"element" : elements[j].symbol, "quantity" : randomQuantity}

            //Constante booléenne pour faire une vérification
            let exists = false;

            //Vérifie dans les éléments de l'explorateur
            explorers[i].inventory.elements.forEach(elementExplorer => 
            {
              //Si les 2 éléments concordent
              if(elements[j].symbol === elementExplorer.element) 
              {
                //ajoute une quantité à l'élément à la place d'en créer un nouveau
                elementExplorer.quantity += randomQuantity;

                exists = true;
              }
            });

            //S'il existe pas, ajoute un nouvel éléement à l'inventaire de l'explorateur
            if(!exists)
            {
                explorers[i].inventory.elements.push(elementToAdd);
            }
        }

        await ExplorerRepository.update(explorers[i]._id, explorers[i]);
        console.log("Éléments ajoutés à : " + explorers[i].username);
    }
});

//Pour mettre un middleware sur toutes les routes
const limiter = expressRateLimit(
    {
    windowsMs: 10 * 60 * 1000,
    max: 500,
    message:'Too many requests'
    }
);
app.use(limiter);

app.use('/explorers', AlliesRoutes);
app.use('/explorers', ExplorationsRoutes);
app.use('/explorers', ExplorersRoutes);


app.use(errors);

export default app;