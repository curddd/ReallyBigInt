"use strict"

const math = require("./math")


class FiniteField{

    constructor($mod_p, $ctx){
        this.$p = $mod_p;
        this.$ctx = $ctx;
    }


    add($a, $b){
        return math.modulu(math.add($a,$b,this.$ctx), this.$p, this.$ctx);
    }

    sub($a, $b){
        return math.modulu(math.sub($a,$b,this.$ctx), this.$p, this.$ctx);
    }

    pow($a,$b){
        if($b[0]==255){
            //b ist mehrfach integer von -1 ... 
            let $res = math._one;
            let $i = $b;
            $i[0] = 0;

            while(math.a_greater($i,0,this.console)){
                $res = this.mul($res, this.div(1,$a,this.$ctx),this.$ctx)
                $i = math.sub($i,math._one);
            }
            return $res;
        }
        return math.pow_bin($a,$b,this.$ctx,this.$p);
    }
    
    inverse($n){
        return math.pow_bin($n, math.sub(this.$p,2,this.$ctx), this.$ctx, this.$p);
    }

    mul($a,$b){
        return math.modulu(math.mul($a,$b,this.$ctx), this.$p, this.$ctx);
    }
    
    div($a,$b){
        let $inv = this.inverse($b);
        console.log("$inv",$inv);
        let $mul = this.mul($a,$inv);

        console.log("$mul, res",$mul);
        return $mul;
    }

}

module.exports = FiniteField;