(function ($hx_exports) { "use strict";
$hx_exports.backnode = $hx_exports.backnode || {};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var backnode = {};
backnode.App = $hx_exports.backnode.App = function(element) {
	this.initCE("ce-js");
	this.initStage(element);
	this.initTools();
	this.editorInstances = new Array();
};
backnode.App.__name__ = true;
backnode.App.prototype = {
	initCE: function(id) {
		this.ce = ce.api.CloudExplorer.get(id);
	}
	,initStage: function(element) {
		var _g = this;
		this.stage = new Stage(element);
		this.wysiwyg = new Wysiwyg();
		this.stageView = new backnode.views.StageView();
		this.stageView.onSizeChange(function(size) {
			_g.stage.setSize(size.w,size.h);
		});
		this.stage.setSize(element.offsetWidth,element.offsetHeight);
	}
	,initTools: function() {
		var _g = this;
		this.tools = new backnode.views.ToolsView();
		this.tools.set_state(backnode.model.State.INIT);
		this.tools.onOpen(function(e) {
			_g.ce.pick($bind(_g,_g.onFileSelected),$bind(_g,_g.onError));
		});
		this.tools.onCancel(function(e1) {
			_g.makeFieldEditable(false);
			_g.tools.switchEdition(false);
			_g.onFileSelected(_g.fileSelected);
		});
		this.tools.onSave(function(e2) {
			_g.makeFieldEditable(false);
			_g.tools.switchEdition(false);
			var content = _g.stageWindow.document.head.innerHTML + _g.stageWindow.document.body.innerHTML;
			_g.ce.write(_g.fileSelected,content,function(b) {
				console.log("file saved!");
			},function(e3) {
				console.log("Error: " + Std.string(e3));
			});
		});
		this.tools.onStartEdition($bind(this,this.makeFieldEditable));
	}
	,makeFieldEditable: function(editable) {
		if(this.editorInstances.length == 0) this.initFieldEditable();
		var _g = 0;
		var _g1 = this.stageWindow.document.querySelectorAll("[data-bn=text]");
		while(_g < _g1.length) {
			var node = _g1[_g];
			++_g;
			var elem = node;
			if(editable == null) elem.contentEditable = "null"; else elem.contentEditable = "" + editable;
			if(editable) this.editorInstances.push(CKEDITOR.inline(elem));
		}
		if(!editable) {
			var _g2 = 0;
			var _g11 = this.editorInstances;
			while(_g2 < _g11.length) {
				var inst = _g11[_g2];
				++_g2;
				inst.destroy();
			}
			this.editorInstances = new Array();
		}
		this.stageWindow.document.body.classList.toggle("edition-on");
	}
	,initFieldEditable: function() {
		var _g = this;
		CKEDITOR.disableAutoInline = true;
		this.wysiwyg.setSelectionMode(true);
		this.wysiwyg.setOnSelect(function() {
			var selected = _g.wysiwyg.getSelected();
			selected[0].focus();
			if(selected[0].tagName.toLowerCase() == "img" && selected[0].hasAttribute("data-bn") && selected[0].getAttribute("data-bn") == "img") _g.ce.pick(function(blob) {
				var img = selected[0];
				img.src = blob.url;
			},$bind(_g,_g.onError));
		});
	}
	,onFileSelected: function(blob) {
		var _g = this;
		this.fileSelected = blob;
		this.stage.setUrl(this.fileSelected.url).then(function(doc) {
			_g.wysiwyg.setDocument(doc);
			_g.stageWindow = doc.defaultView;
			_g.wysiwyg.addTempStyle("/editor.css");
			return doc;
		});
		this.tools.set_state(backnode.model.State.FILE_SELECTED);
	}
	,onError: function(e) {
		try {
			console.log("Error: " + JSON.stringify(e));
		} catch( e1 ) {
			console.log("Error undefined");
		}
	}
};
backnode.model = {};
backnode.model.State = { __ename__ : true, __constructs__ : ["INIT","FILE_SELECTED"] };
backnode.model.State.INIT = ["INIT",0];
backnode.model.State.INIT.__enum__ = backnode.model.State;
backnode.model.State.FILE_SELECTED = ["FILE_SELECTED",1];
backnode.model.State.FILE_SELECTED.__enum__ = backnode.model.State;
backnode.views = {};
backnode.views.StageView = function() {
	this.stage = this.getStage();
	this.resolution = this.getResolution();
	this.presets = this.getPresets();
	this.setCurrentResolution();
	window.onresize = $bind(this,this.onWindowResize);
};
backnode.views.StageView.__name__ = true;
backnode.views.StageView.prototype = {
	onSizeChange: function(cbk) {
		this.cbkSizeChange = cbk;
	}
	,getStage: function() {
		var s = window.document.getElementById("stage");
		return s.getElementsByTagName("iframe")[0];
	}
	,getResolution: function() {
		var r = window.document.getElementById("resolution-current");
		r.parentElement.addEventListener("click",$bind(this,this.switchPresets),true);
		var presetButtons = r.parentElement.getElementsByTagName("li");
		var _g = 0;
		var _g1 = Reflect.fields(presetButtons);
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			var f = Reflect.field(presetButtons,b);
			if($bind(f,f.addEventListener) != null) f.addEventListener("click",$bind(this,this.clickOnPreset));
		}
		return r;
	}
	,getPresets: function() {
		var r = window.document.getElementById("resolution-presets");
		r.style.display = "none";
		return r;
	}
	,setCurrentResolution: function(w,h) {
		var width;
		if(w != null) width = w; else width = this.stage.offsetWidth;
		var height;
		if(h != null) height = h; else height = this.stage.offsetHeight;
		this.resolution.innerHTML = width + "x" + height;
		if(this.cbkSizeChange != null) this.cbkSizeChange({ w : width, h : height});
	}
	,onWindowResize: function(e) {
		this.setCurrentResolution();
	}
	,switchPresets: function(e) {
		if(this.presets.style.display == "block") this.presets.style.display = "none"; else this.presets.style.display = "block";
	}
	,clickOnPreset: function(e) {
		var preset = e.currentTarget;
		var auto = preset.innerHTML == "Full size";
		var width;
		if(auto) width = this.stage.parentElement.offsetWidth; else width = Std.parseInt(preset.getAttribute("data-width"));
		var height;
		if(auto) height = this.stage.parentElement.offsetHeight; else height = Std.parseInt(preset.getAttribute("data-height"));
		this.setCurrentResolution(width,height);
	}
};
backnode.views.ToolsView = function() {
	this.buttons = { open : null, save : null, cancel : null, edition : null, editionSwitch : null};
	this.initButtons();
};
backnode.views.ToolsView.__name__ = true;
backnode.views.ToolsView.prototype = {
	onOpen: function(cbk) {
		this.buttons.open.dom.addEventListener("click",cbk,false);
	}
	,onCancel: function(cbk) {
		this.buttons.cancel.dom.addEventListener("click",cbk,false);
	}
	,onSave: function(cbk) {
		this.buttons.save.dom.addEventListener("click",cbk,false);
	}
	,onStartEdition: function(cbk) {
		var _g = this;
		this.buttons.editionSwitch.dom.addEventListener("click",function(e) {
			cbk(_g.switchEdition());
		},false);
	}
	,switchEdition: function(forceValue) {
		if(forceValue || forceValue == false) return this.buttons.editionSwitch.dom.classList.toggle("switch-on",forceValue); else return this.buttons.editionSwitch.dom.classList.toggle("switch-on");
	}
	,set_state: function(state) {
		this.currentState = state;
		this.onStateChanged(this.currentState);
		return this.currentState;
	}
	,initButtons: function() {
		this.initButton("open");
		this.initButton("save");
		this.initButton("cancel");
		this.initButton("edition","edit-mode");
		this.initButton("editionSwitch","editor-switch");
	}
	,initButton: function(name,id) {
		var _g = this;
		var button = { dom : window.document.getElementById(id != null?id:name), hide : function() {
			var b = Reflect.getProperty(_g.buttons,name);
			b.dom.style.display = "none";
		}, show : function() {
			var b1 = Reflect.getProperty(_g.buttons,name);
			b1.dom.style.display = "block";
		}};
		this.buttons[name] = button;
	}
	,onStateChanged: function(state) {
		switch(state[1]) {
		case 0:
			this.fileSelectionMode(false);
			break;
		case 1:
			this.fileSelectionMode(true);
			break;
		}
	}
	,fileSelectionMode: function(value) {
		var _g = 0;
		var _g1 = Reflect.fields(this.buttons);
		while(_g < _g1.length) {
			var button = _g1[_g];
			++_g;
			if(value) Reflect.field(this.buttons,button).show(); else Reflect.field(this.buttons,button).hide();
		}
		this.buttons.open.show();
	}
	,__properties__: {set_state:"set_state"}
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
})(typeof window != "undefined" ? window : exports);

//# sourceMappingURL=backnode.js.map