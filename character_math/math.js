/* really big int
copyright friedrich.stilo@gmail.com
*/

let $decimal_c = "0123456789";
let $hex_c = "0123456789abcdef";


let $MATH_DEBUG = {level:0};

function _subadd($a,$b,$ctx,$sub=false){

if($MATH_DEBUG.level == 1){
	console.debug("_subadd($a,$b,$ctx,$sub)",$a,$b,$ctx,$sub);
}




	//if substract and $a-$b, with $b bigger, which would be negative
	if($sub && !a_greater($a,$b,$ctx)){

if($MATH_DEBUG.level == 1){
	console.debug("_subadd -> $sub && !a_greater($a,$b,$ctx) => return 0");
}
		return "0";
	}
	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();
	$a = $a.split('');
	$b = $b.split('');

	let $ctx_mod = $ctx.length;
	let $len = $a.length;

	if($a.length<$b.length){
		$len = $b.length;
	}
	let $c = 0;

	let $result = [];
	let $res;
	for(let $i=0; $i<$len; $i++){
		$a_ = '0';
		if($a.length){
			$a_ = $a.pop();
		}
		$b_ = '0';
		if($b.length){
			$b_ = $b.pop();
		}
		let $a_idx = $ctx.indexOf($a_);
		let $b_idx = $ctx.indexOf($b_);
		
		if($sub){
			$res = $a_idx-$b_idx-$c;
			$c = 0;
			if($res < 0){
				//$digit_res = (-$res % $ctx_mod);
				$res = $ctx_mod+$res;
				$c = 1;
			}
		}
		else{
			$res = $a_idx+$b_idx+$c;
			$c = 0;
			if($res>=$ctx_mod){
				$c = Math.floor($res/$ctx_mod);
				$res = $res%$ctx_mod;
			}
		}
		$result.push($ctx[$res]);
	}
	if($c){
		$result.push($ctx[$c]);
	}
	let $final_res = $result.reverse().join('');

	$final_res = $final_res.replace(/^0+/, "");
	if($final_res==""){
		$final_res = "0";
	}
if($MATH_DEBUG.level == 1){
	console.debug("_subadd() RETURN ", $final_res);
}
	return $final_res;

}

function sub($a, $b, $ctx){
	if(is_negative($b)){
		return add($a,$b,$ctx);
	}
	return add($a, "-"+$b, $ctx);
}

	
function add($a, $b, $ctx){

	//both positive or both negative ... 
	if(!is_negative($a) && !is_negative($b)){
		return _subadd($a,$b,$ctx,false);
	}

	if(is_negative($a) && is_negative($b)){
		return "-"+_subadd(abs($a),abs($b),$ctx,false);
	}

	//now one is negative 
	if(abs($a)==abs($b)){
		return 0;
	}

	if(a_greater(abs($a),abs($b),$ctx)){
		return _subadd(abs($a),abs($b),$ctx,true);
	}

	//$b is greater
	return "-"+_subadd(abs($b),abs($a),$ctx,true);

}


console.log("add -4000+3 dec", add("-4000","3",$decimal_c));


/*
multiplcation tables 
*/

$mul_tables = {};

function create_mul_table($ctx){
	let $base = $ctx.length;
	let $results = {};

	for(let $i=0; $i<$base; $i++){
	for(let $j=0; $j<$base; $j++){
		let $mul = $ctx[$i];
		$mul += $ctx[$j];
		$results[$mul]= ($i*$j).toString($ctx.length);
	}
	}
	return $results;
}

let $mul_dec = create_mul_table($decimal_c);
let $mul_hex = create_mul_table($hex_c);
$mul_tables[$decimal_c] = $mul_dec;
$mul_tables[$hex_c] = $mul_hex;

