import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SetTargetModal = ({ show, handleClose, currentTarget, onSave }) => {
  const [targetAmount, setTargetAmount] = useState(currentTarget || 0);

  useEffect(() => {
    setTargetAmount(currentTarget || 0);
  }, [currentTarget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(parseFloat(targetAmount));
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Set Savings Target</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Savings Goal Amount ($)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter target amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              autoFocus
              required
              min="1"
            />
            <Form.Text className="text-muted">
              We'll celebrate once your total balance reaches this goal!
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Target
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SetTargetModal;