var db = require('./db_connect.js')
const dbArchive = require('./db_connect_archive')
const express = require('express')
const app = express()

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const fs = require("fs") // File Control library
var multer  = require('multer')  // Uploading files library (input type="file")
var upload = multer({ dest: './public/images/avatars/' })  // files init path
var q = require('q')

var cors = require('cors')
app.use(cors({
 //origin:'http://localhost:3000',
 origin: '*',
 methods:['GET','POST','PUT','DELETE','OPTIONS'],
 credentials: false // enable set cookie
}))

var useragent = require('express-useragent')   // useragent Saving browser data to req.useragent
app.use(useragent.express())

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', false);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE,OPTIONS');
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  next();
})

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true })
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const cookieParser = require('cookie-parser')

app.use(cookieParser('keyboard cat')); // any string ex: 'keyboard cat'

var md5 = require('md5');

var sha1 = require('sha1')



/*own Redux import*/
const ClassWithStore = require('./redux/ClassWithStore.js')  // import Store Class
const reducer = require('./redux/reducer.js') // import reducer function
const store = new ClassWithStore(reducer,undefined)  // create Store Object
store.subscribe(function(newState) {
  console.log('onStateChangeFunc',newState)
})
module.exports.getState = store.getState.bind(store);
const nullIdnName = require('./redux/actions/nullIdnName.js')
const setIdnNameThunk = require('./redux/actions/setIdnNameThunk.js')  // adds to state when authorized user id, name being in Async Arguments: (db,br,ip,res)
/*own Redux import*/

/* importing Validation */
const ValidClass = require('./Validation/ValidClass.js')
const check = new ValidClass()
/* importing Validation */

/* Class for user data API */
const UserClass = require('./UserClass.js')
const userClassObj = new UserClass(db)
/* Class for user data API */

/*importing Class for tests results counting*/
var TestsResultsClass = require('./helpers_classes/TestsResultsClass.js')
var forTestsResults = new TestsResultsClass()
/*importing Class for tests results*/


app.get('/get_id', function (req, res) {
  console.log(145,'inGetId')
  var user_id = store.getState().id
  res.json({user_id: user_id,parametr: req.query.parametr})
})

// Api replaces users history(search words and clicked proffessions) from non-authorized users history table to authorized users history table when LogIn
app.post('/history_replacing', urlencodedParser, function (req, res) {
  const HistoryReplacingClass = require('./helpers_classes/History/HistoryReplacingClass.js')
  const historyReplacingObj = new HistoryReplacingClass(db)
  historyReplacingObj.history_replacing(req,res)
})
// Api replaces users history(search words and clicked proffessions) from non-authorized users history table to authorized users history table when LogIn

//Registration API creates and mails user with a link for registration accept
app.post('/registration', urlencodedParser, function (req, res) {
  if (check.checkForSqlInjection(req.body.login) || check.spamSqlInjCheck(req.body.password) || check.checkForSqlInjection(req.body.name)) {
    res.send('wrong_data')
  } else {
    userClassObj.registration(md5,db,res,req,sha1)
  }
})
//Registration API creates and mails user with a link for registration accept

//Registration accept API
app.post('/for_registration_accept', urlencodedParser, function (req, res) {
  if (check.spamSqlInjCheck(req.body.data)) {
    res.send('wrong_data')
  } else {
    userClassObj.registration_accept(req,res,db,store,setIdActionThunk)
  }
})
//Registration accept API

//Authorization API
app.post('/authorization', urlencodedParser, function (req, res) {
  if (check.checkForSqlInjection(req.body.login) && check.checkForSqlInjection(req.body.password)) {
    res.send('wrong_data')
  } else {
    userClassObj.authorization(db,res,req,md5,store,setIdActionThunk)
  }
})
//Authorization API

// User LogOut
app.post('/exit', urlencodedParser, function (req, res) {
  userClassObj.exit(db,res,req,store,nullIdAction)
})
// User LogOut

// API renewing long term session users and LogOut short term session(Don't remember me)
app.post('/close_browser', urlencodedParser, function (req, res) {
  var user_id = store.getState().id
  console.log(191,'/close_browser',user_id,new Date())
  userClassObj.close_browser(db,res,req,store,nullIdAction,setIdActionThunk)
})
// API renewing long term session users and LogOut short term session(Don't remember me)

// Getting user session status(Boolean) and user name(if authorized)
app.post('/for_session_on', urlencodedParser, function (req, res) {
  userClassObj.for_session_on(res,req,db,store,nullIdAction,setIdActionThunk)
})
// Getting user session status(Boolean) and user name(if authorized)

