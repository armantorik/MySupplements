import './App.css';
import React from 'react';
function getServerData(data) { window.__SERVER_DATA__ = data; }

export default class Test extends React.Component {
  constructor(props) {
    super(props);
  }

componentDidMount() {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = "/api/server-data.json?callback=getServerData";
  this.instance.appendChild(s);
}

  render() {
    return <div ref={el => (this.instance = el)} />;
  }
  hello(){
    this.componentDidMount();
    window.addEventListener('load', function() {
      var productJson = window__SERVER_DATA__["jsonObject"]["detail"];
      productJson.forEach(element => {
        var imgLink = element["link"];
        var pname = element["name"];
        document.getElementById("body").innerHTML += "<th>" + pname + "</th> <img width='200' height='200' src=" + imgLink + "><img>";
        });
      });
  }
}



