//initi token to empty string
window.accessToken = localStorage.getItem('accessToken');
if (accessToken === null) {
  localStorage.setItem('accessToken', '');
  accessToken = '';
}

var redirectUrl = 'https://www.facebook.com/connect/login_success.html';
var filter = {urls:['*://www.facebook.com/*', '*://thred.in/extension/*']};
chrome.webRequest.onBeforeRequest.addListener(function webRequestOnBeforeRequest(details) {
  var url = details.url;
  var tokenStart = '#access_token=';
  if (url.has(tokenStart)) {
    accessToken = url.substring(url.indexOf(tokenStart) + tokenStart.length, url.length);
    if (accessToken.has('&')) {
      accessToken = accessToken.substring(0, accessToken.indexOf('&'));
    }
    localStorage.setItem('accessToken', accessToken);
    log('access token:', accessToken);
  }
}, filter, []);


GET('https://www.facebook.com/dialog/oauth?client_id=263485153710238&redirect_uri='+redirectUrl+'&response_type=token', function GETToken(resp, xhr){
  if (resp.has('<title>Success</title>')) {
    log('success!');
    if (localStorage.getItem('installed') !== 'installed') {
      localStorage.setItem('installed', 'installed');
      chrome.tabs.create({
        'url': 'http://thred.in/extension/welcome.html'
      });
    }
  } else {
    console.log('unsuccessful. resp:', resp);
    //open url in new tab to request authorization...
    
    //on the authorize prompt, do we want the user to click 'authorize' and be done, or click 'authorize' and then have a page that says thred is setup, go try it now: <link to search> 
    
    //first option, we need to do a local extension page (which could just iframe..)
    chrome.tabs.create({
      'url': chrome.extension.getURL('authorize.html')
    });
    
    //second option
    alert('Eh yo, authorize.html will ask you to authorize, redirect to some page like thred.in/extension/done.html');
    chrome.tabs.create({
      'url': 'http://thred.in/extension/authorize.html'
    });
  }
});