// const Statistics = require('../models/Statistics');
// const Room = require('../models/Room');
// const User = require('../models/User');
// const Booking = require('../models/Booking');
// const Contract = require('../models/Contract');

// // Thống kê cho Admin
// exports.getAdminStats = async (req, res) => {
//   try {
//     // Nếu bạn muốn tính tự động từ các collection
//     const totalUsers = await User.countDocuments();
//     const totalRooms = await Room.countDocuments();
//     const totalRevenueAggregate = await Booking.aggregate([
//       { $group: { _id: null, total: { $sum: "$price" } } }
//     ]);
//     const totalRevenue = totalRevenueAggregate[0]?.total || 0;
//     const totalBookings = await Booking.countDocuments();
//     const totalContracts = await Contract.countDocuments();
//     const newUsers = await User.countDocuments({ createdAt: { $gte: new Date(new Date() - 30*24*60*60*1000) } });
//     const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(new Date() - 7*24*60*60*1000) } });

//     res.status(200).json({
//       success: true,
//       data: {
//         totalUsers,
//         totalRooms,
//         totalRevenue,
//         totalBookings,
//         totalContracts,
//         newUsers,
//         activeUsers
//       }
//     });
//   } catch (error) {
//     console.error('getAdminStats error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Thống kê cho Host
// exports.getHostStats = async (req, res) => {
//   try {
//     const hostId = req.user.userId; // tham chiếu từ token

//     const totalRooms = await Room.countDocuments({ hostId });
//     const totalBookings = await Booking.countDocuments({ hostId });
//     const totalRevenueAggregate = await Booking.aggregate([
//       { $match: { hostId } },
//       { $group: { _id: null, total: { $sum: "$price" } } }
//     ]);
//     const totalRevenue = totalRevenueAggregate[0]?.total || 0;

//     res.status(200).json({
//       success: true,
//       data: {
//         totalRooms,
//         totalBookings,
//         totalRevenue
//       }
//     });
//   } catch (error) {
//     console.error('getHostStats error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Thống kê cho Tenant
// exports.getTenantStats = async (req, res) => {
//   try {
//     const tenantId = req.user.userId; // tham chiếu từ token

//     const totalBookings = await Booking.countDocuments({ tenantId });
//     const totalContracts = await Contract.countDocuments({ tenantId });
//     const totalSpentAggregate = await Booking.aggregate([
//       { $match: { tenantId } },
//       { $group: { _id: null, total: { $sum: "$price" } } }
//     ]);
//     const totalSpent = totalSpentAggregate[0]?.total || 0;

//     res.status(200).json({
//       success: true,
//       data: {
//         totalBookings,
//         totalContracts,
//         totalSpent
//       }
//     });
//   } catch (error) {
//     console.error('getTenantStats error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



// controllers/statsController.js
const User = require('../models/User');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Parse khoảng thời gian
 */
function parseRange(query) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 29 * 24 * 3600 * 1000);
  // chuẩn hoá về đầu/cuối ngày
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

/**
 * Helper: revenue aggregate trên Payment (paid & paidAt)
 * Với host: join Contract -> Room để lọc hostId
 */
function revenuePipeline({ from, to, hostId }) {
  const baseMatch = {
    paymentStatus: 'paid',                         // Payment.paymentStatus:contentReference[oaicite:6]{index=6}
    paidAt: { $gte: from, $lte: to }               // Payment.paidAt:contentReference[oaicite:7]{index=7}
  };

  // Nếu cần lọc theo host -> lookup Contract -> lookup Room
  if (!hostId) {
    return [
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },       // Payment.amount:contentReference[oaicite:8]{index=8}
          countPaid: { $sum: 1 }
        }
      }
    ];
  }

  return [
    { $match: baseMatch },
    { $lookup: {
        from: 'contracts',                         // Contract.roomId:contentReference[oaicite:9]{index=9}
        localField: 'contractId',
        foreignField: 'contractId',
        as: 'contract'
    }},
    { $unwind: '$contract' },
    { $lookup: {
        from: 'rooms',                             // Room.hostId:contentReference[oaicite:10]{index=10}
        localField: 'contract.roomId',
        foreignField: 'roomId',
        as: 'room'
    }},
    { $unwind: '$room' },
    { $match: { 'room.hostId': hostId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        countPaid: { $sum: 1 }
      }
    }
  ];
}

/**
 * Helper: time-series revenue theo tháng (12 tháng gần nhất)
 */
