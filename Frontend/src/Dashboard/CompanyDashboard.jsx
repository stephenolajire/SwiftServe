import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaTruck,
  FaBoxOpen,
  FaChartLine,
  FaUserPlus,
  FaFilter,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaWallet,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaUserCog,
  FaTachometerAlt,
  FaFileInvoiceDollar,
  FaCarAlt,
  FaWarehouse,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../constant/api";
import Swal from "sweetalert2";
import styles from "../css/CompanyDashboard.module.css";
import { MEDIA_BASE_URL } from "../constant/api";

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  });
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (
      activeTab === "dashboard" ||
      activeTab === "workers" ||
      activeTab === "fleet"
    ) {
      fetchCompanyData();
    }
    if (activeTab === "deliveries") {
      fetchRecentDeliveries();
    }
    if (activeTab === "settings") {
      fetchCompanySettings();
    }
  }, [activeTab]);

  useEffect(() => {
    filterWorkers();
  }, [kycFilter, workers]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get("company/workers/");
      const { workers, company_stats } = response.data.data;

      const processedWorkers = workers.map((worker) => ({
        id: worker.id,
        name: `${worker.firstName} ${worker.lastName}`,
        avatar: worker.avatar || "/default-avatar.png",
        status: worker.status || "Available",
        kyc_status: worker.kyc_status || "none",
        deliveries: {
          pending: worker.deliveries?.pending || 0,
          in_transit: worker.deliveries?.in_transit || 0,
          completed: worker.deliveries?.completed || 0,
        },
        rating: worker.rating || 4.5,
        phone: worker.phone,
        fleetType: worker.fleetType,
        city: worker.city,
        documents: worker.documents || [],
        earnings: worker.earnings || 0,
      }));

      setWorkers(processedWorkers);

      setDeliveries({
        active: company_stats.total_deliveries.in_transit || 0,
        completed: company_stats.total_deliveries.completed || 0,
        pending: company_stats.total_deliveries.pending || 0,
      });

      // Calculate fleet statistics
      const fleets = {
        bike: { count: 0, deliveries: 0, revenue: 0 },
        car: { count: 0, deliveries: 0, revenue: 0 },
        van: { count: 0, deliveries: 0, revenue: 0 },
        truck: { count: 0, deliveries: 0, revenue: 0 },
      };

      processedWorkers.forEach((worker) => {
        const fleetType = worker.fleetType.toLowerCase();
        if (fleets[fleetType]) {
          fleets[fleetType].count++;
          fleets[fleetType].deliveries +=
            worker.deliveries.completed +
            worker.deliveries.in_transit +
            worker.deliveries.pending;
          fleets[fleetType].revenue += worker.earnings;
        }
      });

      setFleetStats(fleets);

      const revenueResponse = await api.get("company/revenue/");
      setRevenue({
        daily: revenueResponse.data.daily || 0,
        weekly: revenueResponse.data.weekly || 0,
        monthly: revenueResponse.data.monthly || 0,
        pendingPayout: revenueResponse.data.pendingPayout || 0,
      });
    } catch (error) {
      console.error("Error fetching company data:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch company data",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("company/deliveries/recent");
      setRecentDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error("Error fetching recent deliveries:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch recent deliveries",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("company/settings");
      setCompanySettings(response.data.settings || companySettings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      // Keep using the default settings
    } finally {
      setLoading(false);
    }
  };

  const filterWorkers = () => {
    if (kycFilter === "all") {
      setFilteredWorkers(workers);
    } else {
      setFilteredWorkers(
        workers.filter((worker) => worker.kyc_status === kycFilter)
      );
    }
  };

  const handlePayoutRequest = async () => {
    try {
      const result = await Swal.fire({
        title: "Request Payout",
        text: `Request payout of ₦${revenue.pendingPayout.toLocaleString()}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#FFC107",
        confirmButtonText: "Request Payout",
      });

      if (result.isConfirmed) {
        const response = await api.post("company/payout-request/");

        if (response.data.status === "success") {
          Swal.fire({
            title: "Success",
            text: "Payout request submitted successfully",
            icon: "success",
            confirmButtonColor: "#FFC107",
          });
          fetchCompanyData(); // Refresh data
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to request payout",
        icon: "error",
        confirmButtonColor: "#FFC107",
      });
    }
  };

  const saveCompanySettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("company/settings", companySettings);

      if (response.data.status === "success") {
        Swal.fire({
          title: "Success",
          text: "Company settings updated successfully",
          icon: "success",
          confirmButtonColor: "#FFC107",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to update settings",
        icon: "error",
        confirmButtonColor: "#FFC107",
      });
    } finally {
      setLoading(false);
    }
  };

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
    switch (status.toLowerCase()) {
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

  // Render dashboard content based on active tab
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
            <h3 className={styles.statTitle}>Pending Payout</h3>
            <p className={styles.statValue}>
              ₦{revenue.pendingPayout.toLocaleString()}
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
                <h4>{delivery.itemName}</h4>
                <span className={getDeliveryStatusClass(delivery.status)}>
                  {delivery.status_display}
                </span>
              </div>
              <div className={styles.deliveryDetails}>
                <p>
                  <strong>From:</strong> {delivery.pickupCity}
                </p>
                <p>
                  <strong>To:</strong> {delivery.deliveryCity}
                </p>
                <p>
                  <strong>Worker:</strong>{" "}
                  {delivery.worker_name || "Unassigned"}
                </p>
                <p>
                  <strong>Price:</strong> ₦
                  {delivery.estimated_price.toLocaleString()}
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
          {/* Add more form fields for other settings */}
        </div>
        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );

  // Workers Tab Content
  const renderWorkersOld = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Workers</h1>
        </div>
        <div className={styles.headerRight}>
          <Link to="/worker/new">
            <button className={styles.btnSecondary}>
              <FaUserPlus /> Add Worker
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="kycFilter">KYC Status:</label>
          <select
            id="kycFilter"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={styles.workersList}>
        {loading ? (
          <div className={styles.loading}>Loading workers data...</div>
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
    </>
  );

  // Deliveries Tab Content
  const renderDeliveriesOld = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Recent Deliveries</h1>
        </div>
      </div>

      <div className={styles.deliveriesList}>
        {loading ? (
          <div className={styles.loading}>Loading deliveries data...</div>
        ) : recentDeliveries.length > 0 ? (
          recentDeliveries.map((delivery) => (
            <div key={delivery.id} className={styles.deliveryCard}>
              <div className={styles.deliveryHeader}>
                <h4>{delivery.customer_name}</h4>
                <span className={getDeliveryStatusClass(delivery.status)}>
                  {delivery.status.toUpperCase()}
                </span>
              </div>
              <div className={styles.deliveryInfo}>
                <p>
                  <strong>Pickup:</strong> {delivery.pickup_address}
                </p>
                <p>
                  <strong>Dropoff:</strong> {delivery.dropoff_address}
                </p>
                <p>
                  <strong>Fee:</strong> ₦{delivery.fee.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No recent deliveries found</div>
        )}
      </div>
    </>
  );

  // Fleet Tab Content
  const renderFleetOld = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Fleet Overview</h1>
        </div>
      </div>

      <div className={styles.fleetGrid}>
        <div className={styles.fleetCard}>
          <div className={styles.fleetIcon}>
            <FaCarAlt />
          </div>
          <div className={styles.fleetInfo}>
            <h3 className={styles.fleetTitle}>Bikes</h3>
            <p className={styles.fleetValue}>{fleetStats.bike.count}</p>
            <p className={styles.fleetDeliveries}>
              Deliveries: {fleetStats.bike.deliveries}
            </p>
            <p className={styles.fleetRevenue}>
              Revenue: ₦{fleetStats.bike.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.fleetCard}>
          <div className={styles.fleetIcon}>
            <FaCarAlt />
          </div>
          <div className={styles.fleetInfo}>
            <h3 className={styles.fleetTitle}>Cars</h3>
            <p className={styles.fleetValue}>{fleetStats.car.count}</p>
            <p className={styles.fleetDeliveries}>
              Deliveries: {fleetStats.car.deliveries}
            </p>
            <p className={styles.fleetRevenue}>
              Revenue: ₦{fleetStats.car.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.fleetCard}>
          <div className={styles.fleetIcon}>
            <FaWarehouse />
          </div>
          <div className={styles.fleetInfo}>
            <h3 className={styles.fleetTitle}>Vans</h3>
            <p className={styles.fleetValue}>{fleetStats.van.count}</p>
            <p className={styles.fleetDeliveries}>
              Deliveries: {fleetStats.van.deliveries}
            </p>
            <p className={styles.fleetRevenue}>
              Revenue: ₦{fleetStats.van.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.fleetCard}>
          <div className={styles.fleetIcon}>
            <FaTruck />
          </div>
          <div className={styles.fleetInfo}>
            <h3 className={styles.fleetTitle}>Trucks</h3>
            <p className={styles.fleetValue}>{fleetStats.truck.count}</p>
            <p className={styles.fleetDeliveries}>
              Deliveries: {fleetStats.truck.deliveries}
            </p>
            <p className={styles.fleetRevenue}>
              Revenue: ₦{fleetStats.truck.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Finance Tab Content
  const renderFinance = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Finance Overview</h1>
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
  const renderSettingsOld = () => (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Company Settings</h1>
        </div>
      </div>

      <form className={styles.settingsForm} onSubmit={saveCompanySettings}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Company Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={companySettings.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={companySettings.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={companySettings.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={companySettings.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={companySettings.city}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={companySettings.state}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="logo">Logo URL</label>
          <input
            type="text"
            id="logo"
            name="logo"
            value={companySettings.logo}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bankName">Bank Name</label>
          <input
            type="text"
            id="bankName"
            name="bankName"
            value={companySettings.bankName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={companySettings.accountNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="taxId">Tax ID</label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            value={companySettings.taxId}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <button type="submit" className={styles.btnPrimary}>
            Save Settings
          </button>
        </div>
      </form>
    </>
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
            className={styles.menuItem}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => setActiveTab("workers")}
          >
            <FaUsers />
            <span>Workers</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => setActiveTab("deliveries")}
          >
            <FaClipboardList />
            <span>Deliveries</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => setActiveTab("fleet")}
          >
            <FaTruck />
            <span>Fleet</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => setActiveTab("finance")}
          >
            <FaWallet />
            <span>Finance</span>
          </div>
          <div
            className={styles.menuItem}
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