function mul($a, $b, $ctx){ 

if($MATH_DEBUG.level == 1){
	console.debug("mul($a,$b,$ctx)",$a,$b,$ctx);
}
	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();


	//sign logic
	let $sign = "";
	if( (is_negative($a)&&!is_negative($b)) || (!is_negative($a)&&is_negative($b)) ){
		$sign = "-";
	}
	$a = abs($a);
	$b = abs($b);
	
	let $l = $a.split("");
	let $r = $b.split("");

	let $muti_table = $mul_tables[$ctx];
	let $multi_rows = [];

	while($r.length){

		let $score = "";
		for(let $z=1;$z<$r.length;$z++){
			$score = $score + "0";
		}

		let $rz = $r.shift();
		let $tmpL = [...$l];
		let $carry = "0";
		while($tmpL.length){
			let $lz = $tmpL.pop();
			let $to_mul = `${$lz}${$rz}`;
			let $res = add($muti_table[$to_mul],$carry,$ctx);
			let $lastchar = $res[$res.length-1];
			if($res.length == 1){
				$carry = "";
			}
			else{
				$carry = $res[0];
			}
			$score = $lastchar + $score;
		}
		$multi_rows.push($carry+$score);
	}
	let $end_score = 0;

	while($multi_rows.length){
		let $row = $multi_rows.pop();
		$end_score = add($end_score,$row,$ctx);
	}

if($MATH_DEBUG.level == 1){
	console.debug("mul() RETURN ",$end_score);
}
	return $sign+$end_score;
}



function pow($a, $b, $ctx){

if($MATH_DEBUG.level == 1){
	console.debug("pow($a,$b,$ctx)",$a,$b,$ctx);
}
	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();
	let $res = "1";
	while(a_ge($b,$ctx[1],$ctx)){
		$res = mul($res,$a,$ctx);
		$b = sub($b,$ctx[1],$ctx); 
	}

if($MATH_DEBUG.level == 1){
	console.debug("pow() RETURN ",$res);
}
	return $res;
}

//TODO WHAT IS THIS FOR???
function _gcd($a,$b,$ctx){


if($MATH_DEBUG.level == 1){
	console.debug("_gcd($a,$b,$ctx)",$a,$b,$ctx);
}
	let $gcd = "0";
	let $cnt = "1";
	let $cnts = [$cnt];
	let $cnts_n = "0";
	if($a == $b){

if($MATH_DEBUG.level == 1){
	console.debug("_gcd() $a==$b",$a,$b,"RETURN [$a,1]",[$a,1]);
}
		return [$a,"1"]
	}
	while(a_greater($a,add($gcd,$b,$ctx),$ctx)){
		while(a_greater($a,$gcd,$ctx)){
			$cnts_n = add($cnt,$cnts_n,$ctx);
			$cnts.push($cnt);
			
			$gcd = mul($cnts_n,$b,$ctx);
			$cnt = add($cnt,$cnt,$ctx);
		}
		if($cnts_n == "0"){
if($MATH_DEBUG.level == 1){
	console.debug("_gcd() $cnts_n == '0'",$cnts_n,"RETURN [0,0]",[0,0])
}
			return [0, 0];
		}

		if($gcd == $a){

if($MATH_DEBUG.level == 1){
	console.debug("_gcd() $gcd == $a", $gcd, $a, "RETURN [$gcd, $cnts_n]", [$gcd, $cnts_n]);
}
			return [$gcd, $cnts_n];
		}

		//back
		let $sub_cnt = $cnts.pop();
		$cnts_n = sub($cnts_n,$sub_cnt,$ctx);
		$gcd = mul($cnts_n,$b,$ctx);
		$cnt = "1";
		if($a == add($gcd,$b,$ctx)){
			$gcd = add($gcd,$b,$ctx);
			$cnts_n = add("1",$cnts_n,$ctx);
			break;
		}

/*
break condition
//next 1 will be same or over
*/
	}
	$gcd = dlz($gcd);
	$cnts_n = dlz($cnts_n);

if($MATH_DEBUG.level == 1){
	console.debug("_gcd() RETURN [$gcd,$cnts_n]",[$gcd,$cnts_n]);
}

	return [$gcd,$cnts_n];
}

function dlz($n){

if($MATH_DEBUG.level == 1){
	console.debug("dlz($n)",$n);
}

	$n = $n.split("");
	let $lz = true;
	let $res = []
	for(let $i=0; $i<$n.length; $i++){
		if($n[$i]!="0"){
			$lz = false;
		}
		if($lz && $n[$i]=="0"){
			continue;
		}
		$res.push($n[$i]);
	}
	if(!$res.length){
		$res.push("0");
	}

if($MATH_DEBUG.level == 1){
	console.debug("dlz() RETURN $res.join('')",$res.join(""));
}
	return $res.join("");
}

