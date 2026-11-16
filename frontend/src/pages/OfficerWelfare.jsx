
import React, { useEffect, useState } from "react";
import axios from "axios";

import "./OfficerWelfare.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OfficerWelfare = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/welfare/officer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching welfare requests:", error);
      setMessage("Unable to load welfare requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    const officerNotes = window.prompt(
      `Enter a note for this ${status} request (optional):`
    );

    if (officerNotes === null) return;

    try {
      await axios.put(
        `${API_URL}/api/welfare/officer/${id}`,
        {
          status,
          officerNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`Request ${status} successfully.`);
      fetchRequests();
    } catch (error) {
      console.error("Error updating welfare request:", error);
      setMessage("Unable to update request.");
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  if (loading) {
    return <p>Loading welfare requests...</p>;
  }

  return (
    <div className="welfare-officer-page">
      <h2>Welfare Management</h2>
      <p>View and manage welfare assistance requests in your village.</p>

      {message && <p>{message}</p>}

      <div className="welfare-filter">
        <label>Filter requests: </label>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p>No welfare requests found.</p>
      ) : (
        <div className="welfare-request-list">
          {filteredRequests.map((request) => (
            <div className="welfare-request-card" key={request._id}>
              <h3>
                {request.citizenId?.full_name || "Unknown Citizen"}
              </h3>

              <p>
                <strong>NIC:</strong>{" "}
                {request.citizenId?.nic || "N/A"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {request.citizenId?.address || "N/A"}
              </p>

              <p>
                <strong>Monthly Income:</strong> Rs.{" "}
                {request.monthlyIncome}
              </p>

              <p>
                <strong>Family Members:</strong>{" "}
                {request.familyMembers}
              </p>

              <p>
                <strong>Reason:</strong> {request.reason}
              </p>

              <p>
                <strong>Status:</strong> {request.status}
              </p>

              {request.status === "pending" && (
                <div>
                  <button
                    onClick={() =>
                      updateStatus(request._id, "approved")
                    }
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(request._id, "rejected")
                    }
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.officerNotes && (
                <p>
                  <strong>Officer Notes:</strong>{" "}
                  {request.officerNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficerWelfare;