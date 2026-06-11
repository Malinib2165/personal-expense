// NavbarComponent.js
import React, { useCallback, useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import "./style.css";
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import SetTargetModal from './SetTargetModal';

const Header = () => {
  
const navigate = useNavigate();

  const handleShowLogin = () =>{
    navigate("/login");
  }

  const [user, setUser] = useState();
  const [showTargetModal, setShowTargetModal] = useState(false);

  const handleUpdateTarget = (newTarget) => {
    const updatedUser = { ...user, savingsTarget: newTarget, hasCelebratedTarget: false };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    // Note: Add an API call here to persist this in your MongoDB
  };

  useEffect(() => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        
        setUser(user);
        
      }


    
  }, []);

  const handleShowLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  }

  const particlesInit = useCallback(async (engine) => {
    // console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);
  
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
    <Navbar className="navbarCSS" collapseOnSelect expand="lg" style={{position: 'relative', zIndex: "2 !important"}}>
      {/* <Navbar className="navbarCSS" collapseOnSelect expand="lg" bg="dark" variant="dark"> */}
        <Navbar.Brand href="/" className="text-white navTitle">Expense Tracker</Navbar.Brand>
        <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`,
              }}
            ></span>
          </Navbar.Toggle>
        <div>
        <Navbar.Collapse id="responsive-navbar-nav" style={{color: "white"}}>
          {user ? (
            <>
            <Nav>
                <Button variant="outline-light" onClick={() => setShowTargetModal(true)} className="ml-2 me-2">Set Target</Button>
                <Button variant="primary" onClick={handleShowLogout} className="ml-2">Logout</Button>
              </Nav>
            </>
          ) : (

            <>
              <Nav>
                <Button variant="primary" onClick={handleShowLogin} className="ml-2">Login</Button>
              </Nav>
            </>
          )}
          
        </Navbar.Collapse>
      </div>
      </Navbar>
      <SetTargetModal 
        show={showTargetModal} 
        handleClose={() => setShowTargetModal(false)} 
        currentTarget={user?.savingsTarget} 
        onSave={handleUpdateTarget} 
      />
      </div>
    </>
  );
};

export default Header;
