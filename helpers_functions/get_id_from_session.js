module.exports = function get_id_from_session (db,res,br,ip) {
  return new Promise(function(resolve, reject) {
    var active_time = Math.floor(Date.now() / 1000)
    db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
      if (error_from_user_sessions) {
        reject('db_error')
        throw error_from_user_sessions
      } else if (results_from_user_sessions.length>=1) {
        if ((active_time - results_from_user_sessions[0].active_time)<=results_from_user_sessions[0].session_time) {
          db.connection.query("UPDATE user_sessions SET active_time='"+active_time+"' WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_update, results_from_user_sessions_update, fields) {
            if (error_from_user_sessions_update) {
              reject('db_error')
              throw error_from_user_sessions_update
            } else {
              db.connection.query("SELECT id FROM clients WHERE login='"+results_from_user_sessions[0].login+"'", function (error_from_clients, results_from_clients, fields) {
                if (error_from_clients) {
                  reject('db_error')
                  throw error_from_clients
                } else {
                  resolve(results_from_clients[0].id)
                }
              })
            }
          })
        }
     } else if (results_from_user_sessions.length==0) {
       reject('not_authorized')
     }
   })
  });
}