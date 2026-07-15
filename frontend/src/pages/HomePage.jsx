import React from 'react';
import Navbar from '../components/common/Navbar';
import "./HomePage.css";
import heroImg from "../assets/hero-img.png";
import map from "../assets/map-placeholder.png";
import { FileText, MoveRight, FileSearchCorner, Users, HousePlus, BadgeCheck, Download, CircleCheckBig, Shield, Zap, Hourglass, Eye, CloudCheck, Timer, Megaphone, MapPin, Phone, Mail } from 'lucide-react';

const Homepage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <Navbar />

        <div className="hero-content">
          <div className="hero-text">
            <h1>Digital Grama Niladhari <br></br> Administration System</h1>
            <p>Access government services securely through your verified <br></br> account. Efficient, transparent and accessible administration <br></br> at your fingertips.</p>
            <div className="hero-buttons">
              <a href="/login" className="btn-primary">Login</a>
              <a href="/register" className="btn-secondary">Create Account</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-glow"></div>
            <div className="hero-illustration">
              <img src={heroImg} alt="Digital Government Portal - Sri Lanka" />
            </div>
          </div>
        </div>
        <div className="hero-gradient-overlay"></div>
      </section>
    
      <section className="services-section">
        <div className="page-container">
          <div className="section-title">
            <h2>Our Digital Services</h2>
            <p>Streamlining administrative tasks for every citizen.</p>
          </div>

          <div className="services-grid">
            <div className="service-card large">
              <div className="card-icon-large">
                <div className="card-icon-large-icon"><FileText /></div>
                <div className="card-icon-large-text">
                  <h3>Certificate Requests</h3>
                  <p>Apply for Residence, Character, and Income certificates online without visiting the <br></br> office. Integrated digital signatures ensure authenticity.</p>
                  <div className="start-app">
                    <a href="#" className="card-link">Start Application</a>
                    <div className="card-link-icon"><MoveRight /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="service-card">
              <div className="card-icon"><FileSearchCorner /></div>
              <h3>Application Tracking</h3>
              <p>Monitor your request status in real-time with automatic updates.</p>
            </div>
            <div className="service-card">
              <div className="card-icon"><Users /></div>
              <h3>Family Records</h3>
              <p>Manage and update your family information securely in the system.</p>
            </div>
            <div className="service-card">
              <div className="card-icon"><HousePlus /></div>
              <h3>Property Info</h3>
              <p>Access and verify land and property details linked to your profile.</p>
            </div>
            <div className="service-card">
              <div className="card-icon"><BadgeCheck /></div>
              <h3>Verification</h3>
              <p>Securely verify government-issued documents using QR codes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="page-container">
          <div className="section-title">
            <h2>How It Works</h2>
          </div>
          <div className="steps-container">
            <div className="step-line"></div>
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Register using your National ID and mobile number.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Verify Identity</h3>
              <p>Secure e-KYC process to confirm your details.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Request Service</h3>
              <p>Select and apply for the desired service online.</p>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3>Recieve Updates</h3>
              <p>Get notified when your request is processed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="eligibility-section">
        <div className="page-container">
          <div className="eligibility-header">
            <div className="section-title-left">
              <h2>Eligibility & Requirements</h2>
              <p>Key information for your applications.</p>
            </div>
            <a href="#" className="btn-download"><Download />Download Guidelines</a>
          </div>

          <div className="requirements-grid">
            <div className="req-card">
              <span className="req-tag">RESIDENCE CERTIFICATE</span>
              <ul>
                <li><CircleCheckBig />NIC Copy</li>
                <li><CircleCheckBig />Address Proof</li>
              </ul>
              <button className="btn-outline">View Full List</button>
            </div>
            <div className="req-card">
              <span className="req-tag">CHARACTER CERTIFICATE</span>
              <ul>
                <li><CircleCheckBig />Police Clearance</li>
                <li><CircleCheckBig />Local Refs</li>
              </ul>
              <button className="btn-outline">View Full List</button>
            </div>
            <div className="req-card">
              <span className="req-tag">PROPERTY REGISTRATION</span>
              <ul>
                <li><CircleCheckBig />Deed Digital...</li>
                <li><CircleCheckBig />Survey Plan</li>
              </ul>
              <button className="btn-outline">View Full List</button>
            </div>
            <div className="req-card">
              <span className="req-tag">FAMILY UPDATES</span>
              <ul>
                <li><CircleCheckBig />Marriage Certificate</li>
                <li><CircleCheckBig />Birth Certificate</li>
              </ul>
              <button className="btn-outline">View Full List</button>
            </div>
          </div>
        </div>
      </section>

      <section className="why-use-section">
        <div className="page-container">
          <div className="section-title inverted">
            <h2>Why Use This Portal?</h2>
          </div>
          <div className="features-row">
            <div className="feature-item">
              <div className="feature-icon"><Shield /></div>
              <p>Secure Access</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Zap /></div>
              <p>Faster Processing</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Hourglass /></div>
              <p>Fewer Office Visits</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Eye /></div>
              <p>Transparent Tracking</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CloudCheck /></div>
              <p>Digital Records</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Timer /></div>
              <p>24/7 Availability</p>
            </div>
          </div>
        </div>
      </section>

      <section className="announcements-section">
        <div className="page-container">
          <h2 className="section-heading-icon"><Megaphone />Recent Announcements</h2>

          <div className="announcement-card">
            <div className="announcement-date">July 14, 2026</div>
            <h3>New Digital Character Certificate Issuance System</h3>
            <p>All GN divisions have migrated to the new automated character certificate system for faster delivery.</p>
            <a href="#" className="btn-readmore">Read More</a>
          </div>

          <div className="announcement-card">
            <div className="announcement-date">July 13, 2026</div>
            <h3>Voter Registration Data Verification</h3>
            <p>Citizens are requested to log in and verify their address details for the upcoming local elections.</p>
            <a href="#" className="btn-readmore">Read More</a>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="page-container contact-grid">
          <div className="contact-info">
            <h2>Contact Our Office</h2>
            <div className="info-block">
              <div className="info-block-icon-1"><MapPin /></div>
              <div>
                <strong>Head Office</strong>
                <p>Ministry of Home Affairs, Independence Square,<br />Colombo 07, Sri Lanka</p>
              </div>
            </div>
            <div className="info-block">
              <div className="info-block-icon-2"><Phone /></div>
              <div>
                <strong>Phone</strong>
                <p>+94 11 234 5678 / +94 11 234 5679</p>
              </div>
            </div>
            <div className="info-block">
              <div className="info-block-icon-3"><Mail /></div>
              <div>
                <strong>Email Support</strong>
                <p>support@gndigital.gov.lk</p>
              </div>
            </div>
          </div>
          <div className="contact-map">
            <div className="map-container-mock">
              <img src={map} alt="Home Affairs Map" />
            </div>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="page-container footer-grid">
          <div className="footer-brand">
            <h3>Digital GN</h3>
            <p>Modernizing Sri Lanka's administrative backbone <br />
            through digital innovation and citizen-centric <br />
            services.</p>
          </div>
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Apply for Certificates</a></li>
              <li><a href="#">Track Application</a></li>
              <li><a href="#">Officer Directory</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Legal & Policies</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Accessibility</a></li>
              <li><a href="#">Data Protection</a></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Contact Support</h4>
            <p>Automated Desk Open 24/7 - Available</p>
            <div className="footer-socials">
              <a href="#"><Phone /></a>
              <a href="#"><Mail /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Digital Grama Niladhari Administration. All rights reserved. Government of Sri Lanka.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;