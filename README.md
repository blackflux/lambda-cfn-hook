# lambda-cfn-hook

[![Build Status](https://circleci.com/gh/blackflux/lambda-cfn-hook.png?style=shield)](https://circleci.com/gh/blackflux/lambda-cfn-hook)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/lambda-cfn-hook/master.svg)](https://coveralls.io/github/blackflux/lambda-cfn-hook?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/lambda-cfn-hook)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/lambda-cfn-hook/status.svg)](https://david-dm.org/blackflux/lambda-cfn-hook)
[![NPM](https://img.shields.io/npm/v/lambda-cfn-hook.svg)](https://www.npmjs.com/package/lambda-cfn-hook)
[![Downloads](https://img.shields.io/npm/dt/lambda-cfn-hook.svg)](https://www.npmjs.com/package/lambda-cfn-hook)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Lambda function wrapper for cfn custom resource hook

## Install

```bash
npm i --save lambda-cfn-hook
```

## Getting Started

<!-- eslint-disable import/no-unresolved, import/no-extraneous-dependencies -->
```js
const { wrap } = require('lambda-cfn-hook');

module.exports.hook = wrap((event, context) => {
  // do stuff here
}, {/* options */});

```

and attach the `hook` function to a [custom resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) as a Lambda function in CloudFormation.

## Options

// TODO: detail

## Disclaimer

Code is adapted from [here](https://docs.aws.amazon.com/en_pv/AWSCloudFormation/latest/UserGuide/template-custom-resources.html).
