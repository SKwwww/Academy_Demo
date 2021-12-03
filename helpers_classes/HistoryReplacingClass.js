module.exports = class HistoryReplacingClass {    
    constructor (db) {
      this.db = db
      this.req = 0
      this.res = 0
      this.ip = 0
      this.br = 0
      this.search_array_to_add = []
      this.is_changed_search_array = false
      this.selected_professions_to_add = []
      this.is_selected_professions = false
    }
    deleteNonAuthSearchRow () {
      this.db.connection.query("DELETE FROM non_auth_search_results WHERE ip='"+this.ip+"' AND br'"+this.br+"'", function (error_from_non_auth_search_results_delete, results_non_auth_search_results_delete, fields) {
        if (error_from_non_auth_search_results_delete) {
          this.res.send('db_error')
          throw error_from_non_auth_search_results_delete
        } else {
          this.res.send('Success')
        }
      })
    }
    insertInToSearchResults (user_id,search_results_array,selected_professions) {
      this.db.connection.query("INSERT INTO search_results (user_id,search_results_array,selected_professions) VALUES ('"+user_id+"','"+search_results_array+"','"+selected_professions+"')", function (error_from_insert_into_search_results, results_from_insert_into_search_results, fields) {
        if (error_from_insert_into_search_results) {
          this.res.send('db_error')
          throw error_from_insert_into_search_results
        } else {
          this.deleteNonAuthSearchRow()
        }
      })
    }
    updateSearchResultsRow (user_id) {
      db.connection.query("UPDATE search_results SET search_results_array='"+this.is_changed_search_array+"',selected_professions='"+this.is_selected_professions+"' WHERE user_id="+user_id, function (error_search_results_update, results_from_search_results_update, fields) {
        if (error_search_results_update) {
          res.send('db_error')
          throw error_search_results_update
        } else {
          this.deleteNonAuthSearchRow()
        }
      })
    }
    changeData (dataOld,dataNew,whoCalled) {
        let finalDataOld = dataOld
        let count = 0
        for (let i = 0; i < dataNew.length; i++) {
          if (dataOld.indexOf(dataNew[i])===-1) {
            finalDataOld.push(dataNew[i])
            count += 1
          }
        }
        if (count>1) {
          if (whoCalled == 'search_array') {
            this.is_changed_search_array = true
          } else if (whoCalled == 'selected_professions') {
            this.is_selected_professions = true
          }
        }
        return finalDataOld
    }
    history_replacing (req,res) {
      this.req = req
      this.res = res
      this.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      this.br = req.useragent.browser + req.useragent.version
      this.db.connection.query("SELECT non_auth_search_results.search_results_array AS search_results,non_auth_search_results.selected_professions AS selected_professions,clients.id AS user_id FROM clients JOIN user_sessions ON clients.login=user_sessions.login JOIN non_auth_search_results ON user_sessions.ars=non_auth_search_results.ip AND user_sessions.browser=non_auth_search_results.br WHERE non_auth_search_results.ip='"+this.ip+"' AND non_auth_search_results.br='"+this.br+"'", function (error_from_non_auth_search_results, results_from_non_auth_search_results, fields) {
        if (error_from_non_auth_search_results) {
          res.send('db_error')
          throw error_from_non_auth_search_results
        }  else if (results_from_non_auth_search_results.length>0) {
          this.db.connection.query("SELECT search_results_array,selected_professions FROM search_results WHERE user_id="+results_from_non_auth_search_results[0].user_id, function (error_from_search_results, results_from_search_results, fields) {
            if (error_from_search_results) {
              this.res.send('db_error')
              throw error_from_search_results
            } else if (results_from_search_results.length>0) {
              this.search_array_to_add = this.changeData(JSON.parse(results_from_search_results[0].search_results_array),JSON.parse(results_from_non_auth_search_results[0].search_results_array),'search_array')
              this.selected_professions_to_add = this.changeData(JSON.parse(results_from_search_results[0].selected_professions),JSON.parse(results_from_non_auth_search_results[0].selected_professions),'selected_professions')
              (this.is_changed_search_array || this.is_selected_professions) && this.updateSearchResultsRow(results_from_non_auth_search_results[0].user_id)
            } else {
              this.insertInToSearchResults(results_from_non_auth_search_results[0].user_id,results_from_non_auth_search_results[0].search_results,results_from_non_auth_search_results[0].selected_professions)
            }
          })
        } else {
          this.res.send('Success')
        }
      })
    }
}