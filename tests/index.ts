// @ts-ignore
const testsContext = require.context("./scripts", true, /\.spec$/);
testsContext.keys().forEach(testsContext);
