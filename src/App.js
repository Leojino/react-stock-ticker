import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
let WSClient;
try{
  WSClient = new WebSocket('ws://stocks.mnet.website');
}catch(e) {
  console.log(e);
}

class App extends Component {

  state = {
    loading: true,
    data: []
  }

  componentDidMount() {

    if(WSClient){
      WSClient.onopen = this.WebSocketOpen;
      WSClient.onmessage = this.WebSocketOnMessage
    }
  }

  WebSocketOpen = () => {
    setTimeout(()=> {
      this.setState( {loading: false} )
    },500);
  }

  WebSocketOnMessage = (message) => {
    const stocks =  this.createTableData(JSON.parse(message.data))
    this.setState({data: stocks});
  }

  createTableData(stocks) {
    const {data} = this.state;

    stocks.forEach( stock => {

      if( data[ stock[0] ] ){
        const prev = Object.keys(data).find( d => d === stock[0] );

        let increase = null
          
        if(prev) {
          if( data[prev].price>stock[1] ) {
            increase = true;
          }else if (data[prev].price<stock[1] ) {
            increase = false;
          }
        }

        data[ stock[0] ] = {
          ticker: stock[0],
          price: stock[1],
          text: stock[1].toFixed(2),
          increase,
          lastUpdate: new Date()
        }
      }else{
        data[ stock[0] ] = {
          ticker: stock[0],
          price: stock[1],
          text: stock[1].toFixed(2),
          increase: null,
          lastUpdate: new Date()
        }
      }
    } )

    return data;

  }
  
  render() {
    const {loading, data} = this.state;

    return (
      <div className="App">
        <header className={`App-header ${ loading ? "" : "App-header-loading-complete" } `}>
          <img src={logo} className={`App-logo ${ loading ? "": "logo-loading-complete" }`} alt="logo" />
          {loading && 
            <p>
              Loading ...
            </p>
          }
        </header>
        {
          !loading && data && 
          <StocksTable stocks={data}/>
        }
      </div>
    );
  }
}

export default App;


class StocksTable extends Component {

  getTDBG = increase => {
    if( increase === null ) return "";
    if( increase === true ) return "increase";
    if( increase === false ) return "decrease";
  }

  render () {
    const {stocks} = this.props;
    const keys = Object.keys( stocks );
    // return <div>text</div>

    return (
      <table className="pure-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Price</th>
            <th>Last Updated at</th>
          </tr>
        </thead>
        <tbody>
          {
            keys.map((d, i)=> (
              <tr key={`${i}`} >
                <td>{ stocks[d].ticker }</td>
                <td  className={["Stocks-price-cell", this.getTDBG( stocks[d].increase )].join(" ")} >{ stocks[d].text }</td>
                <td> { stocks[d].lastUpdate.getTime() } </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }
}