import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <header>
        <img src="https://i.imgur.com/kO3UuBo.png" alt="Chessbase India Logo" />
      </header>
      <main>
        <section className="intro">
          <h1>Welcome to Broadcast Manager for Chessbase India</h1>
          <p>Enhance your chess broadcasts with cutting-edge features.</p>
        </section>

        <section className="products">
          <a href="evalbars" className="product">
            <img src={"https://i.imgur.com/qUKNK2l.jpeg"} alt="Evaluation Bars" />
            <h2>Evaluation Bars</h2>
            <p>Visualize game dynamics with multiple evaluation bars.</p>
          </a>
          <a href="ccm" className="product">
            <img src={"https://i.imgur.com/l7AoKm3.png"} alt="Chat Chess Moves" />
            <h2>Chat Chess Moves</h2>
            <p>Engage your audience with interactive chess puzzles in the chat.</p>
          </a>
          <a href="messagedisplay" className="product">
            <img src={"https://i.imgur.com/b3I48qc.png"} alt="Display Messages in Broadcast" />
            <h2>Display Messages in Broadcast</h2>
            <p>Feature live chat messages directly in your stream.</p>
          </a>
        </section>
      </main>

      <footer>
        <p>© Chessbase India - All rights reserved</p>
  
      </footer>
    </div>
  );
}

export default LandingPage;
