import { Client } from 'pg'
import Cursor from 'pg-cursor'
import * as config from '../../config'

class PostgresHelper {

  constructor() {
    this.dbClient = new Client(config.db)
    this.dbClient.connect()
    this.cursors = {}
  }

  execute(query, params) {

    return new Promise((resolve, reject) => {
      let select = query
      let options = params ? params : {}

      const {where:where, paramList:paramList} = this.buildWhere(params)

      select += where

      let cursor = this.getCursor(select, paramList)
      cursor.read(config.max_query_result, (error, rows) => {
        if (error) {
          reject(error)
        }
        if (rows.length < config.max_query_result) {
          this.removeCursor(cursor)
        }
        console.log(this.cursors);
        resolve(rows)
      })
    })
  }

  buildWhere(params) {

    let where = '', paramList = [], count = 1, maxLimit = 0

    if ('max_limit' in params && params.max_limit <= config.max_query_result) {
      maxLimit = params.max_limit
      delete params.max_limit
    } else {
      maxLimit = config.max_query_result
    }

    if ( Object.keys(params).length > 0) {
      let wherePart = ' WHERE '
      wherePart += Object.keys(params).reduce((whereString, key) => {
        if (key !== 'max_limit') {
          whereString += `${key} = $${count} and `
          paramList.push(params[key])
          count += 1
        }
        return whereString
      }, '')

      where += wherePart.substring(0, wherePart.length - 5)
    }

    let limit = ' LIMIT $' + count
    paramList.push(maxLimit)
    where += limit
    return {where, paramList}
  }


  getCursor(query, params) {
    let key = this.getQueryStatement(query, params)

    if (!(key in this.cursors)) {
      let cursor = new Cursor(query, params)
      this.cursors[key] = this.dbClient.query(cursor)
    }

    return this.cursors[key]
  }

  removeCursor(cursor) {
    let queryStatement = this.getQueryStatement(cursor.text, cursor.values)
    if (queryStatement in this.cursors) {
      cursor.close(() => {})
      delete this.cursors[queryStatement]
    }
  }

  getQueryStatement(query, params) {
    let key = query
    params.forEach((param, index) => {
      key = key.replace(`$${index+1}`, param)
    })
    return key
  }

}

export default PostgresHelper
