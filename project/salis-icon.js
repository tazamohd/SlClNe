/* <salis-icon name="Wrench" size="16"> — lucide icon web component (lucide UMD must be loaded) */
(function(){
  function nodeToHtml(n){if(!Array.isArray(n))return"";var t=n[0],a=n[1],c=n[2];var at=Object.entries(a||{}).map(function(e){return e[0]+'="'+e[1]+'"';}).join(" ");return"<"+t+" "+at+">"+(c||[]).map(nodeToHtml).join("")+"</"+t+">";}
  function iconSvg(name,size,sw){
    size=size||16;sw=sw||2;
    var L=window.lucide;if(!L||!L.icons)return"";
    var node=L.icons[name];if(!node)return"";
    var attrs={},children;
    if(typeof node[0]==="string"&&node[0].toLowerCase()==="svg"){attrs=node[1]||{};children=node[2]||[];}
    else children=node;
    var a=Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round"},attrs,{width:size,height:size,"stroke-width":sw});
    return"<svg "+Object.entries(a).map(function(e){return e[0]+'="'+e[1]+'"';}).join(" ")+">"+children.map(nodeToHtml).join("")+"</svg>";
  }
  window.salisIconSvg=iconSvg;
  class SalisIcon extends HTMLElement{
    static get observedAttributes(){return["name","size","stroke-width"];}
    connectedCallback(){this._render();}
    attributeChangedCallback(){this._render();}
    _render(){
      if(!this.isConnected)return;
      var self=this;
      if(!window.lucide||!window.lucide.icons){setTimeout(function(){self._render();},120);return;}
      if(!this._sr)this._sr=this.attachShadow({mode:"open"});
      var name=this.getAttribute("name")||"";
      this._sr.innerHTML="<style>:host{display:inline-flex;align-items:center;justify-content:center;line-height:0;flex-shrink:0}</style>"+iconSvg(name,+(this.getAttribute("size")||16),+(this.getAttribute("stroke-width")||2));
    }
  }
  if(!customElements.get("salis-icon"))customElements.define("salis-icon",SalisIcon);
})();