function _div($a,$b,$ctx){

if($MATH_DEBUG.level == 1){
	console.debug("_div($a,$b,$ctx)",$a,$b,$ctx);
}

	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();


	//sign logic
	let $sign = "";
	if( (is_negative($a)&&!is_negative($b)) || (!is_negative($a)&&is_negative($b)) ){
		$sign = "-";
	}


	$a = abs($a);
	$b = abs($b);
//console.log("div $a / $b ", $a, $b);
	$a = $a.replace(/^0+/, "");
	$b = $b.replace(/^0+/, "");;

	/*
	$a = linker teil, die zu teilende zahl
	$b = rechter teil. teiler ...
	$r = ergebnis das sich langsam aufbaut

	$a : $b = $r ...

	erst nimmt man soviele stellen wie $b hat von $a, das gibt $a_part und $b_part
	wenn $a_part noch kleiner ist als $b_part wird EINE stelle hinzu genommen
	dann muss geprueft werden wie oft $b_part in $a_part passt, das ist dann 0-9 die erste ziffer on $r
	$r_ziffer mal $b_part gibt das zu subtrahierende von $a_part
	*/


	/*
	speizal fall: 
		$a < $b  und sign negativ....
		$rest: $a+$b ... $res: -1
	*/
	if($sign=="-" && a_greater($b,$a,$ctx)){
		let $s_rest = sub($b,$a,$ctx);
		let $s_res = "-1";
		return [$s_res, $s_rest];
	}

//console.log("komische faelle abgedeckt los gehts...")

	let $b_len = $b.length;
	let $a_l = $a;
	let $a_r= $a;
	let $res = "";
	let $rest = $b;


	//bis der letzte rechte teil verbraucht ist ... 
	while($a_r !=""){

		$b_len = $rest.length;
		$a_l = $a.substr(0,$b_len);
		$a_r = $a.substr($b_len);


		if(a_greater($b,$a_l,$ctx)){
//console.log("need to pull additional number, $b greater than $a_l",$b,$a_l);
			$a_l= $a_l+ $a.substr($b_len,1);
			$a_r = $a.substr($b_len+1);
		}
//console.log("$a gesplitetet in r und l", $a, $a_l, $a_r);
//console.log("$a_part und $b",$a_l, $b);


		//nun... wie oft passt $b in $a_part
		$r_digit = "0";
		$b_mul = $b;

		while(a_ge($a_l, $b_mul,$ctx)){
			$b_mul = add($b_mul, $b, $ctx);
			$r_digit = add($r_digit,"1",$ctx);
//console.log("$b_mul $r_digit change",$b_mul,$r_digit);
		}
		//adjust the overshoot
		$b_mul = sub($b_mul,$b,$ctx);
//console.log("so oft passt $b in $a_l", $b, $a_l, $r_digit);

		$res = $res + $r_digit;

		//jetzt ... $b_mul minus $a_part ...
		$rest = sub($a_l,$b_mul,$ctx);
//console.log("rest ist ... und $res",$rest,$res);
		if($rest == "0"){
			$rest = "";
		}
		$a = $rest + $a_r;

//console.log("$a ist jetzt so lang...",$a.length);
	}


if($MATH_DEBUG.level == 1){
	console.debug("_div() RETURN $res $rest",$res,$rest);
}

	if($rest == ""){
		$rest = 0;
	}

	//debug
	return [$sign+$res,$rest];
}


/*
console.log("division debug, 103/33",div("103","33",$decimal_c));
console.log("division debug, 35616/318",div("35616","318",$decimal_c));
//console.log("division debug, FFFF/F3",div("FFFF","F3",$hex_c));
//console.log("division debug, FFFF/F3",div("345fffeeccadd2222222444444FFFF","Fff3f3f3f3f33",$hex_c));
console.log("division debug, 3/100",div("3","100",$decimal_c));
*/


/*
5 * 5 = 25
25 / 5 = 5

*/
function div($a,$b,$ctx){
	return _div($a,$b,$ctx)[0];
}


function modulu($a,$b,$ctx){
	return _div($a,$b,$ctx)[1];
}

