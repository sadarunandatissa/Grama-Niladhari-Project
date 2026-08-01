import React from 'react';
import "./OfficerDashboard.css";
import gnAvatar from "../assets/Officer-Avatar.png";
import { Cross, UsersRound, Megaphone, MessageSquare, Smartphone, Settings, LogOut, LayoutDashboard, CircleUserRound, FileCheckCorner, FileStack, House, Circle, Calendar,ChevronDown, UserRound, Download } from 'lucide-react';

const Officerdashboard = () => {
  return (
    <div className="dashboard-wrapper">

      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>GRAMA NILADHARI<br /><span>MANAGEMENT SYSTEM</span></h2>
        </div>

        <nav className="sidebar-menu">
          <a href="#" className="menu-item active"><LayoutDashboard /> Dashboard</a>

          <span className="menu-category">MAIN</span>
          <a href="#" className="menu-item"><Cross /> Requests</a>
          <a href="#" className="menu-item"><UsersRound /> Citizens</a>
          <a href="#" className="menu-item"><Megaphone /> Announcements</a>
          <a href="#" className="menu-item"><MessageSquare /> Messages</a>
          <a href="#" className="menu-item"><Smartphone /> Alerts</a>
          <a href="#" className="menu-item"><Settings /> Settings</a>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="menu-item logout"><LogOut /> Log out</a>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div className="page-title"><LayoutDashboard /> Dashboard</div>
          <div className="user-profile">
            <div className="profile-avatar"><CircleUserRound /></div>
            <div className="profile-info">
              <span className="user-name">GN OFFICER</span>
              <span className="user-role">GRAMA NILADHARI</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">

          <div className="upper-grid">
            <div className="welcome-card">
              <div className="welcome-graphic">
                <img src={gnAvatar} alt="GN OFFICER" />
              </div>
              <div className="welcome-text">
                <h3>GOOD MORNING !</h3>
                <p className="title-sub">GRAMA NILADHARI OFFICER</p>
                <div className="division-badge">GN DIVISION <span className="badge-num">123A</span></div>
                <p className="date-stamp">Today is 10 July 2026</p>
              </div>
            </div>
            <div className="quick-actions-grid">
              <button className="action-btn"><Cross /> Requests</button>
              <button className="action-btn"><UsersRound /> Citizens</button>
              <button className="action-btn"><Megaphone /> Announcements</button>
              <button className="action-btn"><MessageSquare /> Messages</button>
            </div>
          </div>

          <div className="notice-strip">
            IMPORTANT NOTICES
          </div>

          <div className="status-summary-row">

            {/* Certificate Requests */}
            <div className="status-card border-blue">
              <div className="card-head">
                <div className="card-head-icon">
                  <FileCheckCorner />
                </div>
                <h4>Cerificate Requests</h4>
              </div>
              <div className="counter-badge-row">
                <div className="badge-box bg-blue"><span>Pending</span><strong>12</strong></div>
                <div className="badge-box bg-blue"><span>Approved</span><strong>123</strong></div>
                <div className="badge-box bg-blue"><span>Rejected</span><strong>03</strong></div>
              </div>
              <div className="mini-list">
                <div className="list-item">Request 1</div>
                <div className="list-item">Request 2</div>
              </div>
            </div>

            {/* Permit Requests */}
            <div className="status-card border-green">
              <div className="card-head">
                <div className="card-head-icon">
                  <FileStack />
                </div>
                <h4>Permit Requests</h4>
              </div>
              <div className="counter-badge-row">
                <div className="badge-box bg-green"><span>Pending</span><strong>03</strong></div>
                <div className="badge-box bg-green"><span>Approved</span><strong>100</strong></div>
                <div className="badge-box bg-green"><span>Rejected</span><strong>12</strong></div>
              </div>
              <div className="mini-list">
                <div className="list-item">Request 1</div>
                <div className="list-item">Request 2</div>
              </div>
            </div>

            {/* Citizen Details Count Box */}
            <div className="status-card border-orange">
              <div className="card-head">
                <div className="card-head-icon">
                  <House />
                </div>
                <h4>Citizen details</h4>
              </div>
              <div className="stat-rows-group">
                <div className="stat-row"><span>Total Citizens:</span><strong className="val-box">240</strong></div>
                <div className="stat-row"><span>Total Families:</span><strong className="val-box">63</strong></div>
                <div className="stat-row"><span>Total Houses:</span><strong className="val-box">58</strong></div>
              </div>
            </div>
          </div>

          {/* Charts and visualizations */}
          <div className="visuals-row">

            {/* Bar Chart */}
            <div className="chart-card flex-double">
              <div className="chart-header">
                <h5>Monthly Requests Overview</h5>
                <div className="chart-legend">
                  <span className="blue"><Circle /> Certificate Requests</span>
                  <span className="green"><Circle /> Permit Requests</span>
                </div>
              </div>

              {/* graphic structure mapping the visual graph layout */}
              <div className="graph-bars"></div>
              <div className="graph-summary-tiles">
                <div className="tile"><span>Total Certificate Requests</span><strong>268</strong></div>
                <div className="tile"><span>Total Permit Requests</span><strong>193</strong></div>
                <div className="tile"><span>Highest Month (Certificates)</span><strong>30 <small>July</small></strong></div>
                <div className="tile"><span>Highest Month (Permits)</span><strong>22 <small>July</small></strong></div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h5>Citizen Details</h5>
                  <span className="sub-caption">Overview of Citizens, Families and Houses</span>
                </div>
                <div className="dropdown-mock"><Calendar /> This Year <ChevronDown /></div>
              </div>
              <div className="mock-pie-layout">
                <div className="pie-donut-graphic"></div>
                <div className="pie-breakdown-list">
                  <div className="breakdown-item"><span className="lbl"><UserRound /> Total Citizens</span><strong>240</strong></div>
                  <div className="breakdown-item"><span className="lbl"><UserRound /> Total Families</span><strong>63</strong></div>
                  <div className="breakdown-item"><span className="lbl"><UserRound /> Total Houses</span><strong>58</strong></div>
                </div>
              </div>
              <div className="chart-card-footer">
                <p>This chart represents the distribution of citizens, families, and houses</p>
                <button className="btn-download-report"><Download /> Download Report</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Officerdashboard;