// API creates and mails user a unique link for renewing password page
app.post('/send_to_refresh_p', urlencodedParser, function (req, res) {
  if (check.checkForSqlInjection(req.body.login)) {
    res.send('wrong_data')
  } else {
    userClassObj.send_to_refresh_p(db,res,req,sha1)
  } 
})
// API creates and mails user a unique link for renewing password page

// API checks if users link in our db actual
app.post('/for_r_p_us', urlencodedParser, function (req, res) {
  if (check.spamSqlInjCheck(req.body.data)) {
    res.send('wrong_data')
  } else {
    userClassObj.for_r_p_us(req,res,db)
  }
})
// API checks if users link in our db actual

//
app.post('/send_new_a_d', urlencodedParser, function (req, res) {
  if (check.spamSqlInjCheck(req.body.password) && check.spamSqlInjCheck(req.body.data)) {
    res.send('wrong_data')
  } else {
    userClassObj.send_new_a_d(res,db,req,md5,store,setIdActionThunk)
  }
})
//API for renewning password

app.post('/profile', function (req, res) {
  var user_id = store.getState().id
  userClassObj.profile(res,db,user_id)
})

app.post('/set_selected_interests', function (req, res) {
  var user_id = store.getState().id
  if (!req.body.chosenProffessions || check.spamSqlInjCheck(JSON.stringify(req.body.chosenProffessions))) {
    res.send('wrong_data')
  } else {
    userClassObj.set_selected_interests(res,db,user_id,req.body.chosenProffessions)
  }
})

app.post('/edit_ava', upload.single('img'), function (req, res) {
  if (req.file) {
    var user_id = store.getState().id
    db.connection.query('SELECT img FROM clients WHERE id='+user_id, function (error, results, fields) {
      if (error) {
        res.send('db_error')
        throw error
      } else {
        fs.rename(__dirname+'/public/images/avatars/'+req.file.filename, __dirname+'/public/images/avatars/'+req.file.originalname, (error_rename) => {
          if (error_rename) {
            console.log(283,error_rename);
          } 
        });
        db.connection.query("UPDATE clients SET img='"+req.file.originalname+"' WHERE id="+user_id, function (error_update, results_update, fields) {
          if (error_update) {
            res.send('db_error')
            throw error_update
          } else if (results.length>0) {
            fs.unlink(__dirname+'/public/images/avatars/'+results[0].img,function(error_unlink){
              if(error_unlink) return console.log(error_unlink);  
              res.send(req.file.originalname)
            });
          } else {
            res.send(req.file.originalname)
          }
        })
      }
    })
  }
})


app.post('/edit_profile', urlencodedParser, function (req, res) {
  if (!req.body.name || !req.body.surname || !req.body.phone || !req.body.country || !req.body.city || !req.body.birthday || Object.keys(req.body).length != 6 || check.spamSqlInjCheck(req.body.name) || check.spamSqlInjCheck(req.body.surname) || check.spamSqlInjCheck(req.body.phone) || check.spamSqlInjCheck(req.body.country) || check.spamSqlInjCheck(req.body.city) || check.spamSqlInjCheck(req.body.birthday)) {
    res.send('wrong_data')
  } else {
    const req_body_data = req.body
    var user_id = store.getState().id
    userClassObj.edit_profile(req_body_data,user_id,db,res)
  }
})


app.post('/edit_login', urlencodedParser, function (req, res) {
  if (check.checkForSqlInjection(req.body.login)) {
    res.send('wrong_data')
  } else {
    var user_id = store.getState().id
    userClassObj.edit_login(req.body.login,user_id,db,res)
  }
})

app.post('/edit_password', urlencodedParser, function (req, res) {
  if (check.spamSqlInjCheck(req.body.old_pass) || check.spamSqlInjCheck(req.body.new_pass)) {
    res.send('wrong_data')
  } else {
    var user_id = store.getState().id
    var old_password_h = md5(req.body.old_pass)
    var new_password_h = md5(req.body.new_pass)
    userClassObj.edit_password(old_password_h,new_password_h,user_id,db,res)
  }
})


/*
app.post('/send_search_array', function (req, res) {
 var user_id = store.getState().id
  req.body.search_array // ["java", "script","php"]
  req.body.search_type //"courses" | "tests" | "webinars"
  var ValidClass = require('./Validation/ValidClass.js')
  var check = new ValidClass()
  const searchFunc = ()=> {
   var count = 0
   const searchArray = req.body.search_array
   for (var i=0;i< searchArray.length;i++) {
   
      count++
      if (check.spamSqlInjChec(searchArray[i])) {
        return true
       }
    }
    if(count ===  searchArray.length) return false
    
  }
  
 
  })
  if(searchFunc()) {
    res.send('wrong_data')
  } else if( check.spamSqlInjCheck(req.body.search_type)) {
      res.send('wrong_data')
   } else {
     
   	 db.connection.query('SELECT * FROM search_results WHERE' , function (error_from_special_courses, results_from_special_courses, fields) {
       if (error_from_special_courses) {
         res.send('db_error')
          throw error_from_special_courses
       } else {
         res.json({special_courses: results_from_special_courses})
       }
     })
   }
      
  
  
})
*/

