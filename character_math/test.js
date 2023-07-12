"use strict"

const secp = require("./secp256k1");

const bitcoin = new secp();

console.log("Private key 7 ... 7*G = ",bitcoin.generate_keys(7));