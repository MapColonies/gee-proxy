class DatabaseData {
    constructor(exists, name, dataBaseType = '2D') {
        this.exists = exists;
        this.name = name;
        this.dataBaseType = dataBaseType;
    }
}

class ImageryProjectData {
    constructor(exists, name) {
        this.exists = exists;
        this.name = name;
    }
}

const MaskType = 'default' | 'noMask' | 'maskFile';

class DefaultMaskTypeParameters {
    constructor(band, feather, holeSize) {
        this.band = band;
        this.feather = feather;
        this.holeSize = holeSize;
    }
}

class ResourceData {
    constructor(physicalPath, resourcePath, isFlat, mask, defaultMaskTypeParameters) {
        this.physicalPath = physicalPath;
        this.resourcePath = resourcePath;
        this.isFlat = isFlat;
        this.mask = mask;
        this.defaultMaskTypeParameters = defaultMaskTypeParameters;
    }
}

class ImageryResourceData {
    constructor(databaseData, imageryProjectData, resourceData) {
        this.database = databaseData;
        this.imageryProject = imageryProjectData;
        this.resourceData = resourceData;
    }
}

class PublishDBToServerData {
    constructor(needToAddDB, dbFullPath, dbalias, stream_server_url, targetpath) {
        this.needToAddDB = needToAddDB;
        this.dbFullPath = dbFullPath;
        this.dbalias = dbalias;
        this.stream_server_url = stream_server_url;
        this.targetpath = targetpath;
    }
}

class UnifiedResponse {
    constructor(statusCode, description, error) {
        this.statusCode = statusCode;
        this.description = description;
        this.error = error;
    }
}

module.exports = {
    DatabaseData,
    ImageryProjectData,
    ResourceData,
    ImageryResourceData,
    DefaultMaskTypeParameters,
    PublishDBToServerData,
    UnifiedResponse
};

//
// export interface IDatabaseData {
//     exists: boolean;
//     name: string;
// }
//
// export interface IImageryProjectData {
//     exists: boolean;
//     name: string;
// }
//
// export enum MaskType {
// default,
//     noMask,
//         maskFile
// }
//
// export interface IResourceData {
//     physicalPath: string,
//         resourcePath: string,
//         isFlat: boolean,
//         mask: MaskType
// }
//
// export interface IAddImageryResource {
//     database: IDatabaseData;
//     imageryProject: IImageryProjectData;
//     resourceData: IResourceData;
// }
