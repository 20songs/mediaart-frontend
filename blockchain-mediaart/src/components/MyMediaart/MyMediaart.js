import React from 'react';
import { useWeb3 } from '@openzeppelin/network/react';

import P5withWeb3 from '../p5s/P5WithWeb3'
import Web3ProviderConnectButton from '../web3s/Web3ProviderConnectButton';
import checkEtherConnected from '../web3s/checkEtherConnected';
import Web3 from 'web3';
import { mediarArtABI, mediaArtAddress } from '../web3s/abis/mediaartABI';

// const web3Context = useWeb3();

class MyMediaart extends React.Component {

  constructor(props) {
    super(props);
    // this.web3Context = web3Context;
    this.state = {
      value: '',
      code: null,
      accountConnected: false,
      thisAddressHasMediaart: false,
      codeFromSC: '',
      mediaartName: '',
      networkId: -1,
      nameToBeCreated: "Media art name",
      myId: -1
    }

    this.handleChange = this.handleChange.bind(this);
    this.inputCode = this.inputCode.bind(this);
    this.changeCode = this.changeCode.bind(this);
    this.changeCodeBack = this.changeCodeBack.bind(this);
    this.sendChangedCodeToSmartContract = this.sendChangedCodeToSmartContract.bind(this);

    this.modifyP5WhenError = this.modifyP5WhenError.bind(this);

    this.useWeb3Context = this.useWeb3Context.bind(this);

    this.getMediaartName = this.getMediaartName.bind(this);
    this.createMediaart = this.createMediaart.bind(this);
    this._createMediaart = this._createMediaart.bind(this);
    this.checkNetWorkId = this.checkNetWorkId.bind(this);
    
    this.nameHandler = this.nameHandler.bind(this);
    this.nameInput = this.nameInput.bind(this);
  }

  componentDidMount() {

    checkEtherConnected().then(() => {
      this.setState({ accountConnected: true })
      this.useWeb3Context()
    })
    // console.log(window.web3.givenProvider.selectedAddress);

  }

