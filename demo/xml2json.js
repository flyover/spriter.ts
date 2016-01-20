System.register([], function(exports_1) {
    "use strict";
    function _toObj(xml) {
        var o = {};
        if (xml.nodeType === 1) {
            if (xml.attributes.length)
                for (var i = 0; i < xml.attributes.length; i++)
                    o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
            if (xml.firstChild) {
                var textChild = 0, cdataChild = 0, hasElementChild = false;
                for (var n = xml.firstChild; n; n = n.nextSibling) {
                    if (n.nodeType === 1)
                        hasElementChild = true;
                    else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/))
                        textChild++;
                    else if (n.nodeType === 4)
                        cdataChild++;
                }
                if (hasElementChild) {
                    if (textChild < 2 && cdataChild < 2) {
                        _removeWhite(xml);
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType === 3)
                                o["#text"] = _escape(n.nodeValue);
                            else if (n.nodeType === 4)
                                o["#cdata"] = _escape(n.nodeValue);
                            else if (o[n.nodeName]) {
                                if (Array.isArray(o[n.nodeName]))
                                    o[n.nodeName][o[n.nodeName].length] = _toObj(n);
                                else
                                    o[n.nodeName] = [o[n.nodeName], _toObj(n)];
                            }
                            else
                                o[n.nodeName] = _toObj(n);
                        }
                    }
                    else {
                        if (!xml.attributes.length)
                            o = _escape(_innerXml(xml));
                        else
                            o["#text"] = _escape(_innerXml(xml));
                    }
                }
                else if (textChild) {
                    if (!xml.attributes.length)
                        o = _escape(_innerXml(xml));
                    else
                        o["#text"] = _escape(_innerXml(xml));
                }
                else if (cdataChild) {
                    if (cdataChild > 1)
                        o = _escape(_innerXml(xml));
                    else
                        for (var n = xml.firstChild; n; n = n.nextSibling)
                            o["#cdata"] = _escape(n.nodeValue);
                }
            }
            if (!xml.attributes.length && !xml.firstChild)
                o = null;
        }
        else if (xml.nodeType === 9) {
            o = _toObj(xml.documentElement);
        }
        else
            throw new Error("unhandled node type: " + xml.nodeType);
        return o;
    }
    function _toJson(o, name, ind) {
        var json = name ? ("\"" + name + "\"") : "";
        if (Array.isArray(o)) {
            for (var i = 0, n = o.length; i < n; i++)
                o[i] = _toJson(o[i], "", ind + "\t");
            json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
        }
        else if (o === null)
            json += (name && ":") + "null";
        else if (typeof (o) === "object") {
            var arr = [];
            for (var m in o)
                arr[arr.length] = _toJson(o[m], m, ind + "\t");
            json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
        }
        else if (typeof (o) === "string")
            json += (name && ":") + "\"" + o.toString() + "\"";
        else
            json += (name && ":") + o.toString();
        return json;
    }
    function _asXml(n) {
        var s = "";
        if (n.nodeType === 1) {
            s += "<" + n.nodeName;
            for (var i = 0; i < n.attributes.length; i++)
                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
            if (n.firstChild) {
                s += ">";
                for (var c = n.firstChild; c; c = c.nextSibling)
                    s += _asXml(c);
                s += "</" + n.nodeName + ">";
            }
            else
                s += "/>";
        }
        else if (n.nodeType === 3)
            s += n.nodeValue;
        else if (n.nodeType === 4)
            s += "<![CDATA[" + n.nodeValue + "]]>";
        return s;
    }
    function _innerXml(node) {
        var s = "";
        if ("innerHTML" in node)
            s = node.innerHTML;
        else {
            for (var c = node.firstChild; c; c = c.nextSibling)
                s += _asXml(c);
        }
        return s;
    }
    function _escape(txt) {
        return txt.replace(/[\\]/g, "\\\\")
            .replace(/[\"]/g, '\\"')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r');
    }
    function _removeWhite(e) {
        e.normalize();
        for (var n = e.firstChild; n;) {
            if (n.nodeType === 3) {
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                    var nxt = n.nextSibling;
                    e.removeChild(n);
                    n = nxt;
                }
                else
                    n = n.nextSibling;
            }
            else if (n.nodeType === 1) {
                _removeWhite(n);
                n = n.nextSibling;
            }
            else
                n = n.nextSibling;
        }
        return e;
    }
    function xml2json(xml, tab) {
        if (tab === void 0) { tab = ""; }
        if (xml.nodeType === 9)
            xml = xml.documentElement;
        var json = _toJson(_toObj(_removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }
    exports_1("xml2json", xml2json);
    return {
        setters:[],
        execute: function() {
        }
    }
});
