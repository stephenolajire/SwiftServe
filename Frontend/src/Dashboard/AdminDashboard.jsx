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
  FaEye,
} from "react-icons/fa";
import api from "../constant/api";
import styles from "../css/AdminDashboard.module.css";
import Swal from "sweetalert2";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import UserActivityChart from "../components/UserActivityChart";

// const BASE_URL = "http://localhost:8000";

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
    totalIndividual: 0,
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
  const [companyKYC, setCompanyKYC] = useState([]);
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "overview", label: "Dashboard Overview", icon: <FaChartBar /> },
    { id: "users", label: "User Management", icon: <FaUsers /> },
    { id: "kyc", label: "KYC Verifications", icon: <FaIdCard /> },
    { id: "revenue", label: "Revenue & Analytics", icon: <FaMoneyBillWave /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
    { id: "company", label: "Company KYC", icon: <FaBuilding /> },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, kycRes, activityRes, companyKycRes] =
        await Promise.all([
          api.get("admin/stats"),
          api.get("admin/users"),
          api.get("admin/kyc-requests"),
          api.get("admin/user-activity"),
          api.get("admin/company-kyc"),
        ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setKycRequests(kycRes.data);
      setUserActivity(activityRes.data);
      setCompanyKYC(companyKycRes.data);
      console.log(statsRes.data);
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

  const handleCompanyKYCAction = async (userId, action) => {
    if (!userId) {
      Swal.fire("Error", "Invalid company ID", "error");
      return;
    }

    try {
      await api.post(`/admin/company-kyc/${userId}/${action}`);
      await fetchDashboardData();
      Swal.fire("Success", `Company KYC ${action}d successfully`, "success");
    } catch (error) {
      console.error("Company KYC action error:", error);
      Swal.fire(
        "Error",
        `Failed to ${action} company KYC: ${
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
              title="Total Clients"
              value={stats.totalClients}
              icon={<FaUsers />}
              color="#4CAF50"
            />
            <StatCard
              title="Total Individual"
              value={stats.totalIndividual}
              icon={<FaUsers />}
              color="#4CAF50"
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
                      src={kyc.idDocument }
                      alt="ID Document"
                    />
                    <img
                      src={
                        kyc.selfieImage
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

      case "company":
        return (
          <div className={styles.kycSection}>
            <h2>Company KYC Verifications</h2>
            {companyKYC.length === 0 ? (
              <div className={styles.emptyState}>
                <FaBuilding size={48} />
                <p>No pending company KYC verifications</p>
              </div>
            ) : (
              <div className={styles.kycGrid}>
                {companyKYC.map((kyc) => (
                  <div key={kyc.id} className={styles.kycCard}>
                    <div className={styles.kycHeader}>
                      <h3>{kyc.companyName || "Unnamed Company"}</h3>
                      <span
                        className={`${styles.status} ${
                          styles[
                            kyc.kyc_status
                              ? kyc.kyc_status.toLowerCase()
                              : "pending"
                          ]
                        }`}
                      >
                        {kyc.kyc_status || "PENDING"}
                      </span>
                    </div>
                    <div className={styles.kycDetails}>
                      <div className={styles.detailRow}>
                        <label>Email:</label>
                        <span>{kyc.email}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <label>Registration Number:</label>
                        <span>{kyc.registrationNumber || "N/A"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <label>Tax ID:</label>
                        <span>{kyc.taxId || "N/A"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <label>CAC Number:</label>
                        <span>{kyc.cacNumber || "N/A"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <label>Submitted:</label>
                        <span>
                          {new Date(kyc.date_joined).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.documentsSection}>
                      <h4>Company Documents</h4>
                      <div className={styles.documentGrid}>
                        {kyc.businessLicense && (
                          <div className={styles.documentItem}>
                            <label>Business License</label>
                            <div className={styles.documentActions}>
                              <a
                                href={`${BASE_URL}${kyc.businessLicense}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewButton}
                              >
                                View <FaEye />
                              </a>
                            </div>
                          </div>
                        )}
                        {kyc.cacCertificate && (
                          <div className={styles.documentItem}>
                            <label>CAC Certificate</label>
                            <div className={styles.documentActions}>
                              <a
                                href={`${BASE_URL}${kyc.cacCertificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewButton}
                              >
                                View <FaEye />
                              </a>
                            </div>
                          </div>
                        )}
                        {kyc.taxClearance && (
                          <div className={styles.documentItem}>
                            <label>Tax Clearance</label>
                            <div className={styles.documentActions}>
                              <a
                                href={`${BASE_URL}${kyc.taxClearance}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewButton}
                              >
                                View <FaEye />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.kycActions}>
                      <button
                        className={styles.approveButton}
                        onClick={() => {
                          Swal.fire({
                            title: "Approve Company KYC?",
                            text: `Are you sure you want to approve ${kyc.companyName}'s KYC?`,
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonText: "Yes, Approve",
                            cancelButtonText: "Cancel",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleCompanyKYCAction(kyc.id, "approve");
                            }
                          });
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className={styles.rejectButton}
                        onClick={() => {
                          Swal.fire({
                            title: "Reject Company KYC?",
                            text: "Please provide a reason for rejection:",
                            input: "text",
                            showCancelButton: true,
                            confirmButtonText: "Reject",
                            showLoaderOnConfirm: true,
                            preConfirm: (reason) => {
                              return handleCompanyKYCAction(
                                kyc.id,
                                "reject",
                                reason
                              );
                            },
                          });
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

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
