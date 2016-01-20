/*
  This work is licensed under Creative Commons GNU LGPL License.

  License: http://creativecommons.org/licenses/LGPL/2.1/
  Version: 0.9
  Author:  Stefan Goessner/2006
  Web:     http://goessner.net/
*/

function _toObj(xml: any): any {
  let o: any = {};
  if (xml.nodeType === 1) { // element node ..
    if (xml.attributes.length) // element with attributes  ..
      for (let i = 0; i < xml.attributes.length; i++)
        o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
    if (xml.firstChild) { // element has child nodes ..
      let textChild: number = 0, cdataChild: number = 0, hasElementChild: boolean = false;
      for (let n: any = xml.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 1) hasElementChild = true;
        else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
        else if (n.nodeType === 4) cdataChild++; // cdata section node
      }
      if (hasElementChild) {
        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
          _removeWhite(xml);
          for (let n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType === 3) // text node
              o["#text"] = _escape(n.nodeValue);
            else if (n.nodeType === 4) // cdata node
              o["#cdata"] = _escape(n.nodeValue);
            else if (o[n.nodeName]) { // multiple occurence of element ..
              if (Array.isArray(o[n.nodeName]))
                o[n.nodeName][o[n.nodeName].length] = _toObj(n);
              else
                o[n.nodeName] = [o[n.nodeName], _toObj(n)];
            }
            else // first occurence of element..
              o[n.nodeName] = _toObj(n);
          }
        }
        else { // mixed content
          if (!xml.attributes.length)
            o = _escape(_innerXml(xml));
          else
            o["#text"] = _escape(_innerXml(xml));
        }
       }
       else if (textChild) { // pure text
        if (!xml.attributes.length)
          o = _escape(_innerXml(xml));
        else
          o["#text"] = _escape(_innerXml(xml));
       }
       else if (cdataChild) { // cdata
        if (cdataChild > 1)
          o = _escape(_innerXml(xml));
        else
          for (let n = xml.firstChild; n; n = n.nextSibling)
            o["#cdata"] = _escape(n.nodeValue);
       }
    }
    if (!xml.attributes.length && !xml.firstChild) o = null;
  }
  else if (xml.nodeType === 9) { // document.node
    o = _toObj(xml.documentElement);
  }
  else
    throw new Error("unhandled node type: " + xml.nodeType);
  return o;
}

function _toJson(o: any, name: string, ind: string): string {
  let json: string = name ? ("\"" + name + "\"") : "";
  if (Array.isArray(o)) {
    for (let i = 0, n = o.length; i < n; i++)
      o[i] = _toJson(o[i], "", ind + "\t");
    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
  }
  else if (o === null)
    json += (name && ":") + "null";
  else if (typeof (o) === "object") {
    const arr: any[] = [];
    for (const m in o)
      arr[arr.length] = _toJson(o[m], m, ind + "\t");
    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
  }
  else if (typeof (o) === "string")
    json += (name && ":") + "\"" + o.toString() + "\"";
  else
    json += (name && ":") + o.toString();
  return json;
}

function _asXml(n: any): string {
  let s: string = "";
  if (n.nodeType === 1) {
    s += "<" + n.nodeName;
    for (let i = 0; i < n.attributes.length; i++)
      s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
    if (n.firstChild) {
      s += ">";
      for (let c = n.firstChild; c; c = c.nextSibling)
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
  let s: string = "";
  if ("innerHTML" in node)
    s = node.innerHTML;
  else {
    for (let c = node.firstChild; c; c = c.nextSibling)
      s += _asXml(c);
  }
  return s;
}

function _escape(txt: string): string {
  return txt.replace(/[\\]/g, "\\\\")
    .replace(/[\"]/g, '\\"')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r');
}

function _removeWhite(e: any): any {
  e.normalize();
  for (let n = e.firstChild; n; ) {
    if (n.nodeType === 3) { // text node
      if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
        const nxt = n.nextSibling;
        e.removeChild(n);
        n = nxt;
      }
      else
        n = n.nextSibling;
    }
    else if (n.nodeType === 1) { // element node
      _removeWhite(n);
      n = n.nextSibling;
    }
    else // any other node
      n = n.nextSibling;
  }
  return e;
}

export function xml2json(xml: any, tab: string = ""): string {
  if (xml.nodeType === 9) // document node
    xml = xml.documentElement;
  const json = _toJson(_toObj(_removeWhite(xml)), xml.nodeName, "\t");
  return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}
