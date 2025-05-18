// server.js
console.log('May Node be with you')

const express = require("express")
const app = express()

app.listen(8000, function() {
    console.log("server working on localhost: 8000")
})