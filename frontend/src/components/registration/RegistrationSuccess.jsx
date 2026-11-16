import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import "./RegistrationSuccess.css";

const RegistrationSuccess = () => {
  const location = useLocation();
  const message =
    location.state?.message || "Registration submitted successfully!";

  return (
    <main className="registration-success">
      <section
        className="registration-success__card"
        aria-labelledby="registration-success-title"
      >
        <div className="registration-success__icon" aria-hidden="true">
          <CheckCircle2 size={38} strokeWidth={1.8} />
        </div>
        <p className="registration-success__eyebrow">Request received</p>
        <h1 id="registration-success-title">Registration submitted</h1>
        <p className="registration-success__message">{message}</p>

        <div className="registration-success__status" role="status">
          <Clock3 size={18} aria-hidden="true" />
          <span>Awaiting GN officer verification</span>
        </div>

        <div className="registration-success__next">
          <div className="registration-success__next-icon" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2>What happens next?</h2>
            <p>
              Your details will be reviewed by your Grama Niladhari officer.
              We&apos;ll send you an SMS when your account has been verified.
            </p>
          </div>
        </div>

        <Link to="/" className="registration-success__home">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default RegistrationSuccess;
