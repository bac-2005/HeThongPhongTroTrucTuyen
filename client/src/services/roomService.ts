// roomService.ts - Add method to get room approvals

import { buildHeaders } from "../utils/config";


const API_BASE = 'http://localhost:3000';

export const roomService = {
  // ... existing methods ...

  async getRoomApprovals() {
    try {
      const response = await fetch(`${API_BASE}/approvals?limit=9999`, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error('Failed to fetch room approvals');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching room approvals:', error);
      return [];
    }
  },

  async getRoomsAdmin(filters: any = {}) {
    try {
      let url = `${API_BASE}/rooms`;
      const queryParams = new URLSearchParams();

      if (filters.roomType && filters.roomType !== 'all') {
        queryParams.append('roomType', filters.roomType);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.searchTerm) {
        queryParams.append('q', filters.searchTerm);
      }
      queryParams.append("limit", "9999")

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async getRooms(filters: any = {}) {
    try {
      let url = `${API_BASE}/rooms/searchRoom`;
      const queryParams = new URLSearchParams();

      if (filters.roomType && filters.roomType !== 'all') {
        queryParams.append('roomType', filters.roomType);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.searchTerm) {
        queryParams.append('q', filters.searchTerm);
      }
      queryParams.append("limit", "9999")

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async getRoomById(roomId: string) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`, { headers: buildHeaders() });
      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  async getRoomStats() {
    try {
      const rooms = await this.getRooms();
      const approvals = await this.getRoomApprovals();

      const stats = {
        total: rooms.data.pagination.totalRooms,
        available: rooms.data.rooms.filter((room: any) => room.status === 'available').length,
        rented: rooms.data.rooms.filter((room: any) => room.status === 'rented').length,
        maintenance: rooms.data.rooms.filter((room: any) => room.status === 'maintenance').length,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      // Count approval statuses
      const approvalCounts = approvals.data.reduce((acc: any, approval: any) => {
        acc[approval.approvalStatus] = (acc[approval.approvalStatus] || 0) + 1;
        return acc;
      }, {});

      stats.pending = approvalCounts.pending || 0;
      stats.approved = approvalCounts.approved || 0;
      stats.rejected = approvalCounts.rejected || 0;

      return stats;
    } catch (error) {
      console.error('Error calculating room stats:', error);
      return {
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }
  },

  async updateApprovalStatus(roomId: string, status: string) {
    try {
      // First check if approval exists
      const approvals = await this.getRoomApprovals();
      const existingApproval = approvals.data.find((approval: any) => approval.roomId === roomId);

      if (existingApproval) {
        // Update existing approval
        const response = await fetch(`${API_BASE}/approvals/${existingApproval.approvalId}`, {
          method: 'PUT',
          headers: buildHeaders(),
          body: JSON.stringify({
            ...existingApproval,
            status: status,
            approvalDate: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update approval status');
        }
        return await response.json();
      } else {
        // Create new approval
        const response = await fetch(`${API_BASE}/approvals`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({
            approvalId: `A${Date.now()}`,
            roomId: roomId,
            status: status,
            note: status === 'approved' ? 'Phòng đạt yêu cầu.' : 'Phòng không đạt yêu cầu.',
            requestedBy: 'U001'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create approval status');
        }
        return await response.json();
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
  },

  async updateRoom(roomId: string, updates: any) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update room');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async deleteRoom(roomId: string) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }
};