app.post('/get_test_info', urlencodedParser, function (req, res) {
  var ValidClass = require('./Validation/ValidClass.js')
  var check = new ValidClass()
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress
  var br = req.useragent.browser + req.useragent.version
  if (req.body.id && !check.numberCheck(req.body.id)) {
    var get_id_from_session = require('./helpers_functions/get_id_from_session.js')
    db.connection.query('SELECT tests.id,tests.name,tests.description,tests.questions_quantity,tests.time,tests.test_topics,tests.right_answers_qu,professions.name AS profession,special_courses.profession_id AS profession_id FROM tests JOIN special_courses on tests.course_id=special_courses.id JOIN professions on special_courses.profession_id=professions.id WHERE tests.id='+req.body.id, function (error, results_from_tests, fields) {
      if (error) {
        res.send('db_error')
        throw error
      } else if (results_from_tests.length>0) {
        db.connection.query('SELECT tests.id,tests.name,tests.description,tests.time,professions.name AS profession,special_courses.profession_id AS profession_id FROM tests JOIN special_courses on tests.course_id=special_courses.id JOIN professions on special_courses.profession_id=professions.id WHERE professions.id='+results_from_tests[0].profession_id+' AND tests.id!='+req.body.id, function (error_from_all_tests, results_from_all_tests, fields) {
          if (error_from_all_tests) {
            res.send('db_error')
            throw error_from_all_tests
          } else {
            get_id_from_session(db,res,br,ip).then(function(result){
              db.connection.query("SELECT right_answers,date FROM tests_results WHERE test_id="+req.body.id+" AND client_id="+result, function (error_from_tests_results, results_from_tests_results, fields) {
                if (error_from_tests_results) {
                  res.send('db_error')
                  throw error_from_tests_results
                } else if (results_from_tests_results.length==0) {
                  res.json({session_status: true, tests: results_from_tests[0], all_tests: results_from_all_tests, questions_quantity: results_from_tests[0].questions_quantity,test_topics: results_from_tests[0].test_topics, last_attempt: false})
                } else if (results_from_tests_results.length>1) {
                  results_from_tests_results.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1)
                  res.json({session_status: true, tests: results_from_tests[0], all_tests: results_from_all_tests, questions_quantity: results_from_tests[0].questions_quantity,test_topics: results_from_tests[0].test_topics, last_attempt: results_from_tests_results[0]})
                } else {
                  res.json({session_status: true, tests: results_from_tests[0], all_tests: results_from_all_tests, questions_quantity: results_from_tests[0].questions_quantity,test_topics: results_from_tests[0].test_topics, last_attempt: results_from_tests_results[0]})
                }
              })  // SELECT * FROM `tests_results` ORDER BY date ASC LIMIT 1
            }).catch(function(err){
              res.json({session_status: false, tests: results_from_tests[0], all_tests: results_from_all_tests, questions_quantity: results_from_tests[0].questions_quantity,test_topics: results_from_tests[0].test_topics, last_attempt: false})
            })
          }
        })
      } else {
        res.send('no_such_test')
      }
    })
  } else {
    res.send('wrong_data')
  }    
})

