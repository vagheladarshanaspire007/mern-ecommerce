# Real-Time Notifications Manual Test

1. Start the backend and frontend locally, then open two browser tabs.
2. In tab one, sign in as an admin user and navigate to the order management flow.
3. In tab two, sign in as the customer who owns that order.
4. Update the order status from the admin tab.
5. Confirm the customer tab shows a toast within 2 seconds with:
   - the order ID
   - a status badge for `pending`, `processing`, `shipped`, `delivered`, or `cancelled`
6. Confirm the navbar unread badge increments by 1 for each `order:status-updated` event.
7. Visit `/orders` in the customer tab and confirm the unread badge resets to 0.
8. Navigate away from `/orders` and back again, then trigger another order update.
9. Confirm only one toast appears per event, verifying `socket.off()` cleanup prevents duplicate listeners.
