import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaTruck,
  FaBoxOpen,
  FaChartLine,
  FaUserPlus,
  FaFilter,
  FaMoneyBillWave,
  FaHome,
  FaClipboardList,
  FaWallet,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTachometerAlt,
  FaCarAlt,
  FaWarehouse,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "../css/CompanyDashboard.module.css";
import Swal from "sweetalert2";
import api from "../constant/api";

const CompanyDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [kycFilter, setKycFilter] = useState("all");
  const [deliveries, setDeliveries] = useState({
    active: 0,
    completed: 0,
    pending: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [revenue, setRevenue] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    pendingPayout: 0,
    total_revenue: 0,
  });
  const [fleetStats, setFleetStats] = useState({
    bike: { count: 0, deliveries: 0, revenue: 0 },
    car: { count: 0, deliveries: 0, revenue: 0 },
    van: { count: 0, deliveries: 0, revenue: 0 },
    truck: { count: 0, deliveries: 0, revenue: 0 },
  });
  const [companySettings, setCompanySettings] = useState({
    name: "Your Company",
    email: "company@example.com",
    phone: "+1234567890",
    address: "123 Business Street",
    city: "Business City",
    state: "BS",
    logo: "/company-logo.png",
    bankName: "Business Bank",
    accountNumber: "1234567890",
    taxId: "TAX123456789",
  });

  // Load data based on active tab
  useEffect(() => {
    loadDataForActiveTab();
  }, [activeTab]);

  // Apply KYC filter to workers
  useEffect(() => {
    filterWorkers();
  }, [kycFilter, workers]);

  // Data loading function based on active tab
  const loadDataForActiveTab = () => {
    setLoading(true);

    // Simulate API loading delay
    setTimeout(() => {
      switch (activeTab) {
        case "dashboard":
          loadDashboardData();
          break;
        case "workers":
          loadWorkersData();
          break;
        case "deliveries":
          loadDeliveriesData();
          break;
        case "fleet":
          loadFleetData();
          break;
        case "finance":
          loadFinanceData();
          break;
        case "settings":
          loadSettingsData();
          break;
        default:
          loadDashboardData();
      }
      setLoading(false);
    }, 500);
  };

  // Tab-specific data loading functions
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("dashboard/overview/");
      console.log(response.data.data);

      if (response.data.status === "success") {
        const { data } = response.data.data;

        setWorkers(response.data.data);
        setDeliveries({
          active: data.delivery_stats.active,
          completed: data.delivery_stats.completed,
          pending: data.delivery_stats.pending,
        });

        // Update total revenue in revenue state
        setRevenue((prev) => ({
          ...prev,
          total_revenue: data.total_revenue,
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to load dashboard data",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkersData = () => {
    setWorkers(mockWorkers);
  };

  const loadDeliveriesData = () => {
    setRecentDeliveries(mockDeliveries);
  };

  const loadFleetData = () => {
    setFleetStats(mockFleetStats);
  };

  const loadFinanceData = () => {
    setRevenue(mockRevenue);
  };

  const loadSettingsData = () => {
    setCompanySettings(mockCompanySettings);
  };

  // Filter workers based on KYC status
  const filterWorkers = () => {
    if (kycFilter === "all") {
      setFilteredWorkers(workers);
    } else {
      setFilteredWorkers(
        workers.filter((worker) => worker.kyc_status === kycFilter)
      );
    }
  };

  // Handle payout request
  const handlePayoutRequest = () => {
    if (revenue.pendingPayout <= 0) return;

    // Show confirmation dialog here (would use Swal in real implementation)
    const isConfirmed = window.confirm(
      `Request payout of ₦${revenue.pendingPayout.toLocaleString()}?`
    );

    if (isConfirmed) {
      // Would normally make API call here
      alert("Payout request submitted successfully");
      // Refresh data
      loadFinanceData();
    }
  };

  // Save company settings
  const saveCompanySettings = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Would normally make API call here
      alert("Company settings updated successfully");
      setLoading(false);
    }, 500);
  };

  // Helper functions for UI
  const getKycStatusColor = (status) => {
    switch (status) {
      case "approved":
        return styles.approved;
      case "pending":
        return styles.pending;
      case "rejected":
        return styles.rejected;
      default:
        return styles.none;
    }
  };

  const getDeliveryStatusClass = (status) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case "completed":
        return styles.statusCompleted;
      case "in_transit":
        return styles.statusActive;
      default:
        return styles.statusPending;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Tab content rendering functions
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "workers":
        return renderWorkers();
      case "deliveries":
        return renderDeliveries();
      case "fleet":
        return renderFleet();
      case "finance":
        return renderFinance();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // Dashboard Tab Content
  const renderDashboard = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.btnPrimary}
            onClick={handlePayoutRequest}
            disabled={revenue.pendingPayout <= 0}
          >
            <FaMoneyBillWave /> Request Payout
          </button>
          <Link to="/worker/new">
            <button className={styles.btnSecondary}>
              <FaUserPlus /> Add Worker
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Total Workers</h3>
            <p className={styles.statValue}>{workers.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTruck />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Active Deliveries</h3>
            <p className={styles.statValue}>{deliveries.active}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBoxOpen />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Completed Deliveries</h3>
            <p className={styles.statValue}>{deliveries.completed}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Total Revenue</h3>
            <p className={styles.statValue}>
              {loading
                ? "Loading..."
                : `₦${(revenue.total_revenue || 0).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Workers Overview Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Workers Overview</h2>
            <div
              className={styles.viewAllLink}
              onClick={() => setActiveTab("workers")}
            >
              View All
            </div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.workersList}>
              {loading ? (
                <div className={styles.loading}>Loading workers data...</div>
              ) : workers.length > 0 ? (
                workers.slice(0, 4).map((worker) => (
                  <div key={worker.id} className={styles.workerCard}>
                    <div className={styles.workerHeader}>
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className={styles.workerAvatar}
                      />
                      <div className={styles.workerInfo}>
                        <h4>{worker.name}</h4>
                        <span
                          className={`${styles.kycBadge} ${getKycStatusColor(
                            worker.kyc_status
                          )}`}
                        >
                          {worker.kyc_status.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.workerStats}>
                        <div className={styles.stat}>
                          <span>Completed</span>
                          <p>{worker.deliveries.completed}</p>
                        </div>
                        <div className={styles.stat}>
                          <span>Active</span>
                          <p>{worker.deliveries.in_transit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>No workers found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Workers Tab Content
  const renderWorkers = () => (
    <div className={styles.workersSection}>
      <div className={styles.sectionHeader}>
        <h2>Worker Management</h2>
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <FaFilter />
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Workers</option>
              <option value="none">No KYC</option>
              <option value="pending">KYC Pending</option>
              <option value="approved">KYC Approved</option>
              <option value="rejected">KYC Rejected</option>
            </select>
          </div>
          <Link to="/worker/new">
            <button className={styles.addButton}>
              <FaUserPlus /> Add Worker
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.workersGrid}>
        {loading ? (
          <div className={styles.loading}>Loading workers...</div>
        ) : filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <div key={worker.id} className={styles.workerCard}>
              <div className={styles.workerHeader}>
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className={styles.workerAvatar}
                />
                <div className={styles.workerInfo}>
                  <h4>{worker.name}</h4>
                  <p>{worker.phone}</p>
                  <span
                    className={`${styles.kycBadge} ${getKycStatusColor(
                      worker.kyc_status
                    )}`}
                  >
                    {worker.kyc_status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.workerStats}>
                <div className={styles.statRow}>
                  <div className={styles.stat}>
                    <span>Completed</span>
                    <p>{worker.deliveries.completed}</p>
                  </div>
                  <div className={styles.stat}>
                    <span>Active</span>
                    <p>{worker.deliveries.in_transit}</p>
                  </div>
                  <div className={styles.stat}>
                    <span>Earnings</span>
                    <p>₦{worker.earnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className={styles.workerActions}>
                <Link to={`/worker/${worker.id}`}>
                  <button className={styles.viewButton}>View Details</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No workers found</div>
        )}
      </div>
    </div>
  );

  // Deliveries Tab Content
  const renderDeliveries = () => (
    <div className={styles.deliveriesSection}>
      <h2>Recent Deliveries</h2>
      <div className={styles.deliveriesGrid}>
        {loading ? (
          <div className={styles.loading}>Loading deliveries...</div>
        ) : recentDeliveries.length > 0 ? (
          recentDeliveries.map((delivery) => (
            <div key={delivery.id} className={styles.deliveryCard}>
              <div className={styles.deliveryHeader}>
                <h4>{delivery.itemName || "Unnamed Delivery"}</h4>
                <span className={getDeliveryStatusClass(delivery.status)}>
                  {delivery.status_display || delivery.status}
                </span>
              </div>
              <div className={styles.deliveryDetails}>
                <p>
                  <strong>From:</strong> {delivery.pickupCity || "Unknown"}
                </p>
                <p>
                  <strong>To:</strong> {delivery.deliveryCity || "Unknown"}
                </p>
                <p>
                  <strong>Worker:</strong>{" "}
                  {delivery.worker_name || "Unassigned"}
                </p>
                <p>
                  <strong>Price:</strong> ₦
                  {delivery.estimated_price?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No recent deliveries</div>
        )}
      </div>
    </div>
  );

  // Fleet Tab Content
  const renderFleet = () => (
    <div className={styles.fleetSection}>
      <h2>Fleet Statistics</h2>
      <div className={styles.fleetGrid}>
        {Object.entries(fleetStats).map(([type, stats]) => (
          <div key={type} className={styles.fleetCard}>
            <div className={styles.fleetIcon}>
              {type === "bike" && <FaCarAlt />}
              {type === "car" && <FaCarAlt />}
              {type === "van" && <FaTruck />}
              {type === "truck" && <FaTruck />}
            </div>
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)}s</h3>
            <div className={styles.fleetStats}>
              <div className={styles.stat}>
                <span>Count</span>
                <p>{stats.count}</p>
              </div>
              <div className={styles.stat}>
                <span>Deliveries</span>
                <p>{stats.deliveries}</p>
              </div>
              <div className={styles.stat}>
                <span>Revenue</span>
                <p>₦{stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Finance Tab Content
  const renderFinance = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Finance Overview</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.btnPrimary}
            onClick={handlePayoutRequest}
            disabled={revenue.pendingPayout <= 0}
          >
            <FaMoneyBillWave /> Request Payout
          </button>
        </div>
      </div>

      <div className={styles.financeGrid}>
        <div className={styles.financeCard}>
          <div className={styles.financeIcon}>
            <FaChartLine />
          </div>
          <div className={styles.financeInfo}>
            <h3 className={styles.financeTitle}>Daily Revenue</h3>
            <p className={styles.financeValue}>
              ₦{revenue.daily.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.financeCard}>
          <div className={styles.financeIcon}>
            <FaChartLine />
          </div>
          <div className={styles.financeInfo}>
            <h3 className={styles.financeTitle}>Weekly Revenue</h3>
            <p className={styles.financeValue}>
              ₦{revenue.weekly.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.financeCard}>
          <div className={styles.financeIcon}>
            <FaChartLine />
          </div>
          <div className={styles.financeInfo}>
            <h3 className={styles.financeTitle}>Monthly Revenue</h3>
            <p className={styles.financeValue}>
              ₦{revenue.monthly.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.financeCard}>
          <div className={styles.financeIcon}>
            <FaWallet />
          </div>
          <div className={styles.financeInfo}>
            <h3 className={styles.financeTitle}>Pending Payout</h3>
            <p className={styles.financeValue}>
              ₦{revenue.pendingPayout.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Settings Tab Content
  const renderSettings = () => (
    <div className={styles.settingsSection}>
      <h2>Company Settings</h2>
      <form onSubmit={saveCompanySettings} className={styles.settingsForm}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Company Name</label>
            <input
              type="text"
              name="name"
              value={companySettings.name}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={companySettings.email}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={companySettings.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={companySettings.address}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              name="city"
              value={companySettings.city}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>State</label>
            <input
              type="text"
              name="state"
              value={companySettings.state}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={companySettings.bankName}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={companySettings.accountNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <div
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <img
            src={companySettings.logo}
            alt="Company Logo"
            className={styles.logo}
          />
          <h2 className={styles.companyName}>{companySettings.name}</h2>
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <div className={styles.sidebarMenu}>
          <div
            className={`${styles.menuItem} ${
              activeTab === "dashboard" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </div>
          <div
            className={`${styles.menuItem} ${
              activeTab === "workers" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("workers")}
          >
            <FaUsers />
            <span>Workers</span>
          </div>
          <div
            className={`${styles.menuItem} ${
              activeTab === "deliveries" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("deliveries")}
          >
            <FaClipboardList />
            <span>Deliveries</span>
          </div>
          <div
            className={`${styles.menuItem} ${
              activeTab === "fleet" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("fleet")}
          >
            <FaTruck />
            <span>Fleet</span>
          </div>
          <div
            className={`${styles.menuItem} ${
              activeTab === "finance" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("finance")}
          >
            <FaWallet />
            <span>Finance</span>
          </div>
          <div
            className={`${styles.menuItem} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog />
            <span>Settings</span>
          </div>
          <div className={styles.menuItem}>
            <FaSignOutAlt />
            <span>Logout</span>
          </div>
        </div>
      </div>
      <div className={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

export default CompanyDashboard;