app.post('/get_test_questions', urlencodedParser, function (req, res) {
  var ValidClass = require('./Validation/ValidClass.js')
  var check = new ValidClass();
  if (req.body.id && !check.numberCheck(req.body.id)) {
    db.connection.query('SELECT questions,right_answers_qu,time,course_id FROM tests WHERE id='+req.body.id, function (error, results_from_tests, fields) {
      if (error) {
        res.send('db_error')
        throw error;
      } else {
        db.connection.query('SELECT id,name FROM special_courses WHERE id='+results_from_tests[0].course_id, function (error_from_special_courses, results_from_special_courses, fields) {
          if (error_from_special_courses) {
            res.send('db_error')
            throw error_from_special_courses;
          } else {
            var user_id = store.getState().id
            console.log(658,user_id)
            // NEED TO BE UNCOMMENTED AFTER TESTING TESTPASSING AND TEST RESULTS PAGES
            // db.connection.query("SELECT * FROM tests_results WHERE test_id='"+req.body.id+"' AND client_id="+user_id, function (error_from_tests_results, results_from_tests_results, fields) {
            //   if (error_from_tests_results) {
            //     res.send('db_error')
            //     throw error_from_tests_results;
            //   } else if (results_from_tests_results.length > 0) {
            //     var now_time = Math.floor(Date.now() / 1000)
            //     var lastTestPassngTime
            //     if (results_from_tests_results.length > 1) {
            //       results_from_tests_results.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1)
            //       lastTestPassngTime = new Date(results_from_tests_results[0].date).getTime() / 1000
            //     } else {
            //       lastTestPassngTime = new Date(results_from_tests_results[0].date).getTime() / 1000
            //     }
            //     if ((now_time - lastTestPassngTime) > 60*60*24) {
            //       res.json({questions: results_from_tests[0].questions, right_answers_qu: results_from_tests[0].right_answers_qu, time: results_from_tests[0].time, course_name: results_from_special_courses[0].name, course_id: results_from_special_courses[0].id})
            //     } else {
            //       res.send('testPassingTimeFalse')
            //     }
            //   } else {
            //     res.json({questions: results_from_tests[0].questions, right_answers_qu: results_from_tests[0].right_answers_qu, time: results_from_tests[0].time, course_name: results_from_special_courses[0].name, course_id: results_from_special_courses[0].id})
            //   }
            // })
            res.json({questions: results_from_tests[0].questions, right_answers_qu: results_from_tests[0].right_answers_qu, time: results_from_tests[0].time, course_name: results_from_special_courses[0].name, course_id: results_from_special_courses[0].id})
          }
        })
      }
    })
  } else {
    res.send('wrong_data')
  }
})

app.post('/save_test_results', urlencodedParser, function (req, res) {
  if (!req.body.test_id || check.numberCheck(req.body.test_id) || !req.body.time_spent || check.spamSqlInjCheck(req.body.time_spent) || !req.body.user_answers || check.spamSqlInjCheck(JSON.stringify(req.body.user_answers))) {
    res.send('wrong_data')
  } else {
    var date = new Date()
    var user_id = store.getState().id
    db.connection.query("SELECT questions FROM tests WHERE id="+req.body.test_id, function (error_from_tests_select, results_from_tests_select, fields) {
      if (error_from_tests_select) {
        res.send('db_error')
        throw error_from_tests_select;
      } else {
        console.log(735,req.body.user_answers,new Date())
        forTestsResults.getRightAnswers(JSON.parse(results_from_tests_select[0].questions),req.body.user_answers).then(function(right_answers){
          console.log(738,right_answers)
          db.connection.query("INSERT INTO tests_results (user_answers,right_answers,client_id,test_id,date,time_spent) VALUES ('"+JSON.stringify(req.body.user_answers)+"','"+right_answers+"','"+user_id+"','"+req.body.test_id+"','"+date+"','"+req.body.time_spent+"')", function (error_from_tests_results_insert, results_from_tests_results_insert, fields) {
            if (error_from_tests_results_insert) {
              res.send('db_error')
              throw error_from_tests_results_insert;
            } else {
              res.send('Success')
            }
          })
        }).catch(function(err){
          })
      }
    })
  }
})

app.post('/get_test_results', function (req, res) {
  if (!req.body.test_id || check.numberCheck(req.body.test_id)) {
    res.send('wrong_data')
  } else {
    var user_id = store.getState().id
    db.connection.query("SELECT tests.name AS test,tests.right_answers_qu AS needed_to_pass, tests.questions_quantity, tests.questions AS test_questions, special_courses.name AS course, special_courses.id AS course_id, tests_results.user_answers AS user_answers,tests_results.date AS date,tests_results.right_answers FROM tests JOIN special_courses ON tests.course_id=special_courses.id JOIN tests_results ON tests.id=tests_results.test_id WHERE tests.id='"+req.body.test_id+"' AND client_id='"+user_id+"' ORDER BY tests_results.date DESC LIMIT 1", function (error, results, fields) {
      if (error) {
        res.send('db_error')
        throw error
      } else if (results.length>0) {
        if (results[0].questions_quantity == results[0].right_answers) {
          res.json({test: results[0].test,needed_to_pass: results[0].needed_to_pass,questions_quantity: results[0].questions_quantity,right_answers: results[0].right_answers,course: results[0].course, course_id: results[0].course_id,date: results[0].date,wrong_answers: false})
        } else {
          forTestsResults.findWrongAnswers(res,results[0])
        }
      } else {
        res.send('no_passed_results')
      }
    })
  }
})


  app.listen('ADD PORTNAME HERE')