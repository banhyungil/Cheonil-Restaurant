/* eslint-disable  no-template-curly-in-string */
import { Client } from '@rmp135/sql-ts'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const config = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'cheonildb',
  },
  typeOverrides: {
    'cheonildb.config.config': 'object',
  },
  // columnOptionality: {
  //   'cheonildb.menu.name': 'required',
  //   'cheonildb.menu.price': 'required',
  //   'cheonildb.menu_category.name': 'required',
  //   'cheonildb.store.name': 'required',
  //   'cheonildb.store_category.name': 'required',
  //   'cheonildb.t_order_menu.menuName': 'required',
  //   'cheonildb.t_order_menu.price': 'required',
  //   'cheonildb.t_order_menu.cnt': 'required',
  //   'cheonildb.t_order.storeName': 'required',
  //   'cheonildb.t_order.amount': 'required',
  //   'cheonildb.placeCategory.name': 'required',
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
}

Client.fromConfig(config)
  .fetchDatabase()
  .toTypescript()
  .then((res) => {
    // 현재 경로
    const __dirname = dirname(fileURLToPath(import.meta.url))

    // export 제거 -> jsdoc에서 import 없이 참조하기 위함
    const result = res.replace(/export /g, '')
    fs.writeFileSync(path.join(__dirname, 'src/@types/models.d.ts'), result, 'utf-8')
    // ****test
    // fs.writeFileSync(path.join(__dirname, 'src/@types/test.d.ts'), result, 'utf-8')
    // ****test
  })
