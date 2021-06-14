const util = require('util');
const fs = require('fs');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const TEMPLATES_PATH = __dirname + "/templates"

const getTemplateObject = async ({ templateName, pathToTemplateFolder }) => {
    if(fs.lstatSync(pathToTemplateFolder).isDirectory()) {
        if(!fs.existsSync(`${pathToTemplateFolder}/template.json`)) {
            return null;
        }
        const templateDetails = await readFile(`${pathToTemplateFolder}/template.json`, { encoding: 'utf8' });
        const template = JSON.parse(templateDetails);
        if(!fs.existsSync(`${pathToTemplateFolder}/${template.filename}`)) {
            return null;
        }
        const fileContent = await readFile(`${pathToTemplateFolder}/${template.filename}`, { encoding: 'utf8' });
        return {
            name: template.templateName,
            description: template.description,
            template: fileContent
        }
    }
}

const getPackageTypeTemplates = async ({ packageType, pathToProvider }) => {
    const packageTypeTemplates = []
    const pathToDir = `${pathToProvider}/${packageType}`;
    const templates = await readdir(pathToDir)

    for (const templateName of templates) {
        const pathToTemplateFolder = `${pathToDir}/${templateName}`;
        packageTypeTemplates.push(await getTemplateObject({ templateName, pathToTemplateFolder }))
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
    console.log(JSON.stringify(templateObj));
    return templateObj;
}


exports.copyFilesAsync = copyFilesAsync;