//TODO SIGNS
function a_ge($a, $b, $ctx){

if($MATH_DEBUG.level == 1){
	console.debug("a_ge($a,$b,$ctx)",$a,$b,$ctx);
}

	//-a +b
	//+a -b
	//-a -b
	//+a +b

	$a = $a.toString().toLowerCase().replace(/^0+/, "");
	$b = $b.toString().toLowerCase().replace(/^0+/, "");;
	if(a_greater($a,$b,$ctx) || $a == $b){

if($MATH_DEBUG.level == 1){
	console.debug("a_ge() RETURN", 1);
}
		return 1;
	}
if($MATH_DEBUG.level == 1){
	console.debug("a_ge() RETURN", 0);
}
	return 0;
}

//TODO SIGNS
function a_greater($a,$b,$ctx){

if($MATH_DEBUG.level == 1){
	console.debug("a_greater($a,$b,$ctx)",$a,$b,$ctx);
}
	
	//-a +b
	if(is_negative($a)&&!is_negative($b)){
		return 0;
	}
	//+a -b
	if(!is_negative($a)&&is_negative($b)){
		return 1;
	}
	//-a -b
	//the reverse of the normal is true
	let $negative_numbers = false;
	if(is_negative($a)&&is_negative($b)){
		$negative_numbers = true;
	}



	//size differences
	if($a.length>$b.length){
if($MATH_DEBUG.level == 1){
	console.debug("a_greater() RETURN",1);
}
		if($negative_numbers){
			return 0;
		}
		return 1;
	}
	if($b.length>$a.length){
if($MATH_DEBUG.level == 1){
	console.debug("a_greater() RETURN",0);
}
		if($negative_numbers){
			return 1;
		}
		return 0;
	}


	$a = abs($a.toString().toLowerCase()).replace(/^0+/, "");
	$b = abs($b.toString().toLowerCase()).replace(/^0+/, "");

	$a = $a.split("");
	$b = $b.split("");

	let $i = 0;
	while($a[$i] == $b[$i] && $i<$a.length-1){
		$i++;
	}

if($MATH_DEBUG.level == 1){
	console.debug("a_greater() RETURN", $ctx.indexOf($a[$i]) > $ctx.indexOf($b[$i]));
}
	if($negative_numbers){
		return ($ctx.indexOf($a[$i]) < $ctx.indexOf($b[$i]));
	}
	return ($ctx.indexOf($a[$i]) > $ctx.indexOf($b[$i]));

}

function dec_to_hex($dec){
	let $result = '';

if($MATH_DEBUG.level == 1){
	console.debug("dec_to_hex($dec)",$dec);
}


	
	while(a_ge($dec,1,$decimal_c)){
		let $digit = parseInt(modulu($dec,16,$decimal_c));
		let $mod = modulu($dec,16,$decimal_c);
		$result = $hex_c[$digit] + $result;
		$dec = div($dec,16,$decimal_c);
//		console.log($mod,$digit,$result,$dec);
	}
if($MATH_DEBUG.level == 1){
	console.debug("dec_to_hex() RETURN",$result);
}
	return $result;
}


function is_negative($n){
	if($MATH_DEBUG.level == 1){
		//console.debug("is_negative($n)", $n);
	}
	$n = $n.toString().toLowerCase();
	if($n.indexOf("-")==0){
		return true;
	}
	return false;
}

function abs($n){
	$n = $n.toString().toLowerCase();
	if(is_negative($n)){
		return $n.substr(1);
	}
	return $n;
}



