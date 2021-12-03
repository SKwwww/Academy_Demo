module.exports = class TestsResultsClass {
  getRightAnswers (questions,userAnswers) {
    return new Promise(function(resolve, reject) {
      var rightAnswers_count = 0;
      for (var i = 0; i < questions.length; i++) {
        if (Array.isArray(userAnswers[i])) {
          let userTrueAnswers = 0;
          let trueAnswers = 0;
          let arrUserAnswers = userAnswers[i];
          let userAnswersQuantity = arrUserAnswers.length;
          questions[i].answers.map((el, indx) => {
            if (el.value == 'true' && arrUserAnswers.indexOf(indx) !== -1) {
              userTrueAnswers += 1;
            }
            if (el.value == 'true') {
              trueAnswers += 1;
            }
          });
          if (
            userTrueAnswers === trueAnswers &&
            userAnswersQuantity == trueAnswers
          ) {
            rightAnswers_count += 1;
          }
        } else if (userAnswers[i] && (questions[i].answers[userAnswers[i] - 1].value == 'true')) {
          rightAnswers_count += 1;
        }
      }
      resolve(rightAnswers_count)
    })
  }
  getWrongCheckboxAnswers (questions,userAnswers) {
    return new Promise(function(resolve, reject) {
      let wrongCheckboxAnswersQuestions = [];
      for (var i = 0; i < questions.length; i++) {
        if (Array.isArray(userAnswers[i])) {
          let userTrueAnswers = 0;
          let trueAnswers = 0;
          let arrUserAnswers = userAnswers[i];
          let userAnswersQuantity = arrUserAnswers.length;
          questions[i].answers.map((el, indx) => {
            if (el.value == 'true' && arrUserAnswers.indexOf(indx) !== -1) {
              userTrueAnswers += 1;
            }
            if (el.value == 'true') {
              trueAnswers += 1;
            }
          })
          if (userTrueAnswers != trueAnswers || userAnswersQuantity > trueAnswers) {
            wrongCheckboxAnswersQuestions.push(i);
          }
        }
      }
      if (wrongCheckboxAnswersQuestions.length>=0) {
        resolve(wrongCheckboxAnswersQuestions);
      } else {
        reject('wrong_array')
      }
    })
  }
  findWrongAnswers (res,results) {
    const jsn_test_questions = JSON.parse(results.test_questions)
    results.test_questions = jsn_test_questions
    const jsn_user_answers = JSON.parse(results.user_answers)
    results.user_answers = jsn_user_answers
    this.getWrongCheckboxAnswers(results.test_questions,results.user_answers).then(function(wrongCheckboxAnswersQuestions){
      var wrongAnswers = []
      const questions = jsn_test_questions
      questions.map((item, index) => {
        const userAnswers = jsn_user_answers
        if (questions[index].type == "checkbox") {
          if (wrongCheckboxAnswersQuestions.indexOf(index) !== -1) {
            if (userAnswers[index].length == 0) {
              wrongAnswers.push({question: item.question,answers: false})
            } else if (userAnswers[index].length == 1) {
              wrongAnswers.push({question: item.question,answers: item.answers[userAnswers[0]].answer})
            } else if (userAnswers[index].length > 1) {
              wrongAnswers.push({question: item.question,answers: userAnswers[index].map((item_ans) => {
                        return item.answers[item_ans].answer;
                      })})
            }
          }
        } else if (questions[index].type == "radio") {
          if (
            userAnswers[index] &&
            questions[index].answers[userAnswers[index] - 1].value != 'true'
          ) {
            wrongAnswers.push({question: item.question,answers: item.answers[userAnswers[index] - 1].answer})
          } else if (!userAnswers[index]) {
            wrongAnswers.push({question: item.question,answers: false})
          }
        }
      })
      res.json({test: results.test,needed_to_pass: results.needed_to_pass,questions_quantity: results.questions_quantity,right_answers: results.right_answers,course: results.course, course_id: results.course_id,date: results.date,wrong_answers: wrongAnswers})
    }).catch(function(err){
      const questions = jsn_test_questions
      var wrongAnswers = []
      const userAnswers = results.user_answers
      questions.map((item, index) => {
        if (userAnswers[index] && typeof item.answers != 'object' && item.answers[userAnswers[index] - 1].value != 'true') {
          wrongAnswers.push({question: item.question,answers: item.answers[userAnswers[index] - 1].answer})
        } else if (!userAnswers[index] && typeof item.answers != 'object') {
          wrongAnswers.push({question: item.question,answers: false})
        }
      })
      res.json({test: results.test,needed_to_pass: results.needed_to_pass,questions_quantity: results.questions_quantity,right_answers: results.right_answers,course: results.course, course_id: results.course_id,date: results.date,wrong_answers: wrongAnswers})
    })
  }
}