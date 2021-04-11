(process.env.ENVIRONMENT === "development") && require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const app = express();

app.use(express.json())

const posts = [
    { username : 'kyle', title: 'Post 1'},
    { username : 'Nomi', title: 'Post 12'}
]

app.get('/posts', authenticateToken, (req, res, next)=> {
    res.json(posts.filter(post => post.username === req.user.name))
})


function authenticateToken (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        console.log("after verify: ", user.name)
        req.user = user
        next()
    })
}

app.listen(3000)