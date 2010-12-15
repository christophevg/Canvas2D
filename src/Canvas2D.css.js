(function() {
var head = document.getElementsByTagName('head')[0],
style = document.createElement('style'),
rules = document.createTextNode(
  '.tabberlive .tabbertabhide { display:none; } ' +
  '.tabberlive { margin-top:1em; } ' +
  'ul.tabbernav { margin:0; padding: 3px 0; border-bottom: 1px solid #778; font: bold 12px Verdana, sans-serif; } ' +
  'ul.tabbernav li { list-style: none; margin: 0; display: inline;} ' +
  'ul.tabbernav li a {  padding: 3px 0.5em; margin-left: 3px; border: 1px solid #778; border-bottom: none; background: #DDE; text-decoration: none; } ' +
  'ul.tabbernav li a:link { color: #448; } ' +
  'ul.tabbernav li a:visited { color: #667; } ' +
  'ul.tabbernav li a:hover { color: #000; background: #AAE; border-color: #227;} ' +
  'ul.tabbernav li.tabberactive a { background-color: #fff; border-bottom: 1px solid #fff; } ' +
  'ul.tabbernav li.tabberactive a:hover { color: #000; background: white; border-bottom: 1px solid white; } ' +
  '.tabberlive .tabbertab { padding:5px; border:1px solid #aaa; border-top:0; } ' +
  '.tabberlive .tabbertab h2 { display:none; } ' +
  '.tabberlive .tabbertab h3 { display:none; }'
);

style.type = 'text/css';
if( style.styleSheet ) { 
  style.styleSheet.cssText = rules.nodeValue;
} else {
  style.appendChild(rules);
  head.appendChild(style);
}
})();
