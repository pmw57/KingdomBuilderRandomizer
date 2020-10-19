/*jslint node, es6 */
var docpage = `<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Kingdom Builder Randomizer</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <h1>Kingdom Builder Random Setup</h1>

    <div class="content">
        <p><button class="randomSetup" type="button">Make random setup</button></p>
    </div>

    <div class="footer">
        <p><cite>
                <a href="http://boardgamegeek.com/boardgame/107529">Kingdom Builder</a> by Donald X. Vaccarino. <br></cite></p>
        <p><cite>
                <a href="http://boardgamegeek.com/thread/839074/free-javascript-kingdom-builder-setup-randomizer">Original randomizer</a> by <a href="http://boardgamegeek.com/user/russ">russ</a>.
                <a href="http://gstaff.org/kingdombuilder">Updated</a> by <a href="http://gstaff.org/">Chris</a>.
                <a href="http://mcdemarco.net/blog/2014/12/10/kingdom-builder-randomizer/">Updated</a> by <a href="http://boardgamegeek.com/user/fiddly_bits">mcd</a>.
                Updated by Paul Wilkins.
            </cite></p>
        <p>Use and distribute freely. CC0. Public domain. No rights reserved. Have fun.</p>
    </div>

    <script src="src/lib/require_polyfill.js" data-main="./src/main.js" data-project-root="./"></script>
</body>

</html>`;
module.exports = docpage;
