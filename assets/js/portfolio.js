// Generated by Haxe 4.3.2
(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {},$_;
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
Math.__name__ = true;
var Game = $hxEnums["Game"] = { __ename__:true,__constructs__:null
	,PLACEHOLDER: {_hx_name:"PLACEHOLDER",_hx_index:0,__enum__:"Game",toString:$estr}
	,GAME_0: {_hx_name:"GAME_0",_hx_index:1,__enum__:"Game",toString:$estr}
	,GAME_1: {_hx_name:"GAME_1",_hx_index:2,__enum__:"Game",toString:$estr}
};
Game.__constructs__ = [Game.PLACEHOLDER,Game.GAME_0,Game.GAME_1];
var Portfolio = function() { };
Portfolio.__name__ = true;
Portfolio.main = function() {
	Portfolio.featuredGamesSection = window.document.getElementById("featured-games-section");
	Portfolio.game0Button = window.document.getElementById("game-0-button");
	Portfolio.game1Button = window.document.getElementById("game-1-button");
	Portfolio.game0Button.onclick = function() {
		Portfolio.switchToGame(Game.GAME_0);
	};
	Portfolio.game1Button.onclick = function() {
		Portfolio.switchToGame(Game.GAME_1);
	};
	var gamesContainer = window.document.getElementById("games-container");
	var _g = 0;
	var _g1 = window.document.querySelectorAll(".previous-button");
	while(_g < _g1.length) {
		var previousButton = _g1[_g];
		++_g;
		var p = js_Boot.__cast(previousButton , HTMLButtonElement);
		p.onclick = function() {
			gamesContainer.scrollLeft -= gamesContainer.clientWidth;
		};
	}
	var _g = 0;
	var _g1 = window.document.querySelectorAll(".next-button");
	while(_g < _g1.length) {
		var nextButton = _g1[_g];
		++_g;
		var n = js_Boot.__cast(nextButton , HTMLButtonElement);
		n.onclick = function() {
			gamesContainer.scrollLeft += gamesContainer.clientWidth;
		};
	}
};
Portfolio.switchToGame = function(game) {
	if(game == Portfolio.activeGame) {
		return;
	}
	switch(Portfolio.activeGame._hx_index) {
	case 0:
		window.document.getElementById("game-placeholder").remove();
		break;
	case 1:case 2:
		var tmp = window.document;
		var e = Portfolio.activeGame;
		tmp.getElementById($hxEnums[e.__enum__].__constructs__[e._hx_index]._hx_name.toLowerCase()).remove();
		break;
	}
	switch(game._hx_index) {
	case 0:
		break;
	case 1:
		Portfolio.addGame("game_0","https://itch.io/embed-upload/5195154?color=333333","https://mateu-s.itch.io/godot-roguelike-tutorial","Play Godot Roguelike Tutorial on itch.io");
		break;
	case 2:
		Portfolio.addGame("game_1","https://itch.io/embed-upload/5810929?color=3489e6","https://mateu-s.itch.io/diarreo-adventures","Play Diarreo Adventures on itch.io");
		break;
	}
	Portfolio.activeGame = game;
};
Portfolio.addGame = function(id,src,href,text) {
	var iframe = window.document.createElement("iframe");
	iframe.id = id;
	iframe.src = src;
	iframe.width = "100%";
	var a = window.document.createElement("a");
	a.href = href;
	a.textContent = text;
	iframe.appendChild(a);
	Portfolio.featuredGamesSection.appendChild(iframe);
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
haxe_Exception.thrown = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value.get_native();
	} else if(((value) instanceof Error)) {
		return value;
	} else {
		var e = new haxe_ValueException(value);
		return e;
	}
};
haxe_Exception.__super__ = Error;
haxe_Exception.prototype = $extend(Error.prototype,{
	get_native: function() {
		return this.__nativeException;
	}
	,__class__: haxe_Exception
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	__class__: haxe_ValueException
});
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = true;
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
	,__class__: haxe_iterators_ArrayIterator
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if(o == null) {
		return null;
	} else if(((o) instanceof Array)) {
		return Array;
	} else {
		var cl = o.__class__;
		if(cl != null) {
			return cl;
		}
		var name = js_Boot.__nativeClassName(o);
		if(name != null) {
			return js_Boot.__resolveNativeClass(name);
		}
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(o.__enum__) {
			var e = $hxEnums[o.__enum__];
			var con = e.__constructs__[o._hx_index];
			var n = con._hx_name;
			if(con.__params__) {
				s = s + "\t";
				return n + "(" + ((function($this) {
					var $r;
					var _g = [];
					{
						var _g1 = 0;
						var _g2 = con.__params__;
						while(true) {
							if(!(_g1 < _g2.length)) {
								break;
							}
							var p = _g2[_g1];
							_g1 = _g1 + 1;
							_g.push(js_Boot.__string_rec(o[p],s));
						}
					}
					$r = _g;
					return $r;
				}(this))).join(",") + ")";
			} else {
				return n;
			}
		}
		if(((o) instanceof Array)) {
			var str = "[";
			s += "\t";
			var _g = 0;
			var _g1 = o.length;
			while(_g < _g1) {
				var i = _g++;
				str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( _g ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		var k = null;
		for( k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) {
			str += ", \n";
		}
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) {
		return false;
	}
	if(cc == cl) {
		return true;
	}
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g = 0;
		var _g1 = intf.length;
		while(_g < _g1) {
			var i = _g++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) {
				return true;
			}
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) {
		return false;
	}
	switch(cl) {
	case Array:
		return ((o) instanceof Array);
	case Bool:
		return typeof(o) == "boolean";
	case Dynamic:
		return o != null;
	case Float:
		return typeof(o) == "number";
	case Int:
		if(typeof(o) == "number") {
			return ((o | 0) === o);
		} else {
			return false;
		}
		break;
	case String:
		return typeof(o) == "string";
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(js_Boot.__downcastCheck(o,cl)) {
					return true;
				}
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(((o) instanceof cl)) {
					return true;
				}
			}
		} else {
			return false;
		}
		if(cl == Class ? o.__name__ != null : false) {
			return true;
		}
		if(cl == Enum ? o.__ename__ != null : false) {
			return true;
		}
		return o.__enum__ != null ? $hxEnums[o.__enum__] == cl : false;
	}
};
js_Boot.__downcastCheck = function(o,cl) {
	if(!((o) instanceof cl)) {
		if(cl.__isInterface__) {
			return js_Boot.__interfLoop(js_Boot.getClass(o),cl);
		} else {
			return false;
		}
	} else {
		return true;
	}
};
js_Boot.__cast = function(o,t) {
	if(o == null || js_Boot.__instanceof(o,t)) {
		return o;
	} else {
		throw haxe_Exception.thrown("Cannot cast " + Std.string(o) + " to " + Std.string(t));
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
		return null;
	}
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
Object.defineProperty(String.prototype,"__class__",{ value : String, enumerable : false, writable : true});
String.__name__ = true;
Array.__name__ = true;
var Int = { };
var Dynamic = { };
var Float = Number;
var Bool = Boolean;
var Class = { };
var Enum = { };
js_Boot.__toStr = ({ }).toString;
Portfolio.activeGame = Game.PLACEHOLDER;
Portfolio.main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
