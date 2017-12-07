import {Pool} from 'pg'
// import Cursor from 'pg-cursor'
import * as config from '../../config'

/**
 * PostgresHelper
 */
class PostgresHelper {
  /**
   * Constructor
   */
  constructor() {
    this.dbPool = new Pool(config.db)
    this.dbPool.connect()
    // this.cursors = {}
  }

  /**
   * Returns user's information fetched using the access token provide by the user.
   * @param  {string} query user's access token
   * @param  {string} params user's access token
   * @return {Promise} Fullfilled when user information is fetched
   */
  execute(query, params) {
    console.log('Execute', query, params, '!!!!')
    return new Promise((resolve, reject) => {
      let select = query
      const result = {hasNext: true}

      const {where: where, paramList: paramList} = this.buildWhere(params)

      select += where

      // let cursor = this.getCursor(select, paramList)
      // cursor.read(config.max_query_result, (error, rows) => {
      //   if (error) {
      //     reject(error)
      //   }
        // if (rows.length < config.max_query_result) {
        //   this.removeCursor(cursor)
        //   result.hasNext = false
        // }
        // result.rows = rows
        // result.count = rows.length
        // resolve(result)
      // })
      this.dbPool.query(select, paramList)
      .then(queryResult => {
        if (queryResult.rowCount < config.max_query_result) {
          result.hasNext = false
        }
        result.rows = queryResult.rows
        result.count = queryResult.rowCount
        resolve(result)
      })
      .catch(error => {
        reject(error)
      })
    })
  }

  /**
   * buildWhere.
   * @param  {Object} params user's access token
  * @return{string} where clause
   */
  buildWhere(params) {
    let group_by = null;
    if (params.group_by) {
      group_by = params.group_by;
      delete params.group_by
    }
    let where = '',
    paramList = [],
    count = 1,
    maxLimit = 0,
    offset = 0,
    page_number = 0
    page_number

    if ('offset' in params) {
      offset = params.offset
      delete params.offset
    }

    if ('page_number' in params && params.page_number > 0) {
      offset += (params.page_number - 1) * config.max_query_result
      delete params.page_number
    }

    if ('max_limit' in params && params.max_limit <= config.max_query_result) {
      maxLimit = params.max_limit
      delete params.max_limit
    } else {
      maxLimit = config.max_query_result
    }

    if ( Object.keys(params).length > 0) {
      let wherePart = ' WHERE lat is not null and lon is not ' +
      'null and coords_within_country is true and '
      wherePart += Object.keys(params).reduce((whereString, key) => {
        whereString += `${key} = $${count} and `
        paramList.push(params[key])
        count += 1
        return whereString
      }, '')

      where += wherePart.substring(0, wherePart.length - 5)
    }
    if (group_by) {
      where += ' group by ' + group_by;
    }
    let offsetStr = ' OFFSET $' + count
    paramList.push(offset)
    count += 1

    where += offsetStr

    if (maxLimit > 0) {
      let limit = ' LIMIT $' + count
      paramList.push(maxLimit)
      where += limit
    }

    return {where, paramList}
  }
  //
  // getCursor(query, params) {
  //   let key = this.getQueryStatement(query, params)
  //   if (!(key in this.cursors)) {
  //     let cursor = new Cursor(query, params)
  //     this.cursors[key] = this.dbClient.query(cursor)
  //   }
  //
  //   return this.cursors[key]
  // }
  //
  // removeCursor(cursor) {
  //   let queryStatement = this.getQueryStatement(cursor.text, cursor.values)
  //   if (queryStatement in this.cursors) {
  //     cursor.close(() => {})
  //     delete this.cursors[queryStatement]
  //   }
  // }
  //
  // getQueryStatement(query, params) {
  //   let key = query
  //   params.forEach((param, index) => {
  //     key = key.replace(`$${index+1}`, param)
  //   })
  //   return key
  // }
}

export default PostgresHelper
