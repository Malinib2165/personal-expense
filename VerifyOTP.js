// VerifyOTP.js
import { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./auth.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyOTPAPI, resendOTPAPI } from "../../utils/ApiRequest";
import axios from "axios";

const VerifyOTP = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const { userId, email } = location.state || {};

  useEffect(() => {
    // Redirect to register if userId is not provided
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);

  const [values, setValues] = useState({
    otp: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const { otp } = values;

    if (!otp) {
      toast.error("Please enter OTP", toastOptions);
      return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
      toast.error("OTP must be 6 digits", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(verifyOTPAPI, {
        userId,
        otp,
      });

      if (data.success) {
        toast.success("Email verified successfully! Redirecting to login...", toastOptions);
        setTimeout(() => {
          navigate("/login", { state: { email } });
        }, 2000);
      } else {
        toast.error(data.message || "OTP verification failed", toastOptions);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed";
      toast.error(msg, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();

    if (timer > 0) {
      toast.error(`Please wait ${timer} seconds before resending OTP`, toastOptions);
      return;
    }

    setResendLoading(true);

    try {
      const { data } = await axios.post(resendOTPAPI, {
        userId,
      });

      if (data.success) {
        toast.success("OTP resent successfully!", toastOptions);
        setTimer(60); // 60 seconds timer
        setValues({ otp: "" });
      } else {
        toast.error(data.message || "Failed to resend OTP", toastOptions);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP";
      toast.error(msg, toastOptions);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: {
              image: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            },
            fpsLimit: 60,
            particles: {
              number: {
                value: 160,
                density: {
                  enable: true,
                  value_area: 800,
                },
              },
              color: {
                value: ["#6366f1", "#a855f7", "#ec4899", "#ffcc00"],
              },
              shape: {
                type: 'circle',
              },
              opacity: {
                value: { min: 0.1, max: 0.6 },
                animation: { enable: true, speed: 1, sync: false },
              },
              size: {
                value: { min: 2, max: 6 },
                animation: { enable: true, speed: 2, sync: false },
              },
              shadow: {
                enable: true,
                color: "#ffffff",
                blur: 8,
              },
              links: {
                enable: false,
              },
              move: {
                enable: true,
                speed: 0.6,
                direction: "none",
                random: true,
                straight: false,
                attract: { enable: true, rotateX: 600, rotateY: 1200 },
              },
              life: {
                duration: {
                  sync: false,
                  value: 3,
                },
                count: 0,
                delay: {
                  random: {
                    enable: true,
                    minimumValue: 0.5,
                  },
                  value: 1,
                },
              },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            zIndex: -1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <Container className="mt-5" style={{ position: 'relative', zIndex: "2 !important", color: "white !important" }}>
          <Row>
            <h1 className="text-center">
              <LockIcon sx={{ fontSize: 40, color: "white" }} className="text-center" />
            </h1>
            <h1 className="text-center text-white">Email Verification</h1>
            <Col md={{ span: 6, offset: 3 }}>
              <h2 className="text-white text-center mt-5">Enter OTP</h2>
              <p className="text-center" style={{ color: "#9d9494" }}>
                We've sent a verification code to <strong>{email}</strong>
              </p>
              <Form>
                <Form.Group controlId="formOTP" className="mt-3">
                  <Form.Label className="text-white">One-Time Password (OTP)</Form.Label>
                  <Form.Control
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={values.otp}
                    onChange={handleChange}
                    maxLength="6"
                  />
                </Form.Group>
                <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }} className="mt-4">
                  <Button
                    type="submit"
                    className="text-center mt-3 btnStyle"
                    onClick={!loading ? handleVerifyOTP : null}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <p style={{ color: "#9d9494", marginBottom: "10px" }}>
                      Didn't receive the code?
                    </p>
                    <Button
                      variant="outline-light"
                      onClick={!resendLoading ? handleResendOTP : null}
                      disabled={resendLoading || timer > 0}
                      style={{ marginTop: "10px" }}
                    >
                      {resendLoading ? "Resending..." : timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                    </Button>
                  </div>
                </div>
              </Form>
            </Col>
          </Row>
          <ToastContainer />
        </Container>
      </div>
    </>
  );
};

export default VerifyOTP;
