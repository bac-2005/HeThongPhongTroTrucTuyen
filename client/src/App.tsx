// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Shared
import Header from './components/user/Header';
import Footer from './components/user/Footer';

// Auth
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Client Pages
import HomePage from './pages/user/HomePage';
import PostDetail from './pages/user/PostDetail';
import UserProfile from './pages/user/UserProfile';
import BookingForm from './components/user/BookingForm';
import MyBookingsPage from './pages/user/MyBookingsPage';
import MyContracts from './pages/user/MyContracts';
import BookingRequests from './pages/user/BookingRequests';
import ContractDetail from './pages/user/ContractDetail';
import MyAccount from './pages/user/MyAccount';

// Admin Pages
import Layout from './components/layout/Layout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import RoomsPage from './pages/admin/RoomsPage';
import BookingsPage from './pages/admin/BookingPage';
import ContractsPage from './pages/admin/ContractsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import MessagesPage from './pages/admin/MessagesPage';
import ContactsPage from './pages/admin/ContactsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Host Pages
import HomepageLayout from './components/HomePageLayout';
import Dashboard from './pages/host/Dashboard';
import Profile from './pages/host/Profile';
import UpdateProfile from './pages/host/UpdateProfile';
import CreateRoom from './pages/host/CreateRoom';
import UpdateRoom from './pages/host/UpdateRoom';
import CreateContract from './pages/host/CreateContract';
import ContractDetailHost from './pages/host/ContractDetail';
import RoomStatus from './pages/host/RoomStatus';
import RentalRequest from './pages/host/RentalRequest';
import ContractList from './pages/host/ContractList';
import RoomList from './pages/host/RoomList';
import ContractCheckout from './pages/user/ContractCheckout';
import ResultPage from './pages/user/ResultPage';
import UserReport from './pages/admin/UserReport';

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="user-report" element={<UserReport />} />
      </Route>

      {/* Host */}
      <Route
        path="/host/*"
        element={
          <ProtectedRoute requiredRoles={['host']}>
            <HomepageLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="update-profile" element={<UpdateProfile />} />
        <Route path="room-list" element={<RoomList />} />
        <Route path="create-room" element={<CreateRoom />} />
        <Route path="update-room/:id" element={<UpdateRoom />} />
        <Route path="room-status" element={<RoomStatus />} />
        <Route path="rental-request" element={<RentalRequest />} />
        <Route path="create-contract" element={<CreateContract />} />
        <Route path="contracts" element={<ContractList />} />
        <Route path="contracts/:id" element={<ContractDetailHost />} />
      </Route>

      {/* Client */}
      <Route
        path="/*"
        element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="posts/:id" element={<PostDetail />} />
                <Route path="user/:userId" element={<UserProfile />} />
                <Route path="booking/:roomId" element={<BookingForm />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="my-account" element={<MyAccount />} />
                <Route path="/payments/contract/:contractId" element={<ContractCheckout />} />
                <Route path="/success-page" element={<ResultPage />} />
                <Route
                  path="my-bookings"
                  element={
                    <ProtectedRoute requiredRoles={['tenant', 'host']}>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-contracts"
                  element={
                    <ProtectedRoute requiredRoles={['tenant', 'host']}>
                      <MyContracts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="booking-requests"
                  element={
                    <ProtectedRoute requiredRoles={['host']}>
                      <BookingRequests />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
