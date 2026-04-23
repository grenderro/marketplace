// src/pages/explore.tsx - Trad3Ex Landing Page Copy
import React, { useEffect } from 'react';

export default function ExplorePage() {
  // Inject Font Awesome for icons
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Slide-in animation via IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="trad3ex-page">
      <style>{`
        :root {
            --bg-dark: #2B004F;
            --text-light: #FFFFFF;
            --primary-color: #FFFFFF;
            --accent-color: #8A2BE2;
            --card-bg: rgba(0, 0, 0, 0.4);
            --hover-bg: rgba(0, 0, 0, 0.6);
        }

        @keyframes colorShift {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
        }

        .trad3ex-page {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0;
            color: var(--text-light);
            line-height: 1.6;
            text-shadow: 0 0 5px rgba(0, 255, 144, 0.5);
            background-color: #1A0033;
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/background%20trad3ex.png');
            background-size: cover;
            background-position: center center;
            background-attachment: fixed;
            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
        }

        .trad3ex-page header p, .trad3ex-page .service-card p, .trad3ex-page footer {
            font-style: italic;
        }

        .service-card {
            opacity: 0;
            transition: transform 1.0s ease-out, opacity 1.0s ease-out, background-color 0.3s ease, border-color 0.3s ease;
            display: flex;
            align-items: center;
            padding: 30px;
            border: 2px solid var(--accent-color);
            border-radius: 8px;
            text-decoration: none;
            color: var(--text-light);
            width: 100%;
            min-height: 300px;
            box-sizing: border-box;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            background-color: transparent !important;
            backdrop-filter: none !important;
            background-size: cover;
            background-position: center center;
        }

        .social-links {
            display: flex;
            gap: 40px;
            justify-content: center;
            margin-bottom: 10px;
        }

        .social-icon {
            color: var(--text-light);
            font-size: 2em;
            text-decoration: none;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }

        .social-icon:hover {
            color: #00FF90;
            filter: drop-shadow(0 0 12px #00FF90);
            transform: scale(1.2);
        }

        .slide-from-right { transform: translateX(100px); }
        .slide-from-left { transform: translateX(-100px); }
        .service-card.active { opacity: 1; transform: translateX(0); }

        .unique-bg-card {
            border-color: var(--primary-color);
            box-shadow: 0 0 20px rgba(0, 255, 144, 0.7);
            position: relative;
            overflow: hidden;
        }

        .unique-bg-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to right,
                rgba(0, 0, 0, 0.9) 0%,
                rgba(0, 0, 0, 0.7) 35%,
                rgba(0, 0, 0, 0) 100%) !important;
            z-index: 1;
            pointer-events: none;
        }

        .trad3ex-page .service-card:focus {
            outline: 3px solid #00FFD1;
            outline-offset: 4px;
        }

        .card-icon, .card-content {
            z-index: 2;
            position: relative;
        }

        .launchpad-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/Launchpad%20trad3ex.png');
        }

        .nft-staking-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/NFT%20STAKING%20trad3ex.png');
        }

        .esdt-staking-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/ESDT%20STAKING%20trad3ex.png');
        }

        .esdt-creation-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/ESDT%20CREATION%20trad3ex.png');
        }

        .nft-creation-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/NFT%20CREATION%20trad3ex.png');
        }

        .advertising-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/ad%20campaign%20trad3ex.png');
        }

        .swap-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/SWAP%20trad3ex.png');
        }

        .legal-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/legal%20trad3ex.png');
        }

        .mystery-box-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/mystery%20box%20trad3ex.png');
        }

        .contact-us-card {
            background-image: url('https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeibwrlr6r5hhzvemdnurf7zpyvjezlw2ngrgz3lsrqljxrbdmdznue/Contact%20Us%20trad3ex.png');
        }

        .trad3ex-page header {
            text-align: center;
            padding: 40px 20px;
            background: rgba(0, 0, 0, 0.7);
            border-bottom: 2px solid var(--primary-color);
        }

        .trad3ex-page header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 5px;
            text-shadow: 0 0 10px var(--primary-color), 0 0 15px rgba(0, 255, 144, 0.8);
        }

        .logo-placeholder {
            font-size: 0.8em;
            color: var(--accent-color);
            text-shadow: none;
            margin-top: -10px;
        }

        .trad3ex-page header p {
            font-size: 1.2em;
            max-width: 800px;
            margin: 0 auto;
        }

        .trad3ex-page .services-section {
            padding: 50px 20px;
            text-align: center;
        }

        .trad3ex-page .services-section h2 {
            font-size: 2.5em;
            margin-bottom: 50px;
            color: var(--text-light);
            position: relative;
            display: inline-block;
            text-shadow: 0 0 8px rgba(0, 255, 144, 0.6);
        }

        .trad3ex-page .services-section h2::after {
            content: '';
            width: 80px;
            height: 4px;
            background-color: var(--primary-color);
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 2px;
            box-shadow: 0 0 10px var(--primary-color);
        }

        .vertical-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        @media (max-width: 900px) {
            .vertical-container {
                grid-template-columns: 1fr;
                max-width: 600px;
            }
        }

        .trad3ex-page .service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 30px rgba(0, 255, 144, 0.9), 0 5px 20px rgba(0, 0, 0, 0.8);
        }

        .card-icon {
            font-size: 3em;
            margin-right: 25px;
            color: var(--primary-color);
            flex-shrink: 0;
            text-shadow: 0 0 10px var(--primary-color);
        }

        .card-content {
            flex-grow: 1;
            text-align: left;
        }

        .trad3ex-page .service-card h3 {
            margin: 0 0 5px 0;
            font-size: 1.6em;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #00FFD1;
            font-weight: 800;
            text-shadow: 0 0 12px rgba(0, 255, 209, 0.4);
        }

        .trad3ex-page .service-card p {
            margin: 0 0 5px 0;
            font-size: 1.1em;
            color: #FFFFFF;
            font-weight: 900;
            letter-spacing: 1px;
            text-shadow: 1px 1px 4px rgba(0,0,0,1);
            font-style: normal;
        }

        @media (max-width: 768px) {
            .trad3ex-page header { padding: 30px 15px; }
            .trad3ex-page header h1 { font-size: 2.5em; letter-spacing: 4px; }
            .trad3ex-page header p { font-size: 1.1em; }
            .trad3ex-page .services-section { padding: 40px 15px; }
            .trad3ex-page .services-section h2 { font-size: 2.2em; }
            .trad3ex-page .service-card { padding: 20px; }
        }

        @media (max-width: 480px) {
            .trad3ex-page header h1 { font-size: 2em; letter-spacing: 3px; }
            .trad3ex-page header p { font-size: 1em; }
            .trad3ex-page .services-section h2 { font-size: 1.8em; margin-bottom: 30px; }
            .trad3ex-page .service-card { flex-direction: column; text-align: center; padding: 20px 15px; opacity: 0; transition: opacity 1.0s ease-out; }
            .trad3ex-page .service-card.active { opacity: 1; transform: none; }
            .card-icon { font-size: 2.5em; margin-right: 0; margin-bottom: 10px; }
            .card-content { text-align: center; }
            .trad3ex-page .service-card h3 { font-size: 1.3em; }
            .trad3ex-page .service-card p { font-size: 0.9em; }
            .slide-from-right, .slide-from-left { transform: none; transition: opacity 1.0s ease-out; }
        }

        .trad3ex-page footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid var(--accent-color);
            font-size: 0.9em;
            color: var(--text-light);
            text-shadow: 0 0 5px rgba(0, 255, 144, 0.5);
            background: rgba(0, 0, 0, 0.7);
        }

        .header-title-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
        }

        .header-logo {
            width: 60px;
            height: auto;
            margin-right: 15px;
            filter: drop-shadow(0 0 8px var(--primary-color));
        }

        .trad3ex-page header h1 {
            font-size: 3em;
            margin: 0;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 5px;
            text-shadow: 0 0 10px var(--primary-color), 0 0 15px rgba(255, 255, 255, 0.8);
        }
      `}</style>

      <header>
        <div className="header-title-container">
          <img
            src="https://sapphire-acute-anaconda-630.mypinata.cloud/ipfs/bafybeiegq45s2v4qixkghaz74ttknojllmw75wmb2wxl6bqyvyccfa2eve"
            alt="Trad3Ex Logo"
            className="header-logo"
          />
          <h1>Trad3Ex</h1>
        </div>
        <p>YOUR PREMIUM PARTNER FOR LAUNCHING, MANAGING, AND MAXIMIZING YOUR ASSETS ON THE **MULTIVERSX BLOCKCHAIN**.</p>
      </header>

      <section className="services-section">
        <h2>Our Ecosystem Services</h2>
        <div className="vertical-container" id="services-container">

          <article>
            <a
              href="https://marketplace.artcpaclub.com/launchpads/ico"
              className="service-card launchpad-card unique-bg-card slide-from-left"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>LAUNCHPAD</h3>
                <p>ELEVATE YOUR PROJECT WITH A SECURE AND EFFICIENT TOKEN LAUNCH ON MULTIVERSX.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://marketplace.artcpaclub.com/swap"
              className="service-card swap-card unique-bg-card slide-from-right"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>SWAP</h3>
                <p>SWAP YOUR TOKENS AT EASE WITH OPTIMIZED LIQUIDITY AND SPEED.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://marketplace.artcpaclub.com/staking/nft"
              className="service-card nft-staking-card unique-bg-card slide-from-left"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>NFT STAKING</h3>
                <p>EARN REWARDS BY STAKING YOUR NON-FUNGIBLE TOKENS SECURELY.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://marketplace.artcpaclub.com/staking/token"
              className="service-card esdt-staking-card unique-bg-card slide-from-right"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>ESDT STAKING</h3>
                <p>A ROBUST PLATFORM FOR STAKING YOUR ESDT TOKENS TO EARN PASSIVE YIELD.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="/create-esdt"
              className="service-card esdt-creation-card unique-bg-card slide-from-left"
            >
              <div className="card-content">
                <h3>ESDT CREATION</h3>
                <p>QUICK AND COMPLIANT CREATION OF YOUR OWN MULTIVERSX ESDT TOKEN.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="/create-nft"
              className="service-card nft-creation-card unique-bg-card slide-from-right"
            >
              <div className="card-content">
                <h3>NFT CREATION</h3>
                <p>FULL-STACK SERVICE TO GENERATE, MINT, AND DEPLOY YOUR NFT COLLECTION.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://forms.gle/66xkPZfkA4ZyfDrM6"
              className="service-card advertising-card unique-bg-card slide-from-left"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>ADVERTISING</h3>
                <p>TARGETED ADVERTISING CAMPAIGNS WITHIN THE MULTIVERSX ECOSYSTEM.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://forms.gle/66xkPZfkA4ZyfDrM6"
              className="service-card legal-card unique-bg-card slide-from-right"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>LEGAL & COMPLIANCE</h3>
                <p>EXPERT GUIDANCE TO ENSURE YOUR CRYPTO PROJECT IS FULLY COMPLIANT.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://marketplace.artcpaclub.com/mystery"
              className="service-card mystery-box-card unique-bg-card slide-from-left"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>MYSTERY BOX</h3>
                <p>FAIR AND ENGAGING SYSTEM FOR MYSTERY BOX OR LOOT BOX EVENTS.</p>
              </div>
            </a>
          </article>

          <article>
            <a
              href="https://forms.gle/bS836YWLz9czYquDA"
              className="service-card contact-us-card unique-bg-card slide-from-right"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="card-content">
                <h3>CONTACT US</h3>
                <p>LET US KNOW HOW WE CAN HELP YOU GROW ON MULTIVERSX.</p>
              </div>
            </a>
          </article>

        </div>
      </section>

      <footer>
        <div className="social-links">
          <a
            href="https://discord.gg/zPvTKrdWpB"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            aria-label="Discord"
          >
            <i className="fa-brands fa-discord" />
          </a>
          <a
            href="https://t.me/Trad3EX"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            aria-label="Telegram"
          >
            <i className="fa-brands fa-telegram" />
          </a>
          <a
            href="https://x.com/Trad3EX"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            aria-label="X (Twitter)"
          >
            <i className="fa-brands fa-x" />
          </a>
        </div>
        <div className="footer-text">
          &copy; 2025 TRAD3EX. ALL RIGHTS RESERVED. BUILT FOR THE MULTIVERSX COMMUNITY.
        </div>
      </footer>
    </div>
  );
}
