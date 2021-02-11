const http = require('http')

module.exports = () => {
  return http.createServer((req, res) => {
    res.write("I'm alive")
    res.end()
  }).listen(8080)
}
