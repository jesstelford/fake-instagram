module.exports = function(state) {
  return `
<!doctype html>
<html>
  <body>
    <h1>Fake Instagram</h1>
    <p><a href="${state.authorizeUrl}">Yes, I authorize this app to access my Fake Instagram Account!</a></p>
    <p><a href="${state.noAuthorizeUrl}">No! Get me outta here!</a></p>
  </body>
</html>
`.trim()
}
