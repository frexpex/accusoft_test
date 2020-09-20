const port = 8080;
const validateConfig = require('./config/validateConfig');

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled Rejection: ${reason.stack}`);
});

async function main() {
  await validateConfig();
  const app = require('./app');
  app.listen(port, () => console.log(`Application running at http://localhost:${port}`));
}

main();
