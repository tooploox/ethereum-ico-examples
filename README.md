# ethereum-ico-examples

Examples of different models of ERC-20 token issuance and token vesting based on "points" that work like equity shares.

## Setup

Install dependencies via npm.

```
npm install
```

## Scripts

There's a set of npm scripts to help you use different tools.

```
npm run start              # build and serve frontend application
npm run build              # build truffle project
npm run test               # test truffle project
npm run coverage:sol       # check solidity test coverage
npm run lint               # lint both: Solidity and JavaScript code
npm run lint:sol           # lint Solidity code
npm run lint:js            # lint JavaScript code
```

## Style Guide

We rely heavily on OpenZepplin and adopt its solium configuration.

## Tokens

Class diagram based on contracts you can find in the [openzeppelin-solidity/contracts/token/](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token). I hope the diagram makes it easier for you to understand relationships between different contracts and interfaces.

![Tokens](./OpenZeppelinTokens.png)
