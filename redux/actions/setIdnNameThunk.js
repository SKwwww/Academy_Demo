const setIdnNameAction = require('./setnNameId.js')
const sendSessionData = require('../../helpers_functions/sendSessionData.js')

const setIdnNameThunk = (db,br,ip,res,isForSessionApi) => (dispatch,getState,myThis) => {
    db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
      if (error_from_user_sessions) {
        res.send('db_error')
        throw error_from_user_sessions
      } else if (results_from_user_sessions.length>=1) {
        db.connection.query("SELECT id,name FROM clients WHERE login='"+results_from_user_sessions[0].login+"'", function (error_from_clients, results_from_clients, fields) {
          if (error_from_clients) {
            res.send('db_error')
            throw error_from_clients
          } else {
            myThis.dispatch(setIdnNameAction(results_from_clients[0].id,results_from_clients[0].name))
            isForSessionApi && sendSessionData(res,results_from_clients[0].name)
          }
        })
      }
    })
}

module.exports = setIdThunk