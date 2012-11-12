/**
 * By Devin Rhode (devinrhode2@gmail.com)
 * General use functions for Chrome extensions!
 */
 
/*jslint nomen: true, vars: true, white: true, browser: true, devel: true */

/**
 * Define _.has method if it isn't already defined
 * Example: _.has(MainHostObject, property) === true/false
 */
if (typeof _ === 'undefined') {
  var _ = {
    has: function has(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    }
  };
}

//local globals: These are all the functions defined from this library:
var getClass, //document.getElementsByClassName
    getId, //document.getElementById
    getTag, //document.getElementsByTagName
    GET,  //GET  ajax request wrapper: GET (url, function(response){ }) 
    POST, //POST ajax request wrapper: POST(url, function(response){ }, args); 
    fail, //alerts message and throws that error: fail('bad thing happened') 
    trackEvent, //generic analytics event wrapper, currently coded to work with KISSmetrics
    storageDefault, //default one or many local storage keys
    createElement, //createElement('div', {innerHTML: 'hi'}, {'data-attr':'bar'})
    runInPage, //for extensions, run some javascript in the context of the page
    nodeReady; //run a callback when a DOM node is ready and available
(function extensionInclude() {
'use strict';
  
  //2 prototypes:
  /**
   * String.contains
   * returns boolean
   * Example: 'foo'.contains('o') === true
   */
  if (!String.prototype.contains) {
    String.prototype.contains = function contains(string) {
      return this.indexOf(string) > -1;
    };
  }
  
  /**
   * Array.forEach
   * forEach item in array, run a function
   * [0, 2].forEach(function(item, index, array){ });
   * 100% true to the ECMA-262, 5th edition
   * from: https://developer.mozilla.org/docs/JavaScript/Reference/Global_Objects/Array/forEach
   */
  if ( !Array.prototype.forEach ) {
    Array.prototype.forEach = function forEach( callback, thisArg ) {
   
      var T, k;
   
      if ( this == null ) {
        throw new TypeError( "this is null or not defined" );
      }
   
      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(this);
   
      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0; // Hack to convert O.length to a UInt32
   
      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if ( {}.toString.call(callback) !== "[object Function]" ) {
        throw new TypeError( callback + " is not a function" );
      }
   
      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if ( thisArg ) {
        T = thisArg;
      }
   
      // 6. Let k be 0
      k = 0;
   
      // 7. Repeat, while k < len
      while( k < len ) {
   
        var kValue;
   
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if ( _.has(O, k) ) {
   
          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[ k ];
   
          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, k, and O.
          callback.call( T, kValue, k, O );
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };
  }
  
  getClass = function getClass(elements) {
    return document.getElementsByClassName(elements);
  };
  getId = function getId(elements) {
    return document.getElementById(elements);
  };
  getTag = function getTag(elements) {
    return document.getElementsByTagName(elements);
  };
  HTMLElement.prototype.getClass = HTMLElement.prototype.getElementsByClassName;
  HTMLElement.prototype.getId = HTMLElement.prototype.getElementById;
  HTMLElement.prototype.getTag = HTMLElement.prototype.getElementsByTagName;
  
  var ajaxSend = function ajaxSend(url, callback, method, args) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onreadystatechange = function XHROnReadyStateChange() {
      if(xhr.readyState === 4) {
        callback(xhr.responseText, xhr);
      }
    };
    if(method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    xhr.send(args);
  };
  
  /**
   * POST
   * Basic POST ajax request
   * POST(url, function(responseString){}, 'ar1=2&arg2=3');
   */
  POST = function POST(url, callback,         args) {
              ajaxSend(url, callback, 'POST', args);
  };
  
  /**
   * POST
   * Basic POST ajax request
   * POST(url, function(responseString){}, 'ar1=2&arg2=3');
   */
  GET = function GET(url, callback) {
            ajaxSend(url, callback, 'GET');
  };
  
  /**
   * fail
   * program cannot continue. Alert a message, and kill it.
   * fail('oh shit');
   */
  fail = function fail(message) {
    alert(message);
    throw new Error(message);
  };
  
  /**
   * trackEvent
   * Generic analytics wrapper, currently coded against KISSmetrics
   * trackEvent('a user did this thing');
   */
  trackEvent = function trackEvent() {
    if (typeof _kmq === 'undefined') {
      window._kmq = [];
    }
    var argsArray = [].slice.call(arguments);
    if (argsArray.length === 1) {
      _kmq.push(['record', argsArray[0].replace(/\s/gi, '_')]);
    } else {
      _kmq.push(argsArray);
    }
  };
  
  /**
   * storageDefault
   * defaults localStorage properties
   * storageDefault('key', 'value');
   * storageDefault({
   *   key: 'value',
   *   key2: 'value2'
   * });
   */
  storageDefault = function storageDefault(arg1, arg2) {
    if (typeof arg1 === 'string') {
      if (localStorage.getItem(arg1) === null) {
        localStorage.setItem(arg1, arg2);
      }
    } else if (typeof arg1 === 'object') {
      for (var key in arg1) {
        if (localStorage.getItem(key) === null) {
          localStorage.setItem(arg1, arg1[key]);
        }
      }
    } else {
      fail('storageDefault expects an object or 2 string arguments');
    }
  };
  
  
  /**
   * createElement
   * -coolest method ever!
   * createElement('script', {innerHTML: 'foo'}, {data-attribute: 'bar'});
   */
  createElement = function createElement(element, props, attributes) {
    element = document.createElement(element);
    
    //this each is very similar to underscore's each
    var each = function each(hash, callback) {
      if (hash !== null) { //specifically, this check is added
        for (var item in hash) { //and only real objects are considered
          if (_.has(hash, item)) {
            callback(hash, item);
          }
        }
      }
    };
    each(props, function forEachProps(hash, key){
      element[item] = hash[key];
    });
    each(attributes, function forEachAttrs(hash, key){
      element.setAttribute(key, hash[key]);
    });
    return element;
  };
  
  /**
   * guardedParse - protected JSON.parse
   * assumes JSON.parse is defined
   */
  JSON.guardedParse = function guardedParse(string) {
    var returnValue = {}; //return was working weird resulting in this hack
    try {
      if (string.indexOf('{') === 0 && string.charAt(string.length - 1) === '}') {
        returnValue = JSON.parse(string);
      } else {
        console && console.log && console.log('first and last characters are not { and }. returning false');
        returnValue = false;
      }
    } catch(e) {
      alert('BAD JSON: ' + string);
      console.error('CAUGHT ERROR! ->', e);
      returnValue = false;
    }
    return returnValue;
  };
  
  
  
  /** VERY extension specific: **/
  
  /**
   * runInPage
   * run a peice of javascript in the context of the page's DOM, not an isolated world
   * runInPage(function(){ console.log(FB.user); });
   */
  runInPage = function runInPage() {
    var script = createElement('script', {innerHTML: ''});
    for (var task in arguments) {
      if (typeof arguments[task] === 'string') {
        script.innerHTML += arguments[task];
      } else if (typeof arguments[task] === 'function') {
        script.innerHTML += '(' + arguments[task] + '())';
      }
    }
    try {
      document.documentElement.appendChild(script);
      //could do: script.removeNode(true);
    } catch (e) {
      console.error('CAUGHT ERROR: ', e, 'on:', script.innerHTML);
    }
  };
  
  /**
   * node-ready 
   * See https://github.com/devinrhode2/node-ready
   * Send questions/problems/critiques on code to: DevinRhode2@gmail.com (put "skywalker.js" in the title)
   */
  nodeReady = function nodeReady(call, readyCallback, timeout) {
    var box = typeof call; //box is our one and only var!
    if (box === 'string') {
      try {
        //breakup each dot, checking if (item) then going item.next, which recursively becomes item
        //or lean on try/catch more to simply re-try all da time.
        box = eval(call); //strict mode ('use strict') restricts eval in some fashion...
      } catch (e) {
        if (e instanceof EvalError) {
          console.error('EvalError on call:'+call+' :( try passing in a function'+
          ' like: \nnodeReady(function(){return '+call+';}, callback);', e);
        } else {
          console.error('non-EvalError when executing call:'+call+' :(', e);        
        }
      }
    } else if (box === 'function') {
      box = call();
    } else {
      box = 'At this time, nodeReady only accepts a string javascript call or '+
            'function for the first argument, and the callback for the second argument.';
      alert(box);
      throw box;
    }
    //box is either eval(call) or call()
    if (box) {
      readyCallback(box);
    } else {
      if (typeof timeout === 'undefined') {
        timeout = 40;
      }
      
      setTimeout(function nodeReadyMainTimeoutCallback(){
        nodeReady(call, readyCallback);
      }, timeout);
    }
  };

}());