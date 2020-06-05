import React from 'react';
import { useWeb3 } from '@openzeppelin/network/react';
import P5Wrapper from 'react-p5-wrapper';

import './P5WithWeb3.css';
import sketch from "./sketch";

export default function P5WithWeb3(props) {
  const web3Context = useWeb3();
  const { networkId, networkName, accounts } = web3Context;

  const code = "p.normalMaterial();p.fill(100, 200, 230);p.translate(0, 0, 0);p.push();p.rotateZ(p.frameCount * 0.01);p.rotateX(p.frameCount * 0.01);p.rotateY(p.frameCount * 0.01);p.cylinder(80, 80);p.pop();";

  let codeInput = props.codeInput;

  let color = 100;

  return (
    <div className="provider">
      <h1>My MediaArt</h1>
      {accounts && accounts.length && networkId === 3 ?
  <P5Wrapper sketch={sketch} code = {codeInput ? codeInput : code}/>
        : accounts && accounts.length ?
          <h4>Ropsten Testnet이 아닌 {networkName} 이더리움에 연결되어 있어 나의 미디어 아트를 불러올 수 없습니다. Ropsten Testnet으로 네트워크 설정을 변경해 주세요</h4>
          : <h4>이더리움 네트워크에 연결되지 않아 나의 미디어 아트를 불러올 수 없습니다.</h4>

      }
    </div>
  );
}

