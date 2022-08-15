const fs = require('fs');
const dataHandlerFactory = require("./lib/dataHandler/dataHandlerFactory");
const HandlebarsConverter = require("./lib/handlebars-converter/handlebars-converter");
const path = require("path");
const constants = require("./lib/constants/constants");
const Promise = require("promise");
const { createNamespace } = require("cls-hooked");
const compileCache = require("memory-cache");
const {errorMessage, errorCodes} = require("./lib/error/error");
const session = createNamespace(constants.CLS_NAMESPACE);

const getName = () => {
    console.log("OK OK OK OK OK");
    return new Promise((fulfill, reject) => {
        session.run(() => {
            let srcData = fs.readFileSync(process.env.npm_config_myVar, 'utf8');
            let templateName = "ccd.hbs";
            let srcDataType = "cda";
            let dataTypeHandler = dataHandlerFactory.createDataHandler(srcDataType);
            let handlebarInstance = HandlebarsConverter.instance(true,
                dataTypeHandler,
                path.join(constants.TEMPLATE_FILES_LOCATION, dataTypeHandler.dataType),
                undefined);
            session.set(constants.CLS_KEY_HANDLEBAR_INSTANCE, handlebarInstance);
            session.set(constants.CLS_KEY_TEMPLATE_LOCATION, path.join(constants.TEMPLATE_FILES_LOCATION, dataTypeHandler.dataType));

            const getTemplate = (templateName) => {
                return new Promise((fulfill, reject) => {
                    var template = compileCache.get(templateName);
                    if (!template) {
                        fs.readFile(path.join(constants.TEMPLATE_FILES_LOCATION, srcDataType, templateName), (err, templateContent) => {
                            if (err) {
                                reject({ 'status': 404, 'resultMsg': errorMessage(errorCodes.NotFound, "Template not found") });
                            }
                            else {
                                try {
                                    template = handlebarInstance.compile(dataTypeHandler.preProcessTemplate(templateContent.toString()));
                                    compileCache.put(templateName, template);
                                    fulfill(template);
                                }
                                catch (convertErr) {
                                    reject();
                                }
                            }
                        });
                    }
                    else {
                        fulfill(template);
                    }
                });
            };

            dataTypeHandler.parseSrcData(srcData)
                .then((parsedData) => {
                    var dataContext = { msg: parsedData };
                    getTemplate(templateName)
                        .then((compiledTemplate) => {
                            try {
                                let test = generateResult(dataTypeHandler, dataContext, compiledTemplate);
                                let newPath = process.env.npm_config_myVar.slice(0, -3);
                                newPath += "json";
                                fs.writeFileSync(newPath, JSON.stringify(test));
                                fulfill(generateResult(dataTypeHandler, dataContext, compiledTemplate));
                            }
                            catch (convertErr) {
                                reject();
                            }
                        }, (err) => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });

        });
    });
};


function generateResult(dataTypeHandler, dataContext, template) {
    var result = dataTypeHandler.postProcessResult(template(dataContext));
    return Object.assign(dataTypeHandler.getConversionResultMetadata(dataContext.msg), { 'fhirResource': result });
}

exports.getName = getName;
