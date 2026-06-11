import React from 'react'
import { Container } from 'react-bootstrap'
const Spinner = () => {
  return (
    <Container className="mt-5"  style={{position: 'relative', zIndex: "2 !important", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <img className="mt-5" src="https://media.tenor.com/JLY0SR_EudEAAAAi/loading-loading-gif.gif" alt="loading" width="250px" height="250px"/>
    </Container>
  )
}

export default Spinner