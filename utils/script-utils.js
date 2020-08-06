'use strict';

class ScriptUtils {
    static updateImageryResource(resourceData) {
        let command = ScriptUtils.getImageryResourceScript('', 'gemodifyimageryresource', resourceData);
        command = command.concat(`gebuild ${resourceData.resourcePath}\n` + '\n');
        return command;
    }

    static getImageryResourceScript(command, prefix, resourceData) {
        // add / update new imagery resource
        const physicalPath = resourceData.physicalPath;
        const resourceName = resourceData.resourcePath;
        const projection = !resourceData.isFlat ? '--mercator' : '--flat'; // flat is default

        let mask = null;
        if (resourceData.mask === 'nomask') {
            mask = '--nomask';
        } else if (resourceData.mask === 'maskFile') {
            mask = '--havemask';
        }

        if (mask) {
            command = command.concat(`${prefix} -o ${resourceName} ${projection} ${mask} ${physicalPath}\n` + '\n');
        } else { // default mask
            const bandString = resourceData.defaultMaskTypeParameters.band ? `--band ${resourceData.defaultMaskTypeParameters.band} ` : '';
            const featherString = resourceData.defaultMaskTypeParameters.feather ? `--feather ${resourceData.defaultMaskTypeParameters.feather} ` : '';
            const holeSizeString = resourceData.defaultMaskTypeParameters.holeSize ? `--holesize ${resourceData.defaultMaskTypeParameters.holeSize} ` : '';
            command = command.concat(`${prefix} -o ${resourceName} ${projection} ${bandString} ${featherString} ${holeSizeString} ${physicalPath}\n` + '\n');
        }
        return command;
    }

    static addImageryResource(addImageryResource) {
        let command = '';
        const dataBaseName = addImageryResource.database.name;
        const imageryProjectName = addImageryResource.imageryProject.name;
        const projection = !addImageryResource.resourceData.isFlat ? '--mercator' : '--flat'; // flat is default

        // add imagery project
        if (!addImageryResource.imageryProject.exists) {
            if (addImageryResource)
                command = `genewimageryproject -o ${imageryProjectName} ${projection}\n` + '\n';
        }
        // add database project
        if (!addImageryResource.database.exists) {
            if (addImageryResource.database.dataBaseType === '2D') {
                command = command.concat(`genewmapdatabase -o ${dataBaseName} --imagery ${imageryProjectName}\n` + '\n');
            } else if (addImageryResource.database.dataBaseType === '3D') {
                command = command.concat(`genewdatabase -o ${dataBaseName} --imagery ${imageryProjectName}\n` + '\n');
            } else {
                throw new Error("dataBaseType is not specified ('2D' or '3D' excpected)");
            }
        }

        command = ScriptUtils.getImageryResourceScript(command, 'genewimageryresource', addImageryResource.resourceData);

        // add to imagery resource
        command = command.concat(`geaddtoimageryproject -o ${imageryProjectName} ${addImageryResource.resourceData}\n` + '\n');
        command = command.concat(`gebuild ${dataBaseName}\n` + '\n');
        return command;
    }

    static cleanResource(assetName, version) {
        if (!assetName) {
            throw new Error('assetName must be defined');
        }
        const versionString = version ? version : '';
        const command = `geclean ${assetName} ${versionString}`;
        return command;
    }

    static publishDB(publishDBToServerData) {
        let command = '';
        let stream_server_urlString = '';
        if (publishDBToServerData.stream_server_url) {
            stream_server_urlString = `--stream_server_url ${publishDBToServerData.stream_server_url}`;
        }

        // add new DB
        if (publishDBToServerData.needToAddDB) {
            let dbaliasString = '';
            if (publishDBToServerData.dbalias) {
                dbaliasString = `--dbalias ${publishDBToServerData.dbalias}`;
            }

            command = `geserveradmin --adddb ${publishDBToServerData.dbFullPath} ${dbaliasString} ${stream_server_urlString}\n` + '\n';
        }

        // push db
        command = command.concat(`geserveradmin --pushdb ${publishDBToServerData.dbFullPath} ${stream_server_urlString}\n` + '\n');

        const targetpathString = `--targetpath ${publishDBToServerData.targetpath}`;

        // publish db
        command = command.concat(`geserveradmin --publishdb ${publishDBToServerData.dbFullPath} ${targetpathString}\n` + '\n');
        return command;
    }

    static getFileNameWithoutPath(fullFilePath) {
        let fileNameWithoutPath = this.getLastStringPartBySplitter(fullFilePath,'/');
        return fileNameWithoutPath;
    }

    static getFileNameWithoutSuffix(fileName) {
        let fileNameWithoutPath = this.getLastStringPartBySplitter(fileName,'.');
        fileNameWithoutPath = fileName.substr(0, fileName.length - fileNameWithoutPath.length - 1);
        return fileNameWithoutPath;
    }

    static getLastStringPartBySplitter(string, splitter) {
        const array = string.split(splitter);
        let lastString;
        if (Array.isArray(array) && array.length > 1) {
            lastString = array[array.length - 1];
        } else {
            lastString = string;
        }
        return lastString;
    }

    static splitFile(assetMinifiedData) {
        let command = '';
        // check's if need to split the file
        if (assetMinifiedData.sizeInGB > 80) {
            // check's if the file is in khvr format
            const suffix = '.khvr';
            const isKhvr = assetMinifiedData.physicalPath.substr(-suffix.length) === suffix;
            const assetResourceNameWithoutPath = this.getFileNameWithoutPath(assetMinifiedData.physicalPath);
            const assetDirectory = assetMinifiedData.physicalPath.substr(0, assetMinifiedData.physicalPath.length - assetResourceNameWithoutPath.length);
            if (!isKhvr) {
                const physicalPathWithaoutExtension = assetMinifiedData.physicalPath.slice(0, assetMinifiedData.physicalPath.indexOf('.'));
                command = command.concat(`gevirtualraster -o ${physicalPathWithaoutExtension}${suffix} ${assetMinifiedData.physicalPath}\n` + '\n');
            }
            command = command.concat(`cd ${assetDirectory}\n` + '\n');

            // check to how many part's the file needs to be splitted
            let parts = assetMinifiedData.sizeInGB / 80;
            if (parts !== Math.floor(parts)) {
                parts = Math.floor(parts) +1;
            }
            let needToCaculate = true;
            let calculatedPartsNumber = 2;
            while (needToCaculate) {
                if (parts <= Math.pow(calculatedPartsNumber, calculatedPartsNumber)) {
                    needToCaculate = false;
                } else {
                    calculatedPartsNumber +=1;
                }
            }
            const assetResourceNameWithoutPathAndSuffix = this.getFileNameWithoutSuffix(assetResourceNameWithoutPath);
            command = command.concat(`gesplitkhvr --rows ${calculatedPartsNumber} --cols ${calculatedPartsNumber} --overlap 10 ${assetResourceNameWithoutPathAndSuffix}${suffix}\n` + '\n');
        }

        return command;
    }
}

module.exports = ScriptUtils;