$binary_rep_lookup = {
	'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f':'1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111011111111111111111111110000101111',
	'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2d':'1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111011111111111111111111110000101101',
};
function binary_representation($n,$ctx){

	if($binary_rep_lookup[$n]){
		return $binary_rep_lookup[$n];
	}

	let $original_n = $n;
/*
    128 64  32  16  8   4   2   1
    0   0   0   0   0   0   0   0 

    koennte doppeln und schauen welches groessste bit 
    in die zahl passt

    dann abziehen und nochmal neu ... rueckwaerzt
*/
    let ones_arr = [];

    while(a_ge($n,"0",$ctx)){
console.log("new digit round!!! $n $ones_arr",$n,ones_arr);
        //find biggest fitting bit position
        let $bit_val = 1;
        let $bit_cnt = 0;

        let $bit_cnt_dec = 0;

        while(
            a_greater(div($n,$bit_val,$ctx),"0",$ctx)
        ){

            $bit_val = mul($bit_val,"2",$ctx);
            $bit_cnt = add($bit_cnt,"1",$ctx);
            $bit_cnt_dec = add($bit_cnt_dec,"1",$decimal_c);
        }


        $bit_cnt = sub($bit_cnt,"1",$ctx);
        let $to_sub = pow_bin("2",$bit_cnt,$ctx);

        $n = sub($n,$to_sub,$ctx);

        $bit_cnt_dec = sub($bit_cnt_dec,"1",$decimal_c);
        ones_arr.push($bit_cnt_dec.toString());
    }

    //assemble bit string
    let $bit_string = "";

    for(let $i=ones_arr[0];$i>=0; $i--){
        if(ones_arr.indexOf($i.toString())!=-1){
            $bit_string += "1";
        }
        else{
            $bit_string += "0";
        }
    }

	$binary_rep_lookup[$original_n] = $bit_string;

    return $bit_string;
}


function pow_bin($a,$b,$ctx,$mod=null){

    $binary_of_exp = binary_representation($b,$ctx);

    let $bin_arr = $binary_of_exp.split("");
    let $res = 1;
	/*
		wenn nicht 1
		zaehlen der squares ...
		dann absquaren wenn 1 kommt



		$square_count = 16;

		dann ... 
		
		so lange wurzeln bis 2 rauskommt 

	*/

    for(let $i=0; $i<$bin_arr.length; $i++){
        $res = mul($res,$res,$ctx);
        if($mod){
            $res = modulu($res,$mod,$ctx);
        }
        if($bin_arr[$i]=="1"){
            $res = mul($res, $a,$ctx);
        }
        if($mod){
            $res = modulu($res,$mod,$ctx);
        }
    }
/*
	let $square_count = 0;
	for(let $i=0; $i<$bin_arr.length; $i++){
		$square_count++;
		if($bin_arr[$i]==1){
			$res = pow($res,$square_count,$ctx);
			$square_count = 0;
			$res = mul($res, $a, $ctx);
		}
		if($mod){
			$res = modulu($res,$mod,$ctx);
		}
	}
*/
    return $res;
}


/*
console.log("comparisons");
console.log("F>E",a_greater("f","e",$hex_c)); 
console.log("E>F",a_greater("e","f",$hex_c));
console.log("F1>=E8",a_ge("F1","E8",$hex_c));
console.log("E8>=E8",a_ge("E8","E8",$hex_c));
console.log("E6>=E8",a_ge("E6","E8",$hex_c));

console.log("multiplication");
console.log("16 * 2", mul(16,2,$decimal_c));
console.log("dec mul 5x155",mul("5","155",$decimal_c));
console.log("hex mul 5xFF",mul("5","FF",$hex_c));

console.log("division");
console.log("dec 1234567/1234", div(1234567,1234,$decimal_c));
console.log("dec 851/4", div(851,4,$decimal_c));
console.log("dec 100/10", div(100,10,$decimal_c));
console.log("hex 100/10", div("100","10",$hex_c));
console.log("hex FF/F", div("FF","F",$hex_c));

console.log("powe");
console.log("pow 2**8",pow("2","8",$decimal_c));
console.log("pow 2**F",pow("2","F",$hex_c));


console.log("addition");
console.log("hex F0+FFF",add("F0","FFF",$hex_c));
console.log("dec 13+1924",add("13","1924",$decimal_c));

console.log("substraction");
console.log("hex FF, F", sub("FF", "F", $hex_c));
console.log("dec","100, 9", sub(100,9, $decimal_c));
console.log("hallo ?? dum oder was", modulu("387268788007510238116131603898074820358449140004929700895532859888700373926333292367809980247093731747824024201633903650600005369231542950851000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "139",$decimal_c));
console.log("hallo ?? dum oder was", modulu("387268788007510238116131603898074820358449140004929700895532859888700373926333292367809980247093731747824024201633903650600005369231542950851000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "137",$decimal_c));
*/




module.exports = {
	$decimal_c,
	$hex_c,
	sub,
	add,
	mul,
	modulu,
	div,
	pow,
	a_greater,
	a_ge,
	is_negative,
	abs,
	pow_bin,
	binary_representation,
	dec_to_hex,
	$MATH_DEBUG

}