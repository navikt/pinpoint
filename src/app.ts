import express from 'express';

import internalController from './internal-controller';
import apiController from './api-controller';
import morgan from 'morgan';
import prometheus from 'prom-client';
prometheus.collectDefaultMetrics();

const app = express();
const PORT = 8991;
const baseRouter = express.Router({ caseSensitive: false });

app.use(morgan('dev'));

app.use("/pinpoint", baseRouter);
baseRouter.use("/api", apiController());
baseRouter.use("/internal", internalController(prometheus.register));

app.listen(PORT, () => {
    console.log(`App started on ${PORT}`)
});
