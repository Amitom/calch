import React, {Component, useState} from "react";

function App() {
  const [totalTime, setTotalTime] = useState(new Array(7));
  const total = totalTime.reduce(
    (prevTotal, dayTime) => prevTotal + dayTime,
    0
  );
  return (
    <div className="App">
      <header>
        <h1>CalcH</h1>
      </header>
      <main className="wrapper">
        <div className="container">
          <table>
            <caption><h2>Total time : {Math.floor(total/60)}h{`${total%60 < 10 ? "0" : "" }${total%60}`}</h2></caption>
            <thead>
              <tr>
                <th>Day</th>
                <th>Times</th>
                <th>Breaks</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <Jour name="Monday" callback={(total) => {var t = [].concat(totalTime); t[0] = total; setTotalTime(t)}} />
              <Jour name="Tuesday" callback={(total) => {var t = [].concat(totalTime); t[1] = total; setTotalTime(t)}} />
              <Jour name="Wednesday" callback={(total) => {var t = [].concat(totalTime); t[2] = total; setTotalTime(t)}} />
              <Jour name="Thursday" callback={(total) => {var t = [].concat(totalTime); t[3] = total; setTotalTime(t)}} />
              <Jour name="Friday" callback={(total) => {var t = [].concat(totalTime); t[4] = total; setTotalTime(t)}} />
              <Jour name="Saturday" callback={(total) => {var t = [].concat(totalTime); t[5] = total; setTotalTime(t)}} />
              <Jour name="Sunday" callback={(total) => {var t = [].concat(totalTime); t[6] = total; setTotalTime(t)}} />
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

class Jour extends Component {

  state = {
    _from: {minute: 40, hour: 6},
    _to: {minute: 0, hour: 0},
    _breaks: [],
    _lunch: true,
  }

  calcTotal = (delta = 0) => {
    const {
      _from,
      _to,
      _breaks,
      _lunch,
    } = this.state;

   // console.log(_breaks)

    var total = +_to.hour * 60 + +_to.minute - +_from.hour * 60 - +_from.minute + _breaks.filter(b => !b.value).length * 15 + _breaks.filter(b => b.tookAfter).length * 15 + (_lunch ? -30 : 0) + delta;

    return total < 0 ? 0 : total ;
  }

  render(){

    const {
      _from,
      _to,
      _breaks,
      _lunch,
    } = this.state;

    const total = this.calcTotal();

    return (
      <tr>
        <td className="fit-content">{this.props.name}</td>
        <td className="fit-content singleline">
          <input type="time" 
            value={`${_from.hour < 10 ? "0" : ""}${_from.hour}:${_from.minute < 10 ? "0" : ""}${_from.minute}`}
            onChange={(e) => {
              const value = e.target.value.split(":");
              const data = {minute: +value[1], hour: +value[0]}
              this.setState({_from: data}, () => this.props.callback(this.calcTotal()));
            }}
          />
          {" to "}
          <input type="time" 
            value={`${_to.hour < 10 ? "0" : ""}${_to.hour}:${_to.minute < 10 ? "0" : ""}${_to.minute}`}
            onChange={(e) => {
              const value = e.target.value.split(":");
              const data = {minute: +value[1], hour: +value[0]}
              // 14 * 60 + 55 = 895
              let minutes = (+data.hour * 60 + +data.minute - 895);
              let countAvailableBreaks = 0;
              if(minutes >= 0){
                countAvailableBreaks = Math.floor(minutes / 120) + 1;
              }
              let bs = new Array(countAvailableBreaks);
              for(var i = 0, n = bs.length; i < n; i++){
                const pauseTookAfterEnd = data.hour * 60 + data.minute < (i*2 + 15) * 60 + 10;
                bs[i] = {
                  value: true,
                  tookAfter: pauseTookAfterEnd,
                  start: {
                    hour: i*2 + 14, minute: 55,
                  },
                  end: {
                    hour: i*2 + 15, minute: 10,
                  }
                }
              }
              this.setState({
                _to: data,
                _breaks: bs
              }, () => this.props.callback(this.calcTotal()));
            }}
          />
        </td>
        <td className="singleline">
          <div class="row">
            <div class="column column-20">
              <input type="checkbox" checked={_lunch} id={`lunch${this.props.name}`} onChange={(e) => {
                this.setState({_lunch: e.target.checked}, () => this.props.callback(this.calcTotal()));
              }}/>
              <label className="label-inline" htmlFor={`lunch${this.props.name}`}>Lunch (30 min)</label>
            </div>
            {_breaks.map((_break, idx) => (
              <div class="column column-20" key={idx}>
                <input type="checkbox" disabled={_to.hour * 60 + _to.minute < _break.end.hour * 60 + _break.end.minute} checked={_break.value} id={`check${idx}`} onChange={(e) => {
                  let b = [].concat(_breaks);
                  b[idx].value = e.target.checked;
                  this.setState({_breaks: b}, () => this.props.callback(this.calcTotal()));
                }}/>
                <label className="label-inline" htmlFor={`check${idx}`} title={`${_break.start.hour}h${_break.start.minute} to ${_break.end.hour}h${_break.end.minute}`}>{`Break ${idx + 1}`} (15 min)</label>
              </div>
            ))}
          </div>
        </td>
        <td className="fit-content singleline">{Math.floor(total/60)}h{`${total%60 < 10 ? "0" : "" }${total%60}`}</td>
      </tr>
    )

  }
}

export default App;
