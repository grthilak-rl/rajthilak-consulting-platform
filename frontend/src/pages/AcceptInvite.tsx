import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInviteInfo, acceptInvite, setToken } from "../api/client";
import "./AcceptInvite.css";

type InviteState = "loading" | "ready" | "invalid" | "already_accepted";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [inviteState, setInviteState] = useState<InviteState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteState("invalid");
      return;
    }

    getInviteInfo(token)
      .then((info) => {
        setEmail(info.email);
        setInviteState("ready");
      })
      .catch((err: unknown) => {
        const msg = (err as Error).message.toLowerCase();
        if (msg.includes("already") || msg.includes("used") || msg.includes("accepted")) {
          setInviteState("already_accepted");
        } else {
          setInviteState("invalid");
        }
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      const data = await acceptInvite(token, password);
      setToken(data.access_token);
      navigate("/portal");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (inviteState === "loading") {
    return (
      <div className="accept-invite">
        <div className="accept-invite-card">
          <div className="accept-invite-skeleton">
            <div className="skel-block" style={{ width: "60%", height: "24px", margin: "0 auto" }} />
            <div className="skel-block" style={{ width: "80%", height: "14px", margin: "8px auto 0" }} />
            <div className="skel-block" style={{ height: "44px", marginTop: "32px" }} />
            <div className="skel-block" style={{ height: "44px" }} />
            <div className="skel-block" style={{ height: "44px" }} />
            <div className="skel-block" style={{ height: "48px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (inviteState === "already_accepted") {
    return (
      <div className="accept-invite">
        <div className="accept-invite-card">
          <div className="invite-status-icon invite-status-warn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5M12 15.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Invitation Already Used</h1>
          <p className="invite-status-text">
            This invitation link has already been accepted. If you have an account, you can sign in below.
          </p>
          <button className="btn-invite-action" onClick={() => navigate("/admin/login")}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (inviteState === "invalid") {
    return (
      <div className="accept-invite">
        <div className="accept-invite-card">
          <div className="invite-status-icon invite-status-error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Invalid Invitation</h1>
          <p className="invite-status-text">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invite">
      <div className="accept-invite-card">
        <div className="accept-invite-header">
          <div className="accept-invite-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8-5-8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Create Your Account</h1>
          <p>You have been invited to the client portal. Set your password to get started.</p>
        </div>

        {error && (
          <div className="alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="invite-email">Email</label>
            <input
              id="invite-email"
              className="form-input form-input-readonly"
              type="email"
              value={email}
              readOnly
              tabIndex={-1}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invite-password">Password</label>
            <input
              id="invite-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invite-confirm">Confirm Password</label>
            <input
              id="invite-confirm"
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button type="submit" className="btn-create-account" disabled={submitting}>
            {submitting ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Creating Account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
