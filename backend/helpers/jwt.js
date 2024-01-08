const  { expressjwt }  = require('express-jwt')

function authJwt(){
    const secret = process.env.AUTH_SECRET;
    const api = process.env.API_URL;
    const ALGORITHMS = process.env.ALGORITHMS
    return expressjwt({
        secret,
        algorithms: [ALGORITHMS],
        isRevoked: isRevoked
    }).unless({
        path: [
            // MAKING ALL GET PRODUCTS API UNAUTHENTICATED
        {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS']},
        {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            // `${api}/users`,
            `${api}/users/register`
        ]
    })
}

// ensures non admins do not perform admin privileges 
async function isRevoked(req, token){
    if(!token.payload.isAdmin) {
       return true;
    }
}

module.exports = authJwt;