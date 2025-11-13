const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contractRoutes = require('./routes/contractRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const requestRoutes = require('./routes/requestRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const roleRoutes = require('./routes/roleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const app = express();
app.use(cors());
// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'mongodb+srv://admin:123456abcd@datn-quanlyphongtro.jypyxol.mongodb.net/phongtro?retryWrites=true&w=majority&appName=DATN-quanlyphongtro',
//   credentials: true
// }));



// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);
app.use('/contracts', contractRoutes);
app.use('/payments', paymentRoutes);
app.use('/messages', messageRoutes);
app.use('/requests', requestRoutes);
app.use('/approvals', approvalRoutes);
app.use('/statistics', statisticRoutes);
app.use('/transactions', transactionRoutes);
app.use('/search', searchRoutes);
app.use('/reviews', reviewRoutes);
app.use('/reports', reportRoutes);
app.use('/roles', roleRoutes);
app.use('/notifications', notificationRoutes);
app.use('/invoices', invoiceRoutes);
// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


// Error Handler Middleware
app.use(errorHandler);

const PORT = 3000;
// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;