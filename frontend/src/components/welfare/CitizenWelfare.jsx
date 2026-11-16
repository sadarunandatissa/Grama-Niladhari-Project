import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./CitizenWelfare.css";

const getApiUrl = () => {
    return import.meta.env?.VITE_API_URL || "http://localhost:5000";
};

const CitizenWelfare = () => {
    const { token } = useAuth();
    const API_URL = getApiUrl();

    const [welfare, setWelfare] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        monthlyIncome: "",
        familyMembers: "",
        reason: "",
    });

    const fetchWelfareStatus = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/welfare/citizen/my`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setWelfare(response.data.data || null);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load your welfare status."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchWelfareStatus();
    }, [token]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (
            form.monthlyIncome === "" ||
            form.familyMembers === "" ||
            !form.reason.trim()
        ) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await axios.post(
                `${API_URL}/api/welfare/citizen`,
                {
                    monthlyIncome: Number(form.monthlyIncome),
                    familyMembers: Number(form.familyMembers),
                    reason: form.reason,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setWelfare(response.data.data);
            setMessage("Your welfare request was submitted successfully.");
            setForm({
                monthlyIncome: "",
                familyMembers: "",
                reason: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to submit welfare request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="welfare-loading">Loading welfare information...</div>;
    }

    const status = welfare?.status || "";

    return (
        <div className="citizen-welfare">
            <div className="welfare-page_header">
                <div>
                    <h2>Welfare Assistance</h2>
                    <p>Apply for welfare assistance and check your application status.</p>
                </div>
            </div>

            {error && <div className="welfare-alert error">{error}</div>}
            {message && <div className="welfare-alert success">{message}</div>}

            {welfare ? (
                <div className="welfare-status-card">
                    <div className="welfare-status-heading">
                        <div>
                            <h3>Your Welfare Application</h3>
                            <p>
                                Submitted on{" "}
                                {new Date(welfare.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <span className={`welfare-status-badge ${status}`}>
                            {status.toUpperCase()}
                        </span>
                    </div>

                    <div className="welfare-details-grid">
                        <div>
                            <span>Monthly household income</span>
                            <strong>
                                Rs. {Number(welfare.monthlyIncome).toLocaleString()}
                            </strong>
                        </div>

                        <div>
                            <span>Family members</span>
                            <strong>{welfare.familyMembers}</strong>
                        </div>
                    </div>

                    <div className="welfare-reason">
                        <span>Reason for application</span>
                        <p>{welfare.reason}</p>
                    </div>

                    {welfare.officerNotes && (
                        <div className="welfare-officer-notes">
                            <strong>GN Officer's comments</strong>
                            <p>{welfare.officerNotes}</p>
                        </div>
                    )}

                    <p className="welfare-status-message">
                        {status === "pending" &&
                            "Your application is waiting for review by your GN officer."}
                        {status === "approved" && 
                            "Your welfare application has been approved."}
                        {status === "rejected" && 
                            "Your welfare application has been rejected."}
                    </p>
                </div>
            ) : (
                <div className="welfare-form-card">
                    <h3>Apply for Welfare Assistance</h3>
                    <p>
                        Complete the form below to submit a welfare assistance request.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="welfare-form-group">
                            <label htmlFor="monthlyIncome">
                                Monthly household income (Rs.)
                            </label>
                            <input
                                id="monthlyIncome"
                                type="number"
                                name="monthlyIncome"
                                min="0"
                                value={form.monthlyIncome}
                                onChange={handleChange}
                                placeholder="Enter monthly household income"
                                required
                            />
                        </div>

                        <div className="welfare-form-group">
                            <label htmlFor="familyMembers">Number of family members</label>
                            <input
                                id="familyMembers"
                                type="number"
                                name="familyMembers"
                                min="1"
                                step="1"
                                value={form.familyMembers}
                                onChange={handleChange}
                                placeholder="Enter number of family members"
                                required
                            />
                        </div>

                        <div className="welfare-form-group">
                            <label htmlFor="reason"> Reason for requesting welfare</label>
                            <textarea 
                                name="reason" 
                                id="reason"
                                rows="4"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="Explain why you need welfare assistance"
                                required
                            />
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Welfare Request"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CitizenWelfare;