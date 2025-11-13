import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { roomService } from '../services/roomService';
import type { UserStats } from '../types/user';
import type { RoomStats } from '../types/room';

export const useStats = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { 'Admin': 0, 'Chủ trọ': 0, 'Người dùng': 0 }
  });
  
  const [roomStats, setRoomStats] = useState<RoomStats>({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    byType: { single: 0, shared: 0, apartment: 0, studio: 0 },
    averagePrice: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [userStatsData, roomStatsData] = await Promise.all([
          userService.getUserStats(),
          roomService.getRoomStats()
        ]);

        setUserStats(userStatsData);
        setRoomStats(roomStatsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { userStats, roomStats, loading };
};
