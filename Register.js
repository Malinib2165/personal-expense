// SignupPage.js
import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./auth.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerAPI } from "../../utils/ApiRequest";
import axios from "axios";

const Register = () => {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(localStorage.getItem('user')){
      navigate('/');
    }
  }, [navigate]);

  const particlesInit = useCallback(async (engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);

  const [values, setValues] = useState({
    name : "",
    email : "",
    password : "",

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
  }

  const handleChange = (e) => {
    setValues({...values , [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = values;
    setLoading(true);

    try {
      const { data } = await axios.post(registerAPI, {
        name,
        email,
        password,
      });

      if (data.success === true) {
        toast.success(data.message || "Registration successful! Please verify your email.", toastOptions);
        // Redirect to OTP verification page
        navigate("/verify-otp", { state: { userId: data.userId, email: data.email } });
      } else {
        toast.error(data.message || "Registration failed", toastOptions);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration request failed";
      toast.error(msg, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="authShell" style={{ position: 'relative', overflow: 'hidden' }}>
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
          position: 'absolute',
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Container className="mt-5 authPage" style={{position: 'relative', zIndex: "2 !important", color:"white !important"}}>
      <Row>
        <Col md={{ span: 6, offset: 3 }} className="authCard">
          <div className="text-center mb-3">
            <span className="authEyebrow">Smart Finance</span>
          </div>
          <div className="text-center mb-3">
            <div className="moneyBadge mx-auto">
              <AccountBalanceWalletIcon sx={{ fontSize: 30, color: "white" }} />
            </div>
          </div>
          <h2 className="text-white text-center mb-2">Create Your Account</h2>
          <p className="text-center text-light opacity-75 mb-4">Start your expense journey with a premium, secure experience.</p>
          <Form>
            <Form.Group controlId="formBasicName" className="mt-3" >
              <Form.Label className="text-white">Name</Form.Label>
              <Form.Control type="text"  name="name" placeholder="Full name" value={values.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formBasicEmail" className="mt-3">
              <Form.Label className="text-white">Email address</Form.Label>
              <Form.Control type="email"  name="email" placeholder="Enter email" value={values.email} onChange={handleChange}/>
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mt-3">
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control type="password"  name="password" placeholder="Password" value={values.password} onChange={handleChange} />
            </Form.Group>
            <div style={{width: "100%", display: "flex" , alignItems:"center", justifyContent:"center", flexDirection: "column"}} className="mt-4">
              <Link to="/forgotPassword" className="text-white lnk" >Forgot Password?</Link>

              <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Signup"}
                </Button>

              <p className="mt-3" style={{color: "#9d9494"}}>Already have an account? <Link to="/login" className="text-white lnk" >Login</Link></p>
            </div>
          </Form>
        </Col>
      </Row>
    <ToastContainer />
    </Container>
    </div>
    </>
  )
}

export default Register