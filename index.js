var restify = require('restify');
var authorizeTemplate = require('./templates/authorize');

function isMissingQueries(req, queries) {
  return queryies.some(function(requiredQuery) {
    if (!req.query[requiredQuery]) {
      return true;
    }
  });
}


var server = restify.createServer();

server.pre(restify.pre.userAgentConnection());
server.use(restify.queryParser());

// User allowed app authorization
server.post('/oauth/authorize/success', function respond(req, res, next) {

  if (isMissingQueries(req, ['redirect_uri'])) {
    // TODO: error
  }

  // TODO: Generate an access token
  var accessToken = 'ABC123';

  // http://your-redirect-uri#access_token=ACCESS-TOKEN
  res.redirect(302, `${req.query['redirect_uri']}#access_token=${accessToken}`, next);

})

// User denied app authorization
server.post('/oauth/authorize/denied', function respond(req, res, next) {

  if (isMissingQueries(req, ['redirect_uri'])) {
    // TODO: error
  }

  res.redirect(302, `${req.query['redirect_uri']}?error=access_denied&error_reason=user_denied&error_description=The+user+denied+your+request`, next);

})

// The Authorize step shown to the user
// /oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=token
server.post('/oauth/authorize/', function respond(req, res, next) {

  if (isMissingQueries(req, ['client_id', 'redirect_uri', 'response_type'])) {
    // TODO: error
  }

  res.send(authorizeTemplate({
    authorizeUrl: `/oauth/authorize/success?redirect_uri=${req.query['redirect_uri']}`,
    noAuthorizeUrl: `/oauth/authorize/denied?redirect_uri=${req.query['redirect_uri']}`
  }))

  next();
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
