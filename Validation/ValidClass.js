module.exports = class ValidClass {
  constructor() {
    this.сyrillicRe = /[а-яёіїА-ЯЁІЇ ]+/
    this.latinSymbolsRe = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]/
    this.nameRegisterRe = /(^[а-я]{1})|([А-Я]{1,14}$)/
    this.spaceRe = /^ +/g
    this.spamSqlInjWords = ["select","insert","update","delete","drop","alter","@","www.","http",".com",".ru",".ua",".net",".org","db.",".connection","connection.",".query","query\\("]
    this.sqlInjectionWords = ["select","insert","update","delete","drop","alter","db.",".connection","connection.",".query","query\\("]
  }
  validLogin (value) {
    if (value.match(/@/) && !value.match(this.сyrillicRe) && value.length >= 6 && value && value!=' ') {
      return false
    } else {
      return true
    }
  }
  validPassword (value) {
    if (!value.match(this.сyrillicRe) && value.length >= 8 && value && value!=' ') {
      return false
    } else {
      return true
    }
  }
  validName (value) {
    if (!value.match(this.latinSymbolsRe) && !value.match(this.spaceRe) && !value.match(this.nameRegisterRe) && value.length >= 2 && value.length <=30 && value && value!=' ') {
      return false
    } else {
      return true
    }
  }
  checkForSqlInjection (value) {
    var value_inner = value.toLowerCase()
    for (var i=0;i<this.sqlInjectionWords;i++) {
      if (value_inner == this.sqlInjectionWords[i]) {
        return true // результат проверки: одно из слов выявлено, вывод: Возможна SqlInjection
      }
    }
    return false // результат проверки: ни одно из слов/символов не выявлено, вывод: Признаков SqlInjection нет
  }
  spamSqlInjCheck (value) { // Spam Check: e-mail,url    @,.,www,http,https,com,ru,ua,net,org
    var value_inner = value.toLowerCase()
      for (var i=0;i<this.spamSqlInjWords.length;i++) {
        var temporary_ternar_value_not_shielded = value_inner.indexOf(this.spamSqlInjWords[i]) != -1 ? this.spamSqlInjWords[i] : false
        if (temporary_ternar_value_not_shielded) {
          var temporary_ternar_value_shielded = '\\'+temporary_ternar_value_not_shielded+'\\'
          if (value_inner.indexOf(temporary_ternar_value_shielded) >=0) {
            value_inner = value_inner.replace(temporary_ternar_value_shielded,'') // вырезаем из строки и сохраняем её новое значение
            return this.spamSqlInjCheck(value_inner) // рекурсия - вызываем тот же метод класса, передаём новую строку в аргементе
          } else {
            return true // результат проверки: одно из слов выявлено без экранирования, вывод: Возможна Spam-атака
          }
        }
      }
      return false // результат проверки: ни одно из слов/символов не выявлено, вывод: Признаков Spam-атаки нет
  }
  numberCheck (value) {
    return isNaN(value)  // returns false - результат число, true - результат не число
  }
}