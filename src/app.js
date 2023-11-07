import express from 'express'
import expressRateLimit from 'express-rate-limit';

//import core
import database from './core/database.js';
import errors from './core/errors.js';

//import routes
import AlliesRoutes from './routes/allies.routes.js';
import ExplorationsRoutes from './routes/explorations.routes.js';
import ExplorersRoutes from './routes/explorers.routes.js';

const app = express();

database();

app.use(express.json());

//app.use(route);

//Pour mettre un middleware sur toutes les routes
const limiter = expressRateLimit(
    {
    windowsMs: 10 * 60 * 1000,
    max: 10,
    message:'Too many requests'
    }
);
app.use(limiter);

app.use('/allies', AlliesRoutes);
app.use('/explorations', ExplorationsRoutes);
app.use('/explorers', ExplorersRoutes);

app.use(errors);

export default app;