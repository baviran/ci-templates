const util = require('util');
const fs = require('fs');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const TEMPLATES_PATH = __dirname + "/templates"

const getTemplateObject = async ({ templateName, pathToFile }) => {
    const fileContent = await readFile(pathToFile, { encoding: 'utf8' });
    return {
        [templateName]: fileContent
    }
}

const getPackageTypeTemplates = async ({ packageType, pathToProvider }) => {
    const packageTypeTemplates = []
    const pathToDir = `${pathToProvider}/${packageType}`;
    const templates = await readdir(pathToDir)

    for (const templateName of templates) {
        const pathToFile = `${pathToDir}/${templateName}`;
        packageTypeTemplates.push(await getTemplateObject({ templateName, pathToFile }))
    }
    return packageTypeTemplates
}

const getProvider = async (ciProvider) => {
    const pathToProvider = `${TEMPLATES_PATH}/${ciProvider}`
    const packageTypes = await readdir(pathToProvider)
    let ciProviderObj = {};
    for (const packageType of packageTypes) ciProviderObj[packageType] = await getPackageTypeTemplates({
        packageType,
        pathToProvider
    });
    return ciProviderObj;
}


async function copyFilesAsync() {
    const ciProviders = await readdir(TEMPLATES_PATH);
    let templateObj = {};
    for (const ciProvider of ciProviders) templateObj[ciProvider] = await getProvider(ciProvider)
    return templateObj;
}


exports.copyFilesAsync = copyFilesAsync;

