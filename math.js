/* really big int
copyright friedrich.stilo@gmail.com
*/

let $decimal_c = "0123456789";
let $hex_c = "0123456789abcdef";


function _subadd($a,$b,$ctx,$sub=false){

	if($sub && !a_greater($a,$b,$ctx)){
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
	return $final_res;

}

function sub ($a, $b, $ctx){
	return _subadd($a,$b,$ctx,true);
}

	
function add($a, $b, $ctx){
	return _subadd($a,$b,$ctx,false);
}
/*
*/



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
	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();

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
		let $carry = "";
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

	return $end_score;
}



function pow($a, $b, $ctx){
	$a = $a.toString().toLowerCase();
	$b = $b.toString().toLowerCase();
	let $res = "1";
	while(a_ge($b,$ctx[1],$ctx)){
		$res = mul($res,$a,$ctx);
		$b = sub($b,$ctx[1],$ctx); 
	}
	return $res;
}

/*
*/

function _gcd($a,$b,$ctx){


	let $gcd = "0";
	let $cnt = "1";
	let $cnts = [$cnt];
	let $cnts_n = "0";
	if($a == $b){
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
			return [0, 0];
		}

		if($gcd == $a){
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

	return [$gcd,$cnts_n];
}

function dlz($n){
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
	return $res.join("");
}

function _div($a,$b,$ctx){
	$a = $a.toString().toLowerCase().replace(/^0+/, "");
	$b = $b.toString().toLowerCase().replace(/^0+/, "");;

	let $res = "";
	let $rest = "";
	/*
	while(a_ge($a,$b,$ctx)){
		let $l_p = $a.substr(0,$b.length);
		let $r_p = $a.substr($b.length);
		
		if(a_ge($b, $l_p, $ctx)){
			$l_p = $a.substr(0,$b.length+1);
			$r_p = $a.substr($b.length+1);
		}

		$r_p = $r_p.replace(/^0+/, "");

		let $mini_res = "0";
		let $cnt = "0";
		$gcd_a = _gcd($l_p,$b,$ctx);
		$cnt = $gcd_a[1];
		for(let $i=0; $i<$r_p.length; $i++){
			$cnt += "0";
		}
		$mini_res = $gcd_a[0];

		$rest = sub($l_p, $mini_res, $ctx);
		$res = add($res,$cnt,$ctx);
console.log("div res",$res);
		if(a_greater($rest,0,$ctx)){
			$a = $rest + $r_p;
		}
		else{
			$a = $r_p;
		}
		$a = $a.replace(/^0+/,"");
	}
*/
	//init
	let $l_p = $a.substr(0,$b.length);
	let $r_p = $a.substr($b.length);
	let $pos = $b.length;
	if(a_greater($b,$l_p,$ctx)){
		$l_p = $a.substr(0,$b.length+1);
		$r_p = $a.substr($b.length+1);
		$pos = $b.length+1;
	}
	let $steps = 1+$a.length-$pos;
	while($steps){
		$gcd = _gcd($l_p,$b,$ctx);
		$res = $res + $gcd[1];
		$l_p = dlz(sub($l_p,$gcd[0],$ctx));
		$l_p = $l_p + $a.substr($pos,1);
		$a = $l_p + $a.substr($pos+1);
		$pos++;
		$steps--;
	}
	$rest = $l_p;
	return [$res, $rest];

}

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


function a_ge($a, $b, $ctx){
	$a = $a.toString().toLowerCase().replace(/^0+/, "");
	$b = $b.toString().toLowerCase().replace(/^0+/, "");;
	if(a_greater($a,$b,$ctx) || $a == $b){
		return 1;
	}
	return 0;
}

function a_greater($a,$b,$ctx){
	$a = $a.toString().toLowerCase().replace(/^0+/, "");
	$b = $b.toString().toLowerCase().replace(/^0+/, "");

	if($a.length>$b.length){
		return 1;
	}
	if($b.length>$a.length){
		return 0;
	}

	$a = $a.split("");
	$b = $b.split("");

	let $i = 0;
	while($a[$i] == $b[$i] && $i<$a.length-1){
		$i++;
	}
	return ($ctx.indexOf($a[$i]) > $ctx.indexOf($b[$i]));

}

function dec_to_hex($dec){
	let $result = '';

	while(a_greater($dec,1,$decimal_c)){
		let $digit = parseInt(modulu($dec,16,$decimal_c));
		$result = $hex_c[$digit] + $result;
		console.log($digit,$result);
		$dec = div($dec,16,$decimal_c);
	}
	return $result;
}

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
