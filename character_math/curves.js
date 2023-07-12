"use strict"

const math = require("./math");


const bitcoin_curve = {
    $G_x: "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798",
    $G_y: "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",
    $p: "0fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    $n: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",

}

class EllipticCurve{
    constructor($a,$b,$field){
        this.$a = $a;
        this.$b = $b;
        this.$field = $field;
    }
}

class Point{
    constructor($x,$y){
        this.$x = $x;
        this.$y = $y;
    }


    hex_pair(){
        return [math.hex(this.$x), math.hex(this.$y)];
    }

    add($point,$curve){
console.log("adding point",$point)
        let $f = $curve.$field;

        if(this.$x == $point.$x){
console.log("doubling point", this.$x, $point.$x);
            if(this.$x == 0){
console.log("we got a zero")
                return new Point(0,0);
            }

            //slope at the point
            let $s = $f.add(
                $f.mul($f.pow(this.$x,2),3),
                $curve.$a
            );
//console.log("$s so foar",$s);
            let $tmp = $f.mul(this.$y,2);
//console.log("$tmp ",$tmp, $s);
            $s = $f.div($s,$tmp)

//console.log("$s",$s)
            let $x3 = $f.pow($s,2);
            $x3 = $f.sub($x3,$f.mul(2,this.$x));

            let $y3 = $f.mul($s,$f.sub(this.$x,$x3))
            $y3 = $f.sub($y3,this.$y);
console.log("new point after double $x3, $y3", )
            return new Point($x3,$y3);
        }

        if(this.$x == 0 && this.$y == 0){
            return $point;
        }
        if($point.$x == 0 && $point.$y == 0){
            return this;
        }

        //we are on a finite field
        if($curve.$field.$p != null){

            let $a_part = $f.sub($point.$y,this.$y);
            let $b_part = $f.sub($point.$x,this.$x);
            let $s = $f.div($a_part,$b_part);

//console.log("$s point add",$s);

            let $x3 = $f.pow($s,2);
            $x3 = $f.sub($x3,this.$x);
            $x3 = $f.sub($x3,$point.$x);
//console.log("$x3 ",$x3);

            let $y3 = $f.sub(this.$x,$x3);
            $y3 = $f.mul($s,$y3);
            $y3 = $f.sub($y3,this.$y);
//console.log("$y3 3", $y3);

           return new Point($x3,$y3);
        }

        console.log("we shouldn't have come here...");

        //no finite field, no big ints, fingers crossed for this
        let $s = ($point.$y-this.$y)/($point.$x-this.$x);
        let $x3 = ($s*$s)-(this.$x)-($point.$x);
        let $y3 = $s*(this.$x-$x3)-this.$y;
        return new Point($x3,$y3);

    }

    on_curve($curve){

        //we are on a finite field
        if($curve.$field.$p != null){
            let $f = $curve.$field;
            let $left = $f.mul(this.$y,this.$y);
            let $right = $f.add(
                $f.pow(this.$x,3),
                $f.add(
                    $f.mul(this.$x,$curve.$a),
                    $curve.$b
                )
            );

            return ($left == $right);

        }


        let $left = this.$y * this.$y;
        let $right = (this.$x*this.$x*this.$x)+(this.$x*$curve.$a)+$curve.$b;
        return Math.abs($left-$right)<0.01;
    }
}


module.exports = {
    EllipticCurve,
    Point
}