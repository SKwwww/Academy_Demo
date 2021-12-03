module.exports = function sendSessionData (res,userName) {
   res.json({isSessionOn: true,name: userName})
 }