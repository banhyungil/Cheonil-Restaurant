/* eslint-disable  no-template-curly-in-string */
import { Client, Config } from '@rmp135/sql-ts'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const config = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'nice2122!',
        database: 'cheonil',
    },
    schemas: ['cheonil'],
    typeOverrides: {
        'cheonildb.config.config': 'object',
    },
    // columnOptionality: {
    //   'cheonildb.menu.name': 'required',
    // },
    typeMap: {
        number: ['bigint'],
    },
    // ****test
    // tables: ['cheonildb.test'],
    // ****test
    // 현재는 모두 optional 처리하자.
    // 후에 선별적으로 optional 처리하자
    // * columnOptionality 기능 사용
    // globalOptionality: 'optional',
    // source | alphabetical
    columnSortOrder: 'source',
    // output filename: models.d.ts
    filename: 'models.d',
    // table 명으로 파일 생성
    // tableNameCasing: 'pascal',
    // interfaceNameFormat: '${table}',
} as Config

Client.fromConfig(config)
    .fetchDatabase()
    .toTypescript()
    .then((res) => {
        // 현재 경로
        const __dirname = dirname(fileURLToPath(import.meta.url))

        // export 제거 import 없이 참조하기 위함(전역 타입)
        const result = res.replace(/export /g, '')
        fs.writeFileSync(path.join(__dirname, 'src/@types/models.d.ts'), result, 'utf-8')
        // ****test
        // fs.writeFileSync(path.join(__dirname, 'src/@types/test.d.ts'), result, 'utf-8')
        // ****test
    })
