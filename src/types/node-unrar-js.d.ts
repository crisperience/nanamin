declare module 'node-unrar-js' {
    export interface FileHeader {
        name: string
        flags: {
            directory: boolean
            encrypted: boolean
            solid: boolean
        }
        method: string
        packSize: number
        unpSize: number
        time: string
        unpVer: string
        crc: number
        comment: string
    }

    export interface ArcHeader {
        comment: string
        flags: {
            authInfo: boolean
            headerEncrypted: boolean
            lock: boolean
            recoveryRecord: boolean
            solid: boolean
            volume: boolean
        }
    }

    export interface ArcList {
        arcHeader: ArcHeader
        fileHeaders: Generator<FileHeader>
    }

    export interface ArcFile {
        fileHeader: FileHeader
        extraction?: Uint8Array
    }

    export interface ArcFiles {
        arcHeader: ArcHeader
        files: Generator<ArcFile>
    }

    export interface Extractor {
        getFileList(): ArcList
        extract(options?: { files?: string[] | ((fileHeader: FileHeader) => boolean); password?: string }): ArcFiles
    }

    export function createExtractorFromData(options: {
        data: ArrayBuffer
        password?: string
        wasmBinary?: ArrayBuffer
    }): Promise<Extractor>
}
