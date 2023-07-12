"use strict"

const cp = require("./curves");
const FiniteField = require("./finite_field");
const math = require("./math");

/*
Equation y2 = x3 + 7 (a = 0, b = 7)
Prime Field (p) = 2^256 - 2^32 - 977
'0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fL'
Base point (G) = (79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798, 483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8)
Order (n) = FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
*/

class secp256k1_bitcoin{
    constructor(){
        this.$p = "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f";
        let $field = new FiniteField(this.$p,math.$hex_c);
        this.$curve = new cp.EllipticCurve(0,7,$field);
        this.$G = new cp.Point("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8");
        this.$n = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";
    }

    //$ctx = hex / dec
    generate_keys($private_key,$ctx=math.$hex_c){


        if(math.a_greater($private_key,this.$n,$ctx)){
            console.error("key is too large sorry...");
            return;
        }

console.log("generating public key for private key ",$private_key);

/*
        let $i = 0;
        let $res = new cp.Point(math.new(0),math.new(0));
        let $tmp = this.$G;
        let $bitwise_private = math.binary($private_key);

        for($i=0; $i<$bitwise_private.length; $i++){
            if($bitwise_private[$i]=="1"){
                $res = $res.add($tmp,this.$curve);
            }
            $tmp = $tmp.add($tmp,this.$curve);
        }

        return $res;
*/

        //double and add...
        let $i = 0;
        let $res =  new cp.Point(0,0);
        let $tmp = this.$G;
        let $bitwise_private = math.binary_representation($private_key,math.$hex_c).split("").reverse();
console.log($bitwise_private);
        for($i=0;$i<$bitwise_private.length;$i++){
            if($bitwise_private[$i]=="1"){
                $res = $res.add($tmp,this.$curve);
            }
            $tmp = $tmp.add($tmp,this.$curve);
            console.log("added $i step, $res",$i, $res);
        }



        return $res;

    }


}

module.exports = secp256k1_bitcoin;