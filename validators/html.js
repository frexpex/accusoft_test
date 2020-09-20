const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const xPathHtmlValidators = {
  '//*[starts-with(name(@*),"on")]|//script': 'JavaScript execution: Document contains script tags or inline javascript.',
  '//iframe': 'Links to remote web content: Document contains iframes with remote web content.',
  '//*[starts-with(@*,\'file://\')]': 'Links to local files: Document contains links to local files.',
};

module.exports = function(fileBuffer) {
  // Error handlers below does not crash an app.
  const document = new dom({
    errorHandler: {
      error: function(e) {
        console.log(e);
      },
      fatalError: function(e) {
        console.log(e);
      },
    },
  }).parseFromString(fileBuffer.toString('utf8'));

  return Object.keys(xPathHtmlValidators).reduce((errors, selector) =>
      xpath.evaluate(
        selector,
        document,
        null,
        0, //XPathResult.ANY_TYPE
        null
      ).nodes.length ? errors + xPathHtmlValidators[selector] : errors, '');
};
