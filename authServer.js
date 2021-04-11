(process.env.ENVIRONMENT === "development") && require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const app = express();

app.use(express.json())

// storing locally but should be in database or in redis cache
let refresh_tokens = []

app.post('/token', (req, res, next) => {
    const refresh_token = req.body.token

    if(refresh_token === null) return res.sendStatus(401)

    if(!refresh_tokens.includes(refresh_token)) return res.sendStatus(403)

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if (err) return res.sendStatus(403)

        const access_token = generateAccessToken({ name: data.name })
        res.json({access_token: access_token})
    })
})


app.delete('/logout', (req, res, next) => {
    refresh_tokens = refresh_tokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})


app.post('/login', (req, res, next) => {

    const username = req.body.username

    const user = { name: username }
    console.log("logged in as: ", req.body)

    const access_token = generateAccessToken(user)
    const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refresh_tokens.push(refresh_token)
    res.json({access_token: access_token, refresh_token: refresh_token})
})


const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'})
}

app.listen(4000)