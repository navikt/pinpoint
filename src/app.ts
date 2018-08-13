import express from 'express';
import prometheus from 'prom-client';
import internalController from './internal-controller';
import apiController from './api-controller';
import Log, { morgan } from './logging';

prometheus.collectDefaultMetrics();

const app = express();
const PORT = 8991;
const baseRouter = express.Router({ caseSensitive: false });

app.use(morgan);

app.use("/pinpoint", baseRouter);
baseRouter.use("/api", apiController());
baseRouter.use("/internal", internalController(prometheus.register));

app.listen(PORT, () => {
    Log.info(`App started on ${PORT}`)
});
