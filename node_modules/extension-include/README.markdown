Extension-include.js
=================

Some general motha fuckin functions for extension development, TOTALLY undocumented because it's for muah until you message me!

Methods
---------------

* **getId, getClass, and getTag**

  simple wrappers on `getElementbyId, getElementsByClassName, and getElementsByTagName`

*  **GET, POST**

    `GET('url', function(responseText, fullXhr){ });`

    `POST('url', function(responseText, fullXhr){ }, 'param1=foo');`


* **log, warn, error**

  Simple wrappers on console.log, console.warn, console.error

* **fail**

  Alerts and throws an error message: **`fail('some shit happened!');`**

* **trackEvent**

  Simple wrapper on analytics tracking, adjust to your own analytics system. Right now it's opinionated to KissMetrics

* **String.contains**

  **_Coming in EcmaScript 6!!!_**
  
  `var string = 'https://github.com';`

  `string.contains('https') === true`

* **storageDefault**, Default localStorage items:

  `storageDefault('thing', 'bar');`

  This only writes the value to localStorage if the key is currently _**not**_ defined.

* **createElement**

  Lightly enhanced wrapper on `document.createElement`, simply accepts additional arguments for more easily setting properties, and attributes:

  <code>
var div = createElement('div', {

          innerHTML: 'foo', 
          id: 'bar'
      }, {

          'explicitly-an-attribute': 'baz'
      });
</code>

* **runInPage**
  
  _This is only relevant for chrome extensions, feel free to strip it out._
  
  This method simply runs some javascript functions or strings of code _in the context of the page's dom, outside of Chrome's isolated world_

  `runInPage('//these comments screw things up because... '+
    'evenThisFunctionCallIsCommentedOut();');`

    `runInPage(function(){
      /*this is better*/
    });`

#And last but not least: [<h1>`nodeReady`</h1>](https://github.com/devinrhode2/node-ready)

<h2>It's too awesome to document here, go learn about it at the above link.

Install
---------------

    npm install extension-include

Creator
---------------

Is Devin Rhode. He's OCD about stuff, and started his career in Silicon Valley at age 19, follow him on twitter here: http://Twitter.com/DevinRhode2 and subscribe to his public posts on facebook at: http://Facebook.com/Devin.Rhode404

Throughout most of the internet, he is DevinRhode2 (here, StackOverflow, gmail, .. EVERYWHERE)


License
---------------

(The MIT License)

Copyright (c) 2012 Devin Rhode <DevinRhode2@Gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.