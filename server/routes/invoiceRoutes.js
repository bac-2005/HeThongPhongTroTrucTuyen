// routes/invoiceRoutes.js
const express = require('express');
const {
  getInvoices,
  getInvoicesByContract,
  getInvoicesByUser,
  createInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

const router = express.Router();

// GET all (có filter/pagination qua query)
router.get('/', getInvoices);

// GET by contractId
router.get('/contract/:contractId', getInvoicesByContract);

// GET by userId
router.get('/user/:userId', getInvoicesByUser);

// CREATE
router.post('/', createInvoice);

router.delete('/:invoiceId', deleteInvoice);

module.exports = router;
