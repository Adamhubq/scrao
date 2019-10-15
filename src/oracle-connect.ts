
import * as oracledb from "oracledb";

export interface CreateImg {
    ARTICLE: string;
    PATH: string;
    FILENAME: string;
    initialObjectconstructor();
    getCollection(collection);
    setCollection();
    loopScraping(loopScraping);
    objectConnection: oracledb.Connection;
    dbObjectClassProtoGet: oracledb.DBObject;
    dbObjectClassProtoSet: oracledb.DBObject;
    collection: object;
    closeConnectDatabase();
}



export class DataBaseOracleAccess implements CreateImg {
    ARTICLE: string;
    PATH: string;
    FILENAME: string;

    objectConnection: oracledb.Connection;
    dbObjectClassProtoGet: oracledb.DBObject;
    dbObjectClassProtoSet: oracledb.DBObject;
    collection: any;

    async initialObjectconstructor() { // initialization in promis or await (create new function with async)       
        await oracledb.createPool({
            poolAlias: '54a975e6a85b0515f938e46d9b04bf94d9',
            user: "",
            password: "",
            connectString: ""
            // Default values shown below            
            // externalAuth: fal_protose, // whether connections should be established using External Authentication            
            // poolIncrement: 1, // only grow the pool by one connection at a time
            // poolMax: 5, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
            // poolMin: 2, // start with no connections; let the pool shrink completely                                       
            // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds                                            
            // stmtCacheSize: 200 // number of statements that are cached in the statement cache of each connection
            // }, (_error: oracledb.DBError, _pool: oracledb.Pool) => {
            //     console.log('Ошибка')
        }).then(async () => {
            await oracledb.getConnection('54a975e6a85b0515f938e46d9b04bf94d9')
                .then(async conn => {
                    this.objectConnection = conn;
                    await conn.getDbObjectClass("") // table
                        .then(dbObjects => {
                            this.dbObjectClassProtoGet = new dbObjects({});
                            this.dbObjectClassProtoSet = new dbObjects({});
                            console.log(dbObjects.prototype)
                        })
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }

    async getCollection(collection: []) {

        collection.map(value => this.dbObjectClassProtoGet.append(value))
        await this.objectConnection
            .execute('BEGIN :cursor := database.package.getterImage(:p_param); END;',   // *sql param
                {                                                                             // *bindvar param
                    cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT, maxSize: 5000 },
                    p_param: { dir: oracledb.BIND_IN, type: 2023, val: this.dbObjectClassProtoGet }
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT })
            .then(async (resp: any) => {
                await resp.outBinds.cursor.getRows(400).then((async response => {
                    response.map(value => this.dbObjectClassProtoSet.append(value));
                    console.log('asdasd')
                }))
                    .catch(err => console.log(err))
                    .finally(async () => {
                        console.log('asdasd')
                        await resp.outBinds.cursor.close()
                        console.log('asdasd')
                    });

            })
            .catch(err => console.log(err))
        console.log('asdasd')

    }

    async setCollection() {
        await this.objectConnection
            .execute('BEGIN :cursor := database.package.setterImage(:p_param); END;',   // *sql param
                {                                                                             // *bindvar param
                    cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT, maxSize: 5000 },
                    p_param: { dir: oracledb.BIND_IN, type: 2023, val: this.dbObjectClassProtoSet }
                }).then(async (resp: any) => {
                    await resp.outBinds['cursor'].getRows(400)
                        .then((response) => {
                            console.log('response')
                            console.log(response)
                            console.log('response')
                        })
                        .catch(err => console.log(err))
                        .finally(async () => {
                            await resp.outBinds.cursor.close()
                        });
                })
                .catch(err => console.log(err))
    }

    async loopScraping(collectionGroup) {
        if (!Object.keys(collectionGroup).length)
            return console.log("null collection group");

        await this.getCollection(collectionGroup)
            .then(async () => await this.setCollection())
            .catch((err) => console.log(err))
    }

    async closeConnectDatabase() {
        await this.objectConnection.close();
    }
}
