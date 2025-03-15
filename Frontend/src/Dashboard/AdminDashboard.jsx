import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaUserCheck,
  FaMoneyBillWave,
  FaEnvelope,
  FaIdCard,
  FaChartBar,
} from "react-icons/fa";
import api from "../constant/api";
import styles from "../css/AdminDashboard.module.css";
import Swal from "sweetalert2";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import UserActivityChart from "../components/UserActivityChart";

const BASE_URL = "http://localhost:8000";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalCompanies: 0,
    totalClients: 0,
    pendingKYC: 0,
    totalRevenue: 0,
    totalDeliveries: 0,
    unreadMessages: 0,
  });

  const [users, setUsers] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userActivity, setUserActivity] = useState({
    newUsers: [],
    activeUsers: [],
  });
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "overview", label: "Dashboard Overview", icon: <FaChartBar /> },
    { id: "users", label: "User Management", icon: <FaUsers /> },
    { id: "kyc", label: "KYC Verifications", icon: <FaIdCard /> },
    { id: "revenue", label: "Revenue & Analytics", icon: <FaMoneyBillWave /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, kycRes, activityRes] = await Promise.all([
        api.get("admin/stats"),
        api.get("admin/users"),
        api.get("admin/kyc-requests"),
        api.get("admin/user-activity"), // New endpoint
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setKycRequests(kycRes.data);
      setUserActivity(activityRes.data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch dashboard data", "error");
    }
  };

  const handleKYCAction = async (userId, action) => {
    if (!userId) {
      Swal.fire("Error", "Invalid user ID", "error");
      return;
    }

    try {
      await api.post(`/admin/kyc/${userId}/${action}`);
      await fetchDashboardData();
      Swal.fire("Success", `KYC ${action}d successfully`, "success");
    } catch (error) {
      console.error("KYC action error:", error);
      Swal.fire(
        "Error",
        `Failed to ${action} KYC: ${
          error.response?.data?.message || "Unknown error"
        }`,
        "error"
      );
    }
  };

  const filterUsers = () => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesType = filterType === "all" || user.user_type === filterType;
      const matchesSearch =
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.firstName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  const getUserStatus = (user) => {
    if (!user) return "unknown";
    if (user.is_active === false) return "suspended";
    if (user.kyc_status) return "verified";
    return "active";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.overviewGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<FaUsers />}
              color="#4CAF50"
            />
            <StatCard
              title="Total Workers"
              value={stats.totalWorkers}
              icon={<FaUserTie />}
              color="#2196F3"
            />
            <StatCard
              title="Total Companies"
              value={stats.totalCompanies}
              icon={<FaBuilding />}
              color="#9C27B0"
            />
            <StatCard
              title="Pending KYC"
              value={stats.pendingKYC}
              icon={<FaIdCard />}
              color="#FF9800"
            />
            <StatCard
              title="Total Revenue"
              value={`₦${stats.totalRevenue.toLocaleString()}`}
              icon={<FaMoneyBillWave />}
              color="#4CAF50"
            />
            <RevenueChart data={stats.revenueData} />
            <UserActivityChart
              users={userActivity.newUsers}
              activeUsers={userActivity.activeUsers}
            />
          </div>
        );

      case "users":
        return (
          <div className={styles.usersSection}>
            <div className={styles.filters}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Users</option>
                <option value="COMPANY">Companies</option>
                <option value="WORKER">Workers</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="CLIENT">Clients</option>
              </select>
              <input
                type="search"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.usersTable}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterUsers().map((user) => (
                    <tr key={user.id}>
                      <td>{`${user.firstName || ""} ${
                        user.lastName || ""
                      }`}</td>
                      <td>{user.email || "N/A"}</td>
                      <td className={styles.userType}>
                        {user.user_type || "N/A"}
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[getUserStatus(user)]
                          }`}
                        >
                          {getUserStatus(user).toLocaleUpperCase()}
                        </span>
                      </td>
                      <td>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                user.is_active ? "suspend" : "activate"
                              )
                            }
                            className={
                              user.is_active
                                ? styles.suspendButton
                                : styles.activateButton
                            }
                          >
                            {user.is_active ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "kyc":
        return (
          <div className={styles.kycSection}>
            <h2>KYC Verifications</h2>
            <div className={styles.kycGrid}>
              {kycRequests.map((kyc) => (
                <div key={kyc.id} className={styles.kycCard}>
                  <div className={styles.kycHeader}>
                    <h3>{`${kyc.firstName} ${kyc.lastName}`}</h3>
                    <span
                      className={`${styles.status} ${
                        styles[kyc.status.toLowerCase()]
                      }`}
                    >
                      {kyc.status}
                    </span>
                  </div>
                  <div className={styles.kycDetails}>
                    <p>
                      <strong>ID Type:</strong> {kyc.idType}
                    </p>
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(kyc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.kycDocuments}>
                    <img
                      src={kyc.idDocument ? `${BASE_URL}${kyc.idDocument}` : ""}
                      alt="ID Document"
                    />
                    <img
                      src={
                        kyc.selfieImage ? `${BASE_URL}${kyc.selfieImage}` : ""
                      }
                      alt="Selfie"
                    />
                  </div>
                  <div className={styles.kycActions}>
                    <button
                      className={styles.approveButton}
                      onClick={() => handleKYCAction(kyc.user_id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleKYCAction(kyc.user_id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // Add other tab contents...

      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        {sidebarItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.sidebarItem} ${
              activeTab === item.id ? styles.active : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <h1>Admin Dashboard</h1>
          <div className={styles.adminProfile}>
            <img src="/admin-avatar.png" alt="Admin" />
            <span>Admin Name</span>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
