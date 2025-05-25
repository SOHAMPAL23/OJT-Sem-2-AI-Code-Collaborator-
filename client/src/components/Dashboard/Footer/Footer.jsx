import React from 'react';

const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Code Crux</h3>
          <p>Code Crux is a collaborative coding platform designed to make programming accessible and enjoyable. We provide real-time collaboration tools, helping developers work together seamlessly from anywhere in the world.</p>
        </div>

        <div className="footer-section">
          <h3>Contact & Support</h3>
          <ul>
            <li><i className="far fa-envelope"></i> support@codecrux.com</li>
            <li><i className="far fa-clock"></i> 24/7 Technical Support</li>
            <li><i className="far fa-comment"></i> Live Chat Available</li>
            <li><i className="far fa-question-circle"></i> FAQ & Help Center</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://github.com/SOHAMPAL23/OJT-Sem-2-AI-Code-Collaborator-" className="social-link">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link"><i className="fab fa-discord"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Code Crux. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 