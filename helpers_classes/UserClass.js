const HistoryReplacingClass = require('./helpers_classes/History/HistoryReplacingClass.js')

module.exports = class UserClass {
    constructor (db) {
      this.db = db
    }
    registration (md5,db,res,req,sha1) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var login = req.body.login
      var password_h = md5(req.body.password)
      var name = req.body.name
      var session_time = req.body.session_time ? 60*60*24*60 : 60*60
      var active_time = Math.floor(Date.now() / 1000)
      var gen_new_link = require('./helpers_functions/gen_new_link.js')
      var temp_url = gen_new_link(sha1)
      db.connection.query('SELECT * FROM clients WHERE login="'+login+'"', function (error_check, results_check, fields) {
        if (error_check) {
          res.send('db_error')
          throw error_check;
        } else if (results_check.length>0 && results_check[0].login == login) {
          res.send(false)
        } else {
          db.connection.query('SELECT * FROM clients_temporary WHERE login="'+login+'"', function (error_from_clients_temporary, results_from_clients_temporary, fields) {
            if (error_from_clients_temporary) {
              res.send('db_error')
              throw error_from_clients_temporary;
            } else if (results_from_clients_temporary.length>0 && results_from_clients_temporary[0].login == login) {
              if (active_time - results_from_clients_temporary[0].start_time <= results_from_clients_temporary[0].data_life_time) {
                db.connection.query("UPDATE clients_temporary SET start_time='"+active_time+"' WHERE login='"+login+"'", function (error_from_clients_temporary_update, results_from_clients_temporary_update, fields) {
                  if (error_from_clients_temporary_update) {
                    res.send('db_error')
                    throw error_from_clients_temporary_update
                  } else {
                    //var url = address+'/for_registration_i'+results_from_clients_temporary[0].temp_url
                    //отправляем на почту login
                    console.log(results_from_clients_temporary[0].temp_url)
                    res.send('link_resended')
                  }
                })
              } else {
                db.connection.query("DELETE FROM clients_temporary WHERE login='"+login+"'", function (error_from_clients_temporary_delete, results_from_clients_temporary_delete, fields) {
                  if (error_from_clients_temporary_delete) {
                    res.send('db_error')
                    throw error_from_clients_temporary_delete
                  } else {
                    db.connection.query("INSERT INTO clients_temporary (login,password,name,temp_url,start_time,data_life_time) VALUES ('"+login+"','"+password_h+"','"+name+"','"+temp_url+"','"+active_time+"','3600')", function (error_from_clients_temporary_insert, results_from_clients_temporary_insert, fields) {
                      if (error_from_clients_temporary_insert) {
                        res.send('db_error')
                        throw error_from_clients_temporary_insert
                      }  else {
                        //var url = address+'/confirm-registration'+results_from_clients_temporary[0].temp_url
                        //отправляем на почту login
                        console.log(temp_url)
                        res.send('Success')
                      }
                    })
                  }
                })
              }
            } else {
              db.connection.query("INSERT INTO clients_temporary (login,password,name,temp_url,start_time,data_life_time) VALUES ('"+login+"','"+password_h+"','"+name+"','"+temp_url+"','"+active_time+"','3600')", function (error_from_clients_temporary_insert, results_from_clients_temporary_insert, fields) {
                if (error_from_clients_temporary_insert) {
                  res.send('db_error')
                  throw error_from_clients_temporary_insert
                }  else {
                  //var url = address+'/confirm-registration'+results_from_clients_temporary[0].temp_url
                  //отправляем на почту login
                  console.log(temp_url)
                  res.send('Success')
                }
              })
            }
          })
        }
      })
    }
    registration_accept (req,res,db,store,setIdActionThunk) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var url = req.body.data
      var now_time = Math.floor(Date.now()/1000)
      db.connection.query("SELECT * FROM clients_temporary WHERE temp_url='"+url+"'", function (error_from_clients_temporary, results_from_clients_temporary, fields) {
        if (error_from_clients_temporary) {
          res.send('db_error')
          throw error_from_clients_temporary
        } else if (results_from_clients_temporary.length==1) {
          if (now_time - results_from_clients_temporary[0].start_time <= results_from_clients_temporary[0].data_life_time) {
            db.connection.query("SELECT * FROM teachers_logins WHERE login='"+results_from_clients_temporary[0].login+"'", function (error_from_teachers_logins, results_from_teachers_logins, fields) {
              if (error_from_teachers_logins) {
                res.send('db_error')
                throw error_from_teachers_logins
              } else if (results_from_teachers_logins.length>0) {
                db.connection.query("INSERT INTO clients (login,password,name,student_or_teacher) VALUES ('"+results_from_clients_temporary[0].login+"','"+results_from_clients_temporary[0].password+"','"+results_from_clients_temporary[0].name+"','teacher')", function (error_from_clients_insert, results_from_clients_insert, fields) {
                  if (error_from_clients_insert) {
                    res.send('db_error')
                    throw error_from_clients_insert
                  } else {
                    db.connection.query("DELETE FROM teachers_logins WHERE login='"+results_from_clients_temporary[0].login+"'", function (error_from_teachers_logins_delete, results_from_teachers_logins_delete, fields) {
                      if (error_from_teachers_logins_delete) {
                        res.send('db_error')
                        throw error_from_teachers_logins_delete
                      } else {
                        db.connection.query("DELETE FROM clients_temporary WHERE temp_url='"+url+"'", function (error_from_clients_temporary_delete, results_from_clients_temporary_delete, fields) {
                          if (error_from_clients_temporary_delete) {
                            res.send('db_error')
                            throw error_from_clients_temporary_delete
                          } else {
                            db.connection.query("INSERT INTO user_sessions (login,active_time,session_time,ars,browser) VALUES ('"+results_from_clients_temporary[0].login+"','"+now_time+"','3600','"+ip+"','"+br+"')", function (error_from_user_sessions_insert, results_from_user_sessions_insert, fields) {
                              if (error_from_user_sessions_insert) {
                                res.send('db_error')
                                throw error_from_user_sessions_insert
                              }  else {
                                //mail to results_from_clients_temporary.login: "Success Registration"
                                store.dispatch(setIdActionThunk(db,br,ip,res,false))
                                res.send('Success')
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              } else {
                db.connection.query("INSERT INTO clients (login,password,name,student_or_teacher) VALUES ('"+results_from_clients_temporary[0].login+"','"+results_from_clients_temporary[0].password+"','"+results_from_clients_temporary[0].name+"','student')", function (error_from_clients_insert, results_from_clients_insert, fields) {
                  if (error_from_clients_insert) {
                    res.send('db_error')
                    throw error_from_clients_insert
                  } else {
                    db.connection.query("DELETE FROM clients_temporary WHERE temp_url='"+url+"'", function (error_from_clients_temporary_delete, results_from_clients_temporary_delete, fields) {
                      if (error_from_clients_temporary_delete) {
                        res.send('db_error')
                        throw error_from_clients_temporary_delete
                      } else {
                        //mail to results_from_clients_temporary.login: "Success Registration"
                        db.connection.query("INSERT INTO user_sessions (login,active_time,session_time,ars,browser) VALUES ('"+results_from_clients_temporary[0].login+"','"+now_time+"','3600','"+ip+"','"+br+"')", function (error_from_user_sessions_insert, results_from_user_sessions_insert, fields) {
                          if (error_from_user_sessions_insert) {
                            res.send('db_error')
                            throw error_from_user_sessions_insert
                          }  else {
                            //mail to results_from_clients_temporary.login: "Success Registration"
                            store.dispatch(setIdActionThunk(db,br,ip,res,false))
                            res.send('Success')
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          } else {
            db.connection.query("DELETE FROM clients_temporary WHERE temp_url='"+url+"'", function (error_from_clients_temporary_delete, results_from_clients_temporary_delete, fields) {
              if (error_from_clients_temporary_delete) {
                res.send('db_error')
                throw error_from_clients_temporary_delete
              } else {
                res.send('reg_time_expired')
              }
            })
          }
        } else {
          res.send('no_link')
        }
      })
    }
    authorization (db,res,req,md5,store,setIdActionThunk) {
      var login = req.body.login
      var password_h = md5(req.body.password)
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var active_time = Math.floor(Date.now() / 1000)
      var session_time = req.body.session_time ? (60*60*24*60) : (60*60)
      db.connection.query("SELECT * FROM clients WHERE login='"+login+"' AND password='"+password_h+"'", function (error, results, fields) {
        if (error) {
          res.send('db_error')
          throw error
        } else if (results.length>0) {
          db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
            if (error_from_user_sessions) {
              res.send('db_error')
              throw error_from_user_sessions
            } else if (results_from_user_sessions.length>=1) {
              res.send('Вы уже зарегистрированы и авторизованы')
            } else {
              db.connection.query("INSERT INTO user_sessions (login,active_time,session_time,ars,browser) VALUES ('"+login+"','"+active_time+"','"+session_time+"','"+ip+"','"+br+"')", function (error_from_user_sessions_insert, results_from_user_sessions_insert, fields) {
                if (error_from_user_sessions_insert) {
                  res.send('db_error')
                  throw error_from_user_sessions_insert
                }  else {
                  //mail to results_from_clients_temporary.login: "Success Registration"
                  store.dispatch(setIdActionThunk(db,br,ip,res,false))
                  res.send('Success')
                }
              }) 
            }
          })  
        } else {
          db.connection.query('SELECT * FROM clients WHERE login="'+login+'"', function (error_from_clients_pass, results_from_clients_pass, fields) {
            if (error_from_clients_pass) {
              res.send('db_error')
              throw error_from_clients_pass
            } else if (results_from_clients_pass.length>0 && results_from_clients_pass[0].password != password_h) {
              res.send('Не верно введен пароль')
            } else {
              res.send('Нет пользователя с таким логином. Зарегистрируйтесь.')
            }
          })
        }
      });
    }
    exit (db,res,req,store,nullIdAction) { 
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
        if (error_from_user_sessions) {
          res.send('db_error')
          throw error_from_user_sessions
        } else {
          db.connection.query("DELETE FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_delete, results_from_user_sessions_delete, fields) {
            if (error_from_user_sessions_delete) {
              res.send('db_error')
              throw error_from_user_sessions_delete
            } else {
              store.dispatch(nullIdAction())
              res.send('Success')
            }
          })
        }
      })
    }
    close_browser (db,res,req,store,nullIdAction,setIdActionThunk) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var active_time = Math.floor(Date.now() / 1000)
      db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
        if (error_from_user_sessions) {
          res.send('db_error')
          throw error_from_user_sessions
        } else if (results_from_user_sessions.length == 0) {
          res.send('no_user_auth')
        } else if (results_from_user_sessions.length == 1) {
          if (results_from_user_sessions[0].session_time == (60*60)) {
            db.connection.query("DELETE FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_delete, results_from_user_sessions_delete, fields) {
              if (error_from_user_sessions_delete) {
                res.send('db_error')
                throw error_from_user_sessions_delete
              } else {
                store.dispatch(nullIdAction())
                res.send('Success')
              }
            })
          } else {
            db.connection.query("UPDATE user_sessions SET active_time='"+active_time+"' WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_update, results_from_user_sessions_update, fields) {
              if (error_from_user_sessions_update) {
                res.send('db_error')
                throw error_from_user_sessions_update
              } else {
                if (!store.getState().id) {
                  store.dispatch(setIdActionThunk(db,br,ip,res,false))
                }
                res.send('session_updated')
              }
            })
          }
        }
      })
    }
    for_session_on (res,req,db,store,nullIdAction,setIdActionThunk) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var active_time = Math.floor(Date.now() / 1000)
      db.connection.query("SELECT * FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
        if (error_from_user_sessions) {
          res.send('db_error')
          throw error_from_user_sessions
        } else if (results_from_user_sessions.length==1) {
          if ((active_time - results_from_user_sessions[0].active_time)<=results_from_user_sessions[0].session_time) {
            db.connection.query("UPDATE user_sessions SET active_time='"+active_time+"' WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_update, results_from_user_sessions_update, fields) {
              if (error_from_user_sessions_update) {
                res.send('db_error')
                throw error_from_user_sessions_update
              } else {
                store.dispatch(setIdActionThunk(db,br,ip,res,true))
              }
            })
          } else {
            db.connection.query("DELETE FROM user_sessions WHERE browser='"+br+"' AND ars='"+ip+"'", function (error_from_user_sessions_delete, results_from_user_sessions_delete, fields) {
              if (error_from_user_sessions_delete) {
                res.send('db_error')
                throw error_from_user_sessions_delete
              } else {
                store.dispatch(nullIdAction())
                console.log(300,'USERCLASS for session_on',store.getState())
                res.json({isSessionOn: false,name: false})
              }
            })
          }
        } else if (results_from_user_sessions.length==0) {
          res.json({isSessionOn: false,name: false})
        }
      })
    }
    send_to_refresh_p (db,res,req,sha1) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var login = req.body.login
      var active_time = Math.floor(Date.now() / 1000)
      db.connection.query("SELECT * FROM refresh_password_clients WHERE login='"+login+"'", function (error_from_refresh_password_clients, results_from_refresh_password_clients, fields) {
        if (error_from_refresh_password_clients) {
          res.send('db_error')
          throw error_from_refresh_password_clients
        } else if (results_from_refresh_password_clients.length==1) {
          if (active_time - results_from_refresh_password_clients[0].start_time <= results_from_refresh_password_clients[0].data_life_time) {
            db.connection.query("UPDATE refresh_password_clients SET start_time='"+active_time+"' WHERE login='"+login+"'", function (error_from_refresh_password_clients_update, results_from_refresh_password_clients_update, fields) {
              if (error_from_refresh_password_clients_update) {
                res.send('db_error')
                throw error_from_refresh_password_clients_update
              } else {
                //отправляем на почту ссылку url+results_from_refresh_password_clients.url????
                res.send('link_resended')
              }
            })
          } else {
            db.connection.query("DELETE FROM refresh_password_clients WHERE login='"+login+"'", function (error_from_refresh_password_clients_delete, results_from_refresh_password_clients_delete, fields) {
              if (error_from_refresh_password_clients_delete) {
                res.send('db_error')
                throw error_from_refresh_password_clients_delete
              } else {
                res.send('Ссылка просрочена. Необходимо подать новую заявку') // {message:}
              }
            })
          }
        } else {
          db.connection.query("SELECT * FROM clients WHERE login='"+login+"'", function (error_from_clients, results_from_clients, fields) {
            if (error_from_clients) {
              res.send('db_error')
              throw error_from_clients
            } else if (results_from_clients.length==1) {
              var gen_new_link = require('./helpers_functions/gen_new_link.js')
              var temp_url = gen_new_link(sha1)
              db.connection.query("INSERT INTO refresh_password_clients (login,url,start_time,data_life_time) VALUES ('"+login+"','"+temp_url+"','"+active_time+"','3600')", function (error_from_refresh_password_clients_insert, results_from_refresh_password_clients_insert, fields) {
                if (error_from_refresh_password_clients_insert) {
                  res.send('db_error')
                  throw error_from_refresh_password_clients_insert
                }  else {
                  console.log(temp_url)
                  res.send('Success')
                }
              })
              // отправляем на почту  address+'/for_registration_i'+results_from_refresh_password_clients[0].temp_url ????????
            } else {
              res.send('no_login')
            }
          })
        }
      })
    }
    for_r_p_us (req,res,db) {
      var url = req.body.data
      var now_time = Math.floor(Date.now() / 1000)
      db.connection.query("SELECT * FROM refresh_password_clients WHERE url='"+url+"'", function (error_from_refresh_password_clients, results_from_refresh_password_clients, fields) {
        if (error_from_refresh_password_clients) {
          res.send('db_error')
          throw error_from_refresh_password_clients
        } else if (results_from_refresh_password_clients.length>0) {
          if ((now_time - results_from_refresh_password_clients[0].start_time) <= results_from_refresh_password_clients[0].data_life_time) {
            res.send('Success')
          } else {
            db.connection.query("DELETE FROM refresh_password_clients WHERE url='"+url+"'", function (error_from_refresh_password_clients_delete, results_from_refresh_password_clients_delete, fields) {
              if (error_from_refresh_password_clients_delete) {
                res.send('db_error')
                throw error_from_refresh_password_clients_delete
              } else {
                res.send('refresh_password_time_expired')
              }
            })
          }
        } else {
          res.send('no_link')
        }
      })
    }
    send_new_a_d (res,db,req,md5,store,setIdActionThunk) {
      var password = md5(req.body.password)
      var url = req.body.data
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
      var br = req.useragent.browser + req.useragent.version
      var now_time = Math.floor(Date.now() / 1000)
      var session_time = 3600
      db.connection.query("SELECT * FROM refresh_password_clients WHERE url='"+url+"'", function (error_from_refresh_password_clients, results_from_refresh_password_clients, fields) {
        if (error_from_refresh_password_clients) {
          res.send('db_error')
          throw error_from_refresh_password_clients
        } else if (results_from_refresh_password_clients.length>0) {
          if ((now_time - results_from_refresh_password_clients[0].start_time) <= results_from_refresh_password_clients[0].data_life_time) {
            db.connection.query("UPDATE clients SET password='"+password+"' WHERE login='"+results_from_refresh_password_clients[0].login+"'", function (error_from_clients_update, results_from_clients_update, fields) {
              if (error_from_clients_update) {
                res.send('db_error')
                throw error_from_clients_update
              } else {
                db.connection.query("SELECT * FROM user_sessions WHERE ars='"+ip+"' AND browser='"+br+"'", function (error_from_user_sessions, results_from_user_sessions, fields) {
                  if (error_from_user_sessions) {
                    res.send('db_error')
                    throw error_from_user_sessions
                  }  else if (results_from_user_sessions.length == 0) {
                    db.connection.query("INSERT INTO user_sessions (login,active_time,session_time,ars,browser) VALUES ('"+results_from_refresh_password_clients[0].login+"','"+now_time+"','"+session_time+"','"+ip+"','"+br+"')", function (error_from_user_sessions_insert, results_from_user_sessions_insert, fields) {
                      if (error_from_user_sessions_insert) {
                        res.send('db_error')
                        throw error_from_user_sessions_insert
                      }  else {
                        db.connection.query("DELETE FROM refresh_password_clients WHERE url='"+url+"'", function (error_from_refresh_password_clients_delete, results_from_refresh_password_clients_delete, fields) {
                          if (error_from_refresh_password_clients_delete) {
                            res.send('db_error')
                            throw error_from_refresh_password_clients_delete
                          } else {
                            store.dispatch(setIdActionThunk(db,br,ip,res,false))
                            res.send('Success')
                          }
                        })
                      }
                    })
                  }
                })
               }
             })
           } else {
            db.connection.query("DELETE FROM refresh_password_clients WHERE url='"+url+"'", function (error_from_refresh_password_clients_delete, results_from_refresh_password_clients_delete, fields) {
              if (error_from_refresh_password_clients_delete) {
                res.send('db_error')
                throw error_from_refresh_password_clients_delete
              } else {
                res.send('refresh_password_time_expired')
              }
            })
          }
        } else {
          res.send('no_link')
        }
      })
    }
    profile (res,db,user_id) {
      db.connection.query('SELECT login,name,surname,phone,country,city,birthday,img FROM clients WHERE id="'+user_id+'"', function (error, results_from_clients, fields) {
        if (error) {
          res.send('db_error')
          throw error
        } else {
          db.connection.query('SELECT * FROM search_results WHERE user_id="'+user_id+'"', function (error_search_results, results_from_search_results, fields) {
            if (error_search_results) {
              res.send('db_error')
              throw error_search_results
            } else {
              const isHistory = results_from_search_results.length > 0 ? true : false
              res.json({client: results_from_clients[0],isHistory: isHistory})
            }
          })
        }
      });
    }
    set_selected_interests (res,db,user_id,chosenProffessions) {
      db.connection.query('UPDATE search_results SET selected_professions="'+JSON.stringify(chosenProffessions)+'" WHERE user_id='+user_id, function (error, results, fields) {
        if (error) {
          res.send('db_error')
          throw error;
        } else {
          res.send('Success')
        }
      })
    }
    edit_profile (data,id,db,res) {
      console.log(482,id)
      db.connection.query("UPDATE clients SET name='"+data.name+"',surname='"+data.surname+"',phone='"+data.phone+"',country='"+data.country+"',city='"+data.city+"',birthday='"+data.birthday+"' WHERE id="+id, function (error, results, fields) {
        if (error) {
          res.send('db_error')
          throw error
        } else {
          res.send('Success')
        }
      })
    }
    edit_login (login,id,db,res) {
      db.connection.query('SELECT * FROM clients WHERE login="'+login+'"', function (error_check, results_check, fields) {
      if (error_check) {
        res.send('db_error')
        throw error_check;
      } else if (results_check.length>0 && results_check[0].login == login && id!=results_check[0].id) {
        res.send('false')
      } else {
        db.connection.query('UPDATE clients SET login="'+login+'" WHERE id='+id, function (error, results, fields) {
          if (error) {
            res.send('db_error')
            throw error
          } else {
            res.send('Success')
          }
        });
      }
    });
    }
    edit_password (old_password,new_password,id,db,res) {
      db.connection.query('SELECT password FROM clients WHERE id='+id, function (error, results, fields) {
        if (error) {
          res.send('db_error')
          throw error
        }
        else if (results[0].password != old_password) {
          res.send('false')
        } else {
          db.connection.query('UPDATE clients SET password="'+new_password+'" WHERE id='+id, function (error_update, results_update, fields) {
            if (error_update) {
              res.send('db_error')
              throw error_update
            } else {
              res.send('Success')
            }
          })
        }
      })
    }
    
}