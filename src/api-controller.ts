import express, {Request, Response} from "express";
import bodyParser from 'body-parser';
import cors, {CorsOptions} from 'cors';
import deserialize from 'deserialize-error';
import StacktraceJS from 'stacktrace-js';
import FetchCache from './fetch-cache';
import Log from './logging';
import StackFrame = StackTrace.StackFrame;

const corsOptions: CorsOptions = {
    origin: [/\.nav.no$/, /\.adeo.no$/],
    methods: 'POST',
    optionsSuccessStatus: 200, // IE11 choke on 204
    preflightContinue: false
};

const fetchCache = new FetchCache();
// Error in typedefinition, trust me.
// Both `ajax` and `sourceCache` is needed to get control over StacktraceJS's caching
const config: any = {ajax: fetchCache.getFetch(), sourceCache: {}};

function formatStackFrame({columnNumber, lineNumber, fileName, functionName}: StackFrame) {
    return `  at ${functionName || '(anonymous)'} (${fileName}:${lineNumber}:${columnNumber})`;
}

function pinpoint(request: Request, response: Response) {
    const { message, url, line, column, error: errorStr } = request.body;
    const error: Error = deserialize(errorStr);

    StacktraceJS.fromError(error, config)
        .then((stacktrace) => ({
            ok: true,
            file: stacktrace[0].fileName,
            lineP: stacktrace[0].lineNumber,
            columnP: stacktrace[0].columnNumber,
            stacktrace: stacktrace.map(formatStackFrame).join('\n')
        }))
        .catch(() => ({
            ok: false,
            file: url,
            lineP: line,
            columnP: column,
            stacktrace: ""
        }))
        .then((res) => ({
            message,
            ok: res.ok,
            jsFileUrl: res.file,
            lineNumber: res.lineP,
            column: res.columnP,
            stacktrace: res.stacktrace,
            messageIndexed: message
        }))
        .then((report) => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(report));
            Log.debug(
                "Processed error",
                errorStr,
                error,
                report
            );
        });
}

export default function setup() {
    const router = express.Router({ caseSensitive: false });
    router.use(bodyParser.json());
    router.use(cors(corsOptions));
    router.options('*', cors(corsOptions));

    router.post("/pinpoint", pinpoint);

    return router;
}
