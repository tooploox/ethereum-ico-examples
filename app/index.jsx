import React from "react";
import { render } from "react-dom";
import Web3 from "web3";

const SimpleToken = require("../build/contracts/SimpleToken.json");
const GenericCrowdsale = require("../build/contracts/GenericCrowdsale.json");

const TOKEN = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
const CROWDSALE = "0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      symbol: null,
      rate: null,
      balance: null,
      decimals: null,
      left: null,
      amount: 1000,
    };

    this.changeAmount = this.changeAmount.bind(this);
    this.buy = this.buy.bind(this);
  }

  componentDidMount() {
    this.web3 = new Web3(Web3.givenProvider);
    this.Token = new this.web3.eth.Contract(SimpleToken.abi, TOKEN);
    this.Crowdsale = new this.web3.eth.Contract(GenericCrowdsale.abi, CROWDSALE);

    this.Token.methods.symbol().call().then((symbol) => {
      this.setState({ symbol });
    });

    this.Token.methods.decimals().call().then((decimals) => {
      this.setState({ decimals });
    });

    this.Token.methods.balanceOf(CROWDSALE).call().then((left) => {
      this.setState({ left });
    });

    this.Crowdsale.methods.rate().call().then((rate) => {
      this.setState({ rate });
    });

    this.web3.eth.getAccounts()
      .then(([account]) => this.Token.methods.balanceOf(account).call())
      .then(balance => this.setState({ balance }));
  }

  getPrice() {
    return this.state.amount / this.state.rate;
  }

  changeAmount(ev) {
    this.setState({ amount: ev.target.value });
  }

  buy(ev) {
    ev.preventDefault();
    const value = this.getPrice() * 10 ** 18;

    this.web3.eth.getAccounts()
      .then(([from]) => this.Crowdsale.methods.buyTokens(from).send({ value, from }))
      .then((x) => {
        console.log(x);
      })
  }

  render() {
    const { symbol, balance, amount, decimals, left } = this.state;

    return (
      <div className="jumbotron">
        <h1 className="display-4">Buy {symbol}, awesome ERC20 token!</h1>
        <p className="lead">See the source to learn how to setup crowdsale landing page</p>
        <hr className="my-4" />
        <p>You own: {balance / 10 ** decimals} {symbol}</p>
        <p>{left / 10 ** decimals} {symbol} is left for sale</p>
        <form onSubmit={this.buy}>
          <div className="input-group mb-3">
            <input type="number" className="form-control" placeholder={`How many ${symbol}s you need?`} onChange={this.changeAmount} value={amount} min="1" required />
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" disabled={!left}>Pay {this.getPrice()} ETH</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

render(<App />, document.querySelector("#app"));