function monthlyRevenuePipeline({ hostId }) {
  const start = new Date();
  start.setMonth(start.getMonth() - 11, 1);
  start.setHours(0, 0, 0, 0);

  const base = [
    { $match: { paymentStatus: 'paid', paidAt: { $gte: start } } },
    {
      $addFields: {
        ym: { $dateToString: { format: '%Y-%m', date: '$paidAt' } }
      }
    }
  ];

  const hostJoin = [
    { $lookup: {
        from: 'contracts',
        localField: 'contractId',
        foreignField: 'contractId',
        as: 'contract'
    }},
    { $unwind: '$contract' },
    { $lookup: {
        from: 'rooms',
        localField: 'contract.roomId',
        foreignField: 'roomId',
        as: 'room'
    }},
    { $unwind: '$room' },
    { $match: { 'room.hostId': hostId } },
  ];

  const tail = [
    {
      $group: {
        _id: '$ym',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  return hostId ? [...base, ...hostJoin, ...tail] : [...base, ...tail];
}

/**
 * Helper: status breakdown Contracts/Bookings/Rooms
 */
async function statusBreakdown({ hostId }) {
  const matchRoom = hostId ? { hostId } : {};
  const [rooms, contracts, bookings] = await Promise.all([
    Room.aggregate([
      { $match: matchRoom },                       // Room.status:contentReference[oaicite:11]{index=11}
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    (async () => {
      if (!hostId) {
        return Contract.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } } // Contract.status:contentReference[oaicite:12]{index=12}
        ]);
      }
      // host: join room để lọc
      return Contract.aggregate([
        { $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: 'roomId',
            as: 'room'
        }},
        { $unwind: '$room' },
        { $match: { 'room.hostId': hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
    })(),
    (async () => {
      if (!hostId) {
        return Booking.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } } // Booking.status:contentReference[oaicite:13]{index=13}
        ]);
      }
      // host: lọc theo room.hostId
      return Booking.aggregate([
        { $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: 'roomId',
            as: 'room'
        }},
        { $unwind: '$room' },
        { $match: { 'room.hostId': hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
    })(),
  ]);

  return {
    rooms,
    contracts,
    bookings
  };
}

/**
 * ADMIN STATS — tổng quan toàn hệ thống
 * GET /api/stats/admin?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
exports.getAdminStats = async (req, res) => {
  try {
    const { from, to } = parseRange(req.query);

    // KPI tổng quát
    const [
      userCounts,
      roomCounts,
      contractCounts,
      bookingCounts,
      invoiceCounts,
      revenueAgg,
      revenueSeries
    ] = await Promise.all([
      // Users theo role/status
      User.aggregate([
        { $group: { _id: { role: '$role', status: '$status' }, count: { $sum: 1 } } }
      ]),                                                 // User.role/status:contentReference[oaicite:14]{index=14}

      Room.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),     // Room.status:contentReference[oaicite:15]{index=15}

      Contract.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]), // Contract.status:contentReference[oaicite:16]{index=16}

      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),  // Booking.status:contentReference[oaicite:17]{index=17}

      Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),  // Invoice.status:contentReference[oaicite:18]{index=18}

      Payment.aggregate(revenuePipeline({ from, to })),                          // Payment.amount/status/paidAt:contentReference[oaicite:19]{index=19}

      Payment.aggregate(monthlyRevenuePipeline({}))                              // 12 tháng gần nhất
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, countPaid: 0 };

    const breakdown = await statusBreakdown({}); // rooms/contracts/bookings breakdown

    return res.json({
      success: true,
      range: { from, to },
      kpis: {
        usersByRoleStatus: userCounts,
        roomsByStatus: roomCounts,
        contractsByStatus: contractCounts,
        bookingsByStatus: bookingCounts,
        invoicesByStatus: invoiceCounts,
        revenueTotal: revenue.totalRevenue || 0,
        paymentsPaidCount: revenue.countPaid || 0
      },
      charts: {
        revenueMonthly: revenueSeries
      },
      breakdown
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * HOST STATS — theo host đang đăng nhập
 * GET /api/stats/host?from=YYYY-MM-DD&to=YYYY-MM-DD
 * hostId lấy từ req.user.userId (user.role = 'host'):contentReference[oaicite:20]{index=20}
 */
exports.getHostStats = async (req, res) => {
  try {
    const { from, to } = parseRange(req.query);
    const hostId = req.user?.userId; // tuỳ middleware, đảm bảo gán userId vào token decode

    if (!hostId) {
      return res.status(401).json({ success: false, message: 'Không xác thực được host' });
    }

    // Đếm room của host
    const [roomCounts, contractCounts, bookingCounts, invoiceCounts, revenueAgg, revenueSeries] = await Promise.all([
      Room.aggregate([
        { $match: { hostId } },                                                       // Room.hostId:contentReference[oaicite:21]{index=21}
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Contract của các room thuộc host
      Contract.aggregate([
        { $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: 'roomId',
            as: 'room'
        }},
        { $unwind: '$room' },
        { $match: { 'room.hostId': hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Booking của các room thuộc host
      Booking.aggregate([
        { $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: 'roomId',
            as: 'room'
        }},
        { $unwind: '$room' },
        { $match: { 'room.hostId': hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Invoice của các room thuộc host
      Invoice.aggregate([
        { $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: 'roomId',
            as: 'room'
        }},
        { $unwind: '$room' },
        { $match: { 'room.hostId': hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Revenue của host (Payment -> Contract -> Room(hostId))
      Payment.aggregate(revenuePipeline({ from, to, hostId })),

      // Time-series 12 tháng cho host
      Payment.aggregate(monthlyRevenuePipeline({ hostId }))
    ]);

    const revenue = revenueAgg[0] || { totalRevenue: 0, countPaid: 0 };

    // Breakdown tổng hợp theo host (rooms, contracts, bookings)
    const breakdown = await statusBreakdown({ hostId });

    return res.json({
      success: true,
      range: { from, to },
      kpis: {
        roomsByStatus: roomCounts,
        contractsByStatus: contractCounts,
        bookingsByStatus: bookingCounts,
        invoicesByStatus: invoiceCounts,
        revenueTotal: revenue.totalRevenue || 0,
        paymentsPaidCount: revenue.countPaid || 0
      },
      charts: {
        revenueMonthly: revenueSeries
      },
      breakdown
    });
  } catch (err) {
    console.error('getHostStats error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
