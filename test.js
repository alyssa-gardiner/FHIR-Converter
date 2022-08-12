const WorkerPool = require("./src/lib/workers/workerPool");
const fs = require('fs');

async function test() {
    if(process.env.npm_config_myVar === '' || process.env.npm_config_myVar === null || process.env.npm_config_myVar === undefined) {
        return "Are you dumb?";
    } else {
        const xmlFile = fs.readFileSync(process.env.npm_config_myVar, 'utf8');
        const workerPool = new WorkerPool('./src/lib/workers/worker.js', require('os').cpus().length);
        return workerPool.exec({
            'type': '/api/convert/:srcDataType/:template',
            'srcData': xmlFile.toString(),
            'srcDataType': "cda",
            'templateName': "ccd.hbs"
        }).then((result) => {
            const resultMessage = result.resultMsg;
            let newPath = process.env.npm_config_myVar.slice(0, -3);
            newPath += "json";
            fs.writeFileSync(newPath, JSON.stringify(resultMessage));
        }).then(() => {
            workerPool.destroy();
        });
    }
}

console.log(test());