var qs = require('qs');
var cuid = require('cuid');
var pick = require('lodash').pick;
var restify = require('restify');
var authorizeTemplate = require('./templates/authorize');

function isMissingQueries(req, queries) {
  return queries.some(function(requiredQuery) {
    if (!req.query[requiredQuery]) {
      return true;
    }
  });
}

var cache = {}

function getAccessToken(clientId) {
  cache[clientId] = cache[clientId] || {}
  cache[clientId].accessTokens = cache[clientId].accessTokens || []
  if (!cache[clientId].accessTokens.length) {
    cache[clientId].accessTokens.push(createAccessToken(clientId))
  }
  return cache[clientId].accessTokens[0]
}

function getCode(clientId) {
  cache[clientId] = cache[clientId] || {}
  cache[clientId].codes = cache[clientId].codes || []
  if (!cache[clientId].codes.length) {
    cache[clientId].codes.push(createCode(clientId))
  }
  return cache[clientId].codes[0]
}

function createAccessToken(clientId) {
  return cuid()
}

function createCode(clientId) {
  return cuid()
}


var server = restify.createServer();

server.pre(restify.pre.userAgentConnection());
server.pre(restify.pre.sanitizePath());
server.use(restify.queryParser());

// User allowed app authorization
server.get('/oauth/authorize/success', function respond(req, res, next) {

  var requiredQueries = ['client_id', 'redirect_uri', 'response_type']

  if (isMissingQueries(req, requiredQueries)) {
    // TODO: error
  }

  var queryResult = {};

  if (req.query.response_type === 'token') {
    // Generate an access token
    queryResult.access_token = getAccessToken(req.query.client_id)
  } else if(req.query.response_type === 'code') {
    // Generate a 'code' (which wont work for API requests)
    queryResult.code = getCode(req.query.client_id)
  }

  console.log('[cache]', cache);

  // eg; http://your-redirect-uri#access_token=ACCESS-TOKEN
  res.redirect(302, `${req.query.redirect_uri}#${qs.stringify(queryResult)}`, next);

})

// User denied app authorization
server.get('/oauth/authorize/denied', function respond(req, res, next) {

  if (isMissingQueries(req, ['redirect_uri'])) {
    // TODO: error
  }

  res.redirect(302, `${req.query.redirect_uri}?error=access_denied&error_reason=user_denied&error_description=The+user+denied+your+request`, next);

})

// The Authorize step shown to the user
// /oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=token
server.get('/oauth/authorize/', function respond(req, res, next) {

  var requiredQueries = ['client_id', 'redirect_uri', 'response_type']

  if (isMissingQueries(req, requiredQueries)) {
    // TODO: error
  }

  var forwardQueries = qs.stringify(pick(req.query, requiredQueries))

  res.end(authorizeTemplate({
    authorizeUrl: `/oauth/authorize/success?${forwardQueries}`,
    noAuthorizeUrl: `/oauth/authorize/denied?${forwardQueries}`
  }))

  next();
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
