// LoginPage.js
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./auth.css";
import axios from "axios";
import { loginAPI } from "../../utils/ApiRequest";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  const [values, setValues] = useState({
    email: "",
    password: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = values;
    setLoading(true);

    try {
      const { data } = await axios.post(loginAPI, {
        email,
        password,
      });

      if (data.success === true) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
        toast.success(data.message, toastOptions);
      } else {
        toast.error(data.message || "Login failed", toastOptions);
      }
    } catch (err) {
      const response = err?.response;
      
      // Check if account verification is required
      if (response?.status === 403 && response?.data?.requiresVerification) {
        toast.error(response.data.message || "Please verify your email first", toastOptions);
        setTimeout(() => {
          navigate("/verify-otp", { state: { userId: response.data.userId, email } });
        }, 2000);
      } else {
        const msg =
          response?.data?.message ||
          err?.message ||
          "Login request failed";
        toast.error(msg, toastOptions);
      }
    } finally {
      setLoading(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);

  return (
    <div className="authShell" style={{ position: "relative", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            image: "linear-gradient(135deg, #07111f 0%, #0f172a 45%, #111827 100%)",
          },
          fpsLimit: 60,
          fullScreen: { enable: false, zIndex: -1 },
          particles: {
            number: { value: 70, density: { enable: true, width: 800, height: 800 } },
            color: { value: ["#facc15", "#a78bfa", "#38bdf8", "#f472b6"] },
            shape: {
              type: "char",
              character: {
                value: ["₹", "₹", "💸", "💰", "₨"],
                font: "Arial",
                style: "normal",
                weight: "400",
              },
            },
            opacity: {
              value: { min: 0.18, max: 0.65 },
              animation: { enable: true, speed: 0.6, sync: false },
            },
            size: {
              value: { min: 18, max: 30 },
              animation: { enable: true, speed: 0.8, sync: false },
            },
            links: { enable: false },
            move: {
              enable: true,
              speed: 1.1,
              direction: "top-right",
              random: true,
              straight: false,
              outModes: { default: "out" },
              attract: { enable: true, rotateX: 600, rotateY: 1200 },
            },
            life: {
              duration: { sync: false, value: 8 },
              count: 0,
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <Container
        className="mt-5 authPage"
        style={{ position: "relative", zIndex: "2 !important" }}
      >
        <Row>
          <Col md={{ span: 6, offset: 3 }} className="authCard">
            <div className="text-center mb-3">
              <span className="authEyebrow">Fintech Access</span>
            </div>
            <div className="text-center mb-3">
              <div className="moneyBadge mx-auto">
                <AccountBalanceWalletIcon sx={{ fontSize: 30, color: "white" }} />
              </div>
            </div>
            <h2 className="text-white text-center mb-2">Welcome Back</h2>
            <p className="text-center text-light opacity-75 mb-4">Track expenses, manage cash flow, and stay in control.</p>
            <Form>
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                />
              </Form.Group>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
                className="mt-4"
              >
                <Link to="/forgotPassword" className="text-white lnk">
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Signin…" : "Login"}
                </Button>

                <p className="mt-3" style={{ color: "#9d9494" }}>
                  Don't Have an Account?{" "}
                  <Link to="/register" className="text-white lnk">
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
