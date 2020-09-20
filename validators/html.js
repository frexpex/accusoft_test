const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const xPathHtmlValidators = {
  '//*[starts-with(name(@*),"on")]|//script': 'JavaScript execution: Document contains script tags or inline javascript.',
  '//iframe': 'Links to remote web content: Document contains iframes with remote web content.',
  '//*[starts-with(@*,\'file://\')]': 'Links to local files: Document contains links to local files.',
};

module.exports = function(fileBuffer) {
  let xmlError = '';

  const document = new dom({
    errorHandler: {
      error: function(e) {
        console.log(e);
        xmlError += e.toString();
      },
      fatalError: function(e) {
        console.log(e);
        xmlError += e.toString();
      },
    },
  }).parseFromString(fileBuffer.toString('utf8'));

  const result = Object.keys(xPathHtmlValidators).reduce((errors, selector) =>
      xpath.evaluate(
        selector,
        document,
        null,
        0, //XPathResult.ANY_TYPE
        null
      ).nodes.length ? errors + xPathHtmlValidators[selector] : errors, '');

  return xmlError || result;
};
