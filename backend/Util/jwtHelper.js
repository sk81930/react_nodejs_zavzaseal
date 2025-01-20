var jwt = require('jsonwebtoken')
const appConfig = require('../config/jwt.json');
//const axios = require('axios');

// const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAocfbn5MTPs8Xa+E08V9U
// ksrysRCn5Z9TBCxEWRqGLMJ1NWOpGfPmfOa86Zq2NJSLSepko2Sw5TmhTXWyaCay
// 6D8f8LVHOq5b25zz/P+KNqkNR/B9izZZ3QcR7Kp3s2fwnW4YIBOFrTZ/jSnJGS7S
// KgKhXvxZxaQNrJsi5W0BoFKXOeuyxZcLa+6btpznuIhuQPVPHXmAsM7HFiYVl+nc
// zh07AYhbtPmU3s3HSRqV32WNY+QZnT/XWx+HLecHhJzrsyv0h4pKvoP9VwgR1fDY
// aDoLaOTBQjL/L7oJWzIIJm/h2yGZwnVJCy0r10SEy/CbfAct39pVRRrcDKEtfwK/
// jwIDAQAB
// -----END PUBLIC KEY-----`;

const certToPEM = (cert) => {
    // generating key from string value.
    let pem = cert.match( /.{1,64}/g ).join( '\n' );
    pem = `-----BEGIN CERTIFICATE-----\n${ cert }\n-----END CERTIFICATE-----\n`;

    return pem;
}

const getToken = async (payload) => {
    return jwt.sign(payload, appConfig.authKey, { expiresIn: appConfig.sessionExpiry });
}

// const getPublicKey = async (token) => {
//     let PUBLIC_KEY = null; let values = [];

//     if(token) {
//         // decode the token passed for the values.
//         const decodedToken = jwt.decode( token, { complete: true } );
//         const { header } = decodedToken;

//         if(header && header.alg == 'RS256') {
//             // trigger api to get public key.
//             const response = await axios.get(process.env.JWT_KEY_SEARCH_URL, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept-Language': 'en',
//                 }
//             }).catch(function (error) { return null; });

//             // check if response has values.
//             if(response && response.data) {
//                 let keys = response.data.keys;
//                 if(keys && keys.length > 0) {
//                     // filtering the keys with RSA type.
//                     keys.filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e))
//                     ).map(key => {
//                         let public_value = certToPEM(key.x5c[0]);
//                         values.push({ kid: key.kid, nbf: key.nbf, publicKey: public_value });
//                         if(header.kid == key.kid) {
//                             PUBLIC_KEY = public_value;
//                         }
//                     });
//                 }
//             }
//         }
//     }

//     return PUBLIC_KEY;
// }

const isValid = async (token) => {
    // get key from token value.
    try {

        const decoded = jwt.verify(token, appConfig.authKey);
        return decoded;
    } catch (error) {
       return null;
    }

    // let PUBLIC_KEY = await getPublicKey(token);

    // if(PUBLIC_KEY) {
    //     try {
    //         return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }, function(err, decoded) {
    //             // if(err && err.name === 'TokenExpiredError') {
    //             //     return 'expired';
    //             //     const payload = jwt.verify(token, PUBLIC_KEY, { ignoreExpiration: true });
    //             //     let userid = payload.userid;

    //             //     return jwt.sign({ userid: userid }, PUBLIC_KEY, { expiresIn: '12h' })
    //             // }
                
    //             return decoded
    //         });
    //     } catch (ex) {
    //         return null;
    //     }
    // }

    return null;
}

const decodeToken = (token) => {
    if (token) {
        const decodedInfo = jwt.decode(token, { complete: true });
        return decodedInfo.payload || {};
    }
}
const destroy = (token) => {
    if (token) {
       const destroy = jwt.destroy(token);
        return destroy;
    }
}


module.exports = {
    getToken,
    isValid,
    decodeToken,
    destroy
}