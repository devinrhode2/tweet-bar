# Tweet Bar - <a href="https://chrome.google.com/webstore/detail/tweet-bar/pmhffbojijocplkhhgpdfipnmpblohel">install in webstore</a>

## Tweet from the omnibar

<h6><em>Hands down, the fastest way to write a tweet.</em></h6>

<h5>
Simply open a new tab (cmd + t), type 't' and a space, write your tweet, hit enter and it posts!<br>
You don't even have to "Sign in twitter" to authorize the app, everything just works!<br>
Feel free to fork, add the feature you want, and suggest the change back to the main project with a pull request.<br>
</h5>

## Developers

The experimetal faster branch uses chrome.omnibox.onInputStarted to request twitter's authToken while you are writing the tweet, making the final post request nearly instant. But it's buggy when the call to postTweet comes from the XHR state. You'll get interupted with alerts when writing the tweet, that the tweet post failed, when you never hit enter.


Other notes: when you install from the webstore, use the extension, load up the dev version, and then disable the webstore version, functionality is disabled.