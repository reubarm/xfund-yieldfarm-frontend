import React, { useEffect, useState } from 'react';
import './sidebar.scss';

const Sidebar: React.FunctionComponent = () => {
  const [tokenPrice, setTokenPrice] = useState('0.00')
  const [openSidebar, setOpenSidebar] = useState(false)

  useEffect(() => {
    getUnixToken();
  }, [getUnixToken])

  async function getUnixToken () {
    const resp = await fetch(`https://api3.unixverse.co/unix-token`, {
      method: 'GET',
    }).then(response => {
      return response;
    }).then(response=> {
      return response.json()
    }).catch(error=>{
      console.log(error)
    });

    setTokenPrice(resp?.token || '0.00')
  }

  return (
    <div onClick={() => setOpenSidebar(!openSidebar)} className={`sidebar-wrapper ${openSidebar ? "activeMobile": "sidebar-show"}`}>
      <img onClick={() => setOpenSidebar(!openSidebar)} className="menu-button" src="/menu-btn.svg" alt="menu" />
        <div className="sidebar-inner">
          <div className="sidebar-logo">
            <div className="upper-logo flex items-center flex-text-center">
              <a href="https://finalround.unixgaming.org/"><img width="205" src="/footer-logo.png" alt="mainLogo"/></a>
              <button className="mini-menu"/>
            </div>
            <a href="https://www.unixgaming.org/" className="min-logo">
              <figure>
                <img src="/unix-logo.png" alt="Logo"/>
                  <section>
                    <p>Current Price ($UniX)</p>
                    <h6>${tokenPrice}</h6>
                  </section>
              </figure>
            </a>
          </div>
          <div className="sidebar-navigation">
            <ul className="sidebar-menu list-none">
              <li><a href="https://finalround.unixgaming.org/"><img src="/dashboard.svg" alt="Home"/> <span>Home</span></a></li>
              <li><span className="coming-soon" /><a href="javascript:void(0)"><img src="/launchpad.svg" alt="Launchpad"/>
                <span>Launchpad</span></a></li>
              <li><a href="https://final-round.io"><img src="/staking.svg" alt="staking"/>
                <span>Tier Staking</span></a></li>
              <li><a className="active" href="/"><img src="/yield.svg" alt="yield"/>
                <span>UniX Yield</span></a></li>
              {/* <li><span className="coming-soon" /><a href="javascript:void(0)"><img src="/marketplace.svg" alt="yield"/>
                <span style={{whiteSpace: 'nowrap'}}>Market Place</span></a></li>
              <li><span className="coming-soon" /><a href="javascript:void(0)"><img src="/hub.svg" alt="yield"/>
                <span>Guild Hub</span></a></li>
              <li><span className="coming-soon" /><a href="javascript:void(0)"><img src="/nft.svg" alt="yield"/>
                <span>NFT's</span></a></li> */}
            </ul>
            <ul className="sidebar-social-network list-none">
              <li><a href="https://t.me/FinalRoundOfficial" target="_blank"><img src="/telegram.svg" alt="telegram"/>
                <span>Telegram</span></a></li>
              <li><a href="http://discord.gg/unix" target="_blank"><img src="/discard.svg" alt="discord"/>
                <span>Discord</span></a></li>
              <li><a href="https://twitter.com/GoFinalRound" target="_blank"><img src="/twitter.svg" alt="twitter"/>
                <span>Twitter</span></a></li>
              <li><a href="https://medium.com/@finalround" target="_blank"><img src="/medium.svg" alt="medium"/>
                <span>Medium</span></a></li>
            </ul>
          </div>
        </div>
    </div>
  );
};

export default Sidebar;