  /// Web3로 블록체인 호출하는 부분
  getMediaartName(address) {
    const contract = new window.web3.eth.Contract(mediarArtABI, mediaArtAddress);

    // const sampleAdd = "0x450a9821B6c5ae39C4E9Ce0F94881bFDC689998D";
    try {
      contract.methods.get(address).call()
        .then((result) => {

          let rs = JSON.stringify(result);
          console.log("mediarrt : " +rs )

          rs = rs.replace(/[\[\]']+/g, '');

          // rs = rs.split(',');
          console.log("rs : " + rs)
          const resultLengthZero = (rs.length === 0);
          console.log("res : " + !resultLengthZero);

          if (!resultLengthZero) {
            let rsAsArray = rs.match(/\w+|"[^"]+"/g);

            removeDoubleQuotesFromArray(rsAsArray);
            
            // console.log("12313 :" + rsAsArray[1])
            let code = rsAsArray[1];
            code = code.replace("let", "let\xa0")
            code = code.replace(/\s/g, '');
            code = code.replace(new RegExp("\\\\n", "g"), "");
            // console.log(code);

            this.setState({
              name: rsAsArray[0],
              codeFromSC: code,
              code: code,
              thisAddressHasMediaart: true
            });
          } else {
            this.setState({ thisAddressHasMediaart: false })
          }
          
        })

        contract.methods.getMyId(address).call()
        .then((result) => {
          console.log("id : " + result);
          const myId = result;
          
          this.setState({myId: myId});

          contract.methods.getreference_code(address, myId).call()
            .then((result) => {
              console.log("getReference : "+eval(result))
              let p5CodeFromParent = JSON.stringify(result);
              p5CodeFromParent = p5CodeFromParent.replace(/[\[\]']+/g, '');
              p5CodeFromParent = p5CodeFromParent.replace(/['"]+/g, '');
              // console.log("type : "  + p5CodeFromParent)

              p5CodeFromParent = p5CodeFromParent.replace(/\s/g, '');
              p5CodeFromParent = p5CodeFromParent.replace(new RegExp("\\\\n", "g"), "");
             
              const addParentCodeToMyCode = this.state.codeFromSC + p5CodeFromParent;
              this.setState({ code: addParentCodeToMyCode })
            })

          // this.setState({ codeFromSC: rs, code: rs })

        })

    } catch (e) {
      console.log("error with call() : " + e)

    }


  }

  useWeb3Context() {
    if (this.state.accountConnected) {
      const address = window.web3.givenProvider.selectedAddress;
      this.getMediaartName(address)
    }
  }

  nameHandler(event) {
    this.setState({ nameToBeCreated: event.target.value });
  }

  nameInput() {
    return (      
      <div>
        <label>Name: </label>
      <input type="text" style={{"marginBottom": "30px"}}value={this.state.nameToBeCreated} onChange={this.nameHandler}></input>
      </div>
    )
    
  }

  /// 사용자가 P5.js 코드 입력, 수정하는 부분 
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  changeCode() {
    this.setState({ code: this.state.value });
  }

  changeCodeBack() {
    const cd = this.state.codeFromSC;
    this.setState({ code: cd });
  }

  sendChangedCodeToSmartContract() {

    if (this.state.accountConnected) {
      window.web3.eth.net.getId()
        .then((id) => {
          if (id === 3) {

            const contract = new window.web3.eth.Contract(mediarArtABI, mediaArtAddress);
            const address = window.web3.givenProvider.selectedAddress;
            const myMediaartId = this.state.myId;

            let p5ToBeSent = this.state.value.trim() // replace('/\n','/');
            p5ToBeSent = p5ToBeSent.replace(/\s/g, '');
            p5ToBeSent = p5ToBeSent.replace(new RegExp("\\\\n", "g"), "");
            console.log("code to be sent : " + p5ToBeSent);
            
            contract.methods.edit(address, myMediaartId, p5ToBeSent).send({ from: address })
              .then(() => {
                this.setState({ codeFromSC: this.state.value });
                alert("수정된 미디어아트가 블록체인에 기록되었습니다")
              })
          } else { alert("Ropsten Testnet에 연결되어 있지 않습니다") }
        }
        )
    }
  }

  _createMediaart() {
    
      if (this.state.accountConnected) {
        window.web3.eth.net.getId()
          .then((id) => {
            if (id === 3) {

              const contract = new window.web3.eth.Contract(mediarArtABI, mediaArtAddress);
              const address = window.web3.givenProvider.selectedAddress;

              const randomRed = String(parseInt(Math.random()*255));
              const randomSize = String(parseInt(Math.random()*100) + 100); 
              const randomBoxSize = randomSize + "," + randomSize + "," + randomSize;
              const p5 = "p.push();p.rotateZ(p.frameCount * 0.01);p.rotateX(p.frameCount * 0.01);p.rotateY(p.frameCount * 0.01);p.fill( " + randomRed +",10,80);p.box(" + randomBoxSize + ");p.pop();"
              const name = this.state.nameToBeCreated;
              contract.methods.createMediaart(name, p5, address).send({ from: address })
            } else { alert("Ropsten Testnet에 연결되어 있지 않습니다") }
          }
          )
      } else {
        
        checkEtherConnected()
      }
  }
  /// create mediaart 
  createMediaart(address) {
    // if (this.state.accountConnected) {
    //   window.web3.eth.net.getId()
    //     .then((id) => {
    //       if (id === 3) {
    
    const createStyle = {
      "font-size": "3em",
      "padding-top": "120px",
      "padding-bottom": "172px"
    }
    const buttonStyle = {
      "height": "3em",
      "border-radius": "8px"
    }

    return (
      <div style={createStyle}>
        <h1 style={{ "text-align": "center", "margin-bottom": "30px" }} >당신의 계정과 연결된 미디어 아트가 없습니다</h1>
        {this.nameInput()}
        <button style={buttonStyle} onClick={this._createMediaart}>미디어아트 생성하기</button>
      </div>
    );
    //       }
    //     }
    //     )
    // }

  }

  modifyP5WhenError(val) {
    this.setState({ code: val })
    // console.log(val);
  }

  inputCode() {
    const inputStyle = {
      "marginTop": "40px",
    }

    const buttonStyle = {
      "paddingBottom": "50px"
    }
    const explainStyle = {
      // "float": "left",
      "margin": "auto",
      "padding": "0px",
      "width": "46%"
    }
    const aColor = {
      "color": "#00D100"
    }
    const buttonFont = {
      "fontSize": "1.6em"
    }

    // this.setState({networkId: 3})
    return (
      <div style={inputStyle}>
        <div>
          <div style={explainStyle}>
            <h4>아래 입력 창에 p5.js 코드를 작성해 나만의 미디어아트를 만들어 블록체인에 기록해 봐요!</h4>
            <h4><a target="_blank" style={aColor} href="https://p5js.org/examples/form-shape-primitives.html">p5 사용법 보기</a></h4>
            <p><strong>* 빨간 사각형 예시 ('p.'를 앞에 붙이야 합니다')</strong></p>
            <p>
              p.fill(255, 20, 20);
              p.rect(100, 100, 100);
       </p>
          </div>
          {/* <label>
                Name: */}
          <textarea rows="10" cols="100" value={this.state.value} onChange={this.handleChange}></textarea>
          {/* </label> */}
        </div>
        <div style={buttonStyle}>
          <button style={buttonFont} onClick={this.changeCode} > 코드 반영하기</button>
          <button style={buttonFont} onClick={this.changeCodeBack} > 원래 미디어아트로 되돌리기</button>
          <button style={{ "backgroundColor": "#00D100", "fontSize": "1.6em" }} onClick={this.sendChangedCodeToSmartContract} > 블록체인에 변경된 코드 기록하기</button>
        </div>
      </div>
    );
  }

  checkNetWorkId() {

    if (this.state.accountConnected) {
      window.web3.eth.net.getId()
        .then((rs) => {
          console.log("12313 : " + rs)
          if (rs != this.state.networkId) {
            this.setState({ networkId: rs })
            return rs;
          }
        })
    }

  }

  render() {

    const inputCode = this.inputCode();
    const createMediaart = this.createMediaart();
    const thisAddressHasMediaart = this.state.thisAddressHasMediaart;
    const accountConnected = this.state.accountConnected;

    if (thisAddressHasMediaart) {
      return (
        <div>
          {/* {this.checkNetWorkId()}  */}
          <P5withWeb3 codeInput={this.state.code} name={this.state.name} />
          {inputCode}
        </div>
      );
    } else if (accountConnected) {
      return (
        <div>
          {/* {this.checkNetWorkId()} */}
          {createMediaart}
          <P5withWeb3 codeInput={this.state.code} name={this.state.name} />
        </div>
      );
    } 
    else {
      return ("")
    }
    // else {
    //   <P5withWeb3 codeInput={this.state.code} name={this.state.name}/>
    // }
  }
}

export default MyMediaart;

function removeDoubleQuotesFromArray(array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = array[i].replace(/"/g, "");
  }
}