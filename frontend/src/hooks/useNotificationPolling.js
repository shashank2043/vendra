import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchNotifications } from '../features/notifications/notificationSlice';

export const useNotificationPolling = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const triggerFetch = () => {
      dispatch(fetchNotifications({ role: user.role, userId: user.id }));
    };

    // Immediate fetch
    triggerFetch();

    // Poll every 15 seconds
    const intervalId = setInterval(triggerFetch, 15000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated, user]);
};

export default useNotificationPolling;
