const Role = require('../models/Role');
const User = require('../models/User');

// Gán vai trò
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, status } = req.body;

    // Kiểm tra userId có tồn tại không
    const user = await User.findOne({ userId }); // tìm theo userId custom
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Tạo role mới
    const newRole = await Role.create({
      userId,
      role,
      status
    });

    res.status(201).json({ success: true, data: newRole });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy tất cả roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().lean();

    // Lấy thông tin user tương ứng qua userId string
    const userIds = roles.map(r => r.userId);
    const users = await User.find({ userId: { $in: userIds } }).lean();

    const rolesWithUser = roles.map(role => ({
      ...role,
      userInfo: users.find(u => u.userId === role.userId) || null
    }));

    res.status(200).json({ success: true, data: rolesWithUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Tạo vai trò mới
// exports.createRole = async (req, res) => {
//   try {
//     const { userId, role, status } = req.body;

//     // Kiểm tra userId tồn tại
//     const userExists = await User.findOne({ userId });
//     if (!userExists) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Lấy toàn bộ roleId hiện có và tìm số lớn nhất
//     const allRoles = await Role.find({}, { roleId: 1, _id: 0 });
//     let maxNumber = 0;

//     allRoles.forEach(r => {
//       const num = parseInt(r.roleId.replace('role', ''), 10);
//       if (!isNaN(num) && num > maxNumber) {
//         maxNumber = num;
//       }
//     });

//     // Sinh roleId mới
//     const newRoleId = `role${String(maxNumber + 1).padStart(3, '0')}`;

//     // Tạo role mới
//     const newRole = await Role.create({ roleId: newRoleId, userId, role, status });

//     res.status(201).json({
//       success: true,
//       message: 'Role created successfully',
//       data: newRole
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
// Tạo vai trò mới
exports.createRole = async (req, res) => {
  try {
    const { userId, role, status } = req.body;

    // Kiểm tra userId tồn tại
    const userExists = await User.findOne({ userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Tạo role mới (roleId tự sinh từ model)
    const newRole = await Role.create({
      userId,
      role,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// Lấy vai trò của user qua userId (string) trong bảng User
exports.getUserRole = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm roles có userId khớp string
    const roles = await Role.find({ userId: userId });

    if (!roles.length) {
      return res.status(404).json({
        success: false,
        message: `No roles found for userId '${userId}'`
      });
    }

    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Cập nhật vai trò theo roleId
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { roleId: req.params.id }, // tìm theo roleId
      req.body,
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Hủy vai trò theo roleId
exports.revokeRole = async (req, res) => {
  try {
    const role = await Role.findOneAndDelete({ roleId: req.params.id });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Thống kê vai trò
exports.getRoleStats = async (req, res) => {
  try {
    const stats = await Role.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};