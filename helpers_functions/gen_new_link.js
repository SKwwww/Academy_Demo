module.exports = function gen_new_link (sha1) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; //просто строка с набором букв и чисел
  var charactersLength = characters.length; //считаем длину строки
  var now = new Date() // получаем текущую дату время, например Tue Aug 10 2021 20:02:33 GMT+0300 (Eastern European Summer Time)
  var d_o_w = now.getDay() // получаем сегодня - день недели числом, например 2
  var now_time = Date.now() // получаем текущую дату время(с 1 января 1970 года по текущий момент) в милисекундах
  var num_to_hash = Math.floor((Math.floor((Math.random()/d_o_w )*(now_time/charactersLength))+((now_time+Math.floor(Math.random()*Math.random()))/1000))) // получаем случайное число
  var temp_url =  sha1(num_to_hash) //хешируем случайное число => получаем ссылку часть url
  return temp_url // возвращаем ссылку
}