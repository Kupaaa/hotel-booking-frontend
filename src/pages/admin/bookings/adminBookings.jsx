const bookings =[
    {
      "bookingId": 12345,
      "roomId": 101,
      "email": "customer1@example.com",
      "userType": "customer",
      "status": "pending",
      "reason": "Vacation",
      "start": "2024-10-01T00:00:00Z",
      "end": "2024-10-05T00:00:00Z",
      "notes": "No special requests",
      "timestamp": "2024-10-01T09:00:00Z"
    },
    {
      "bookingId": 12346,
      "roomId": 102,
      "email": "customer2@example.com",
      "userType": "customer",
      "status": "confirmed",
      "reason": "Business Trip",
      "start": "2024-11-15T00:00:00Z",
      "end": "2024-11-20T00:00:00Z",
      "notes": "Early check-in requested",
      "timestamp": "2024-11-01T10:15:00Z"
    },
    {
      "bookingId": 12347,
      "roomId": 103,
      "email": "admin@example.com",
      "userType": "admin",
      "status": "cancelled",
      "reason": "Maintenance",
      "start": "2024-12-05T00:00:00Z",
      "end": "2024-12-10T00:00:00Z",
      "notes": "Room renovation scheduled",
      "timestamp": "2024-12-01T14:30:00Z"
    }
  ]
  



export default function AdminBookings() {
  return (
    <div>
      <table>
        <thead>
          <tr className="bg-slate-600">
            <th>Booking ID</th>
            <th>Room ID</th>
            <th>Email</th>
            <th>User Type</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
        {
    bookings.map( 
        (booking)=>{
            return(
                <tr key ={booking.bookingId}>
                    <td>
                        {booking.bookingId}
                    </td>
                    <td>
                        {booking.roomId}
                    </td>
                    <td>
                        {booking.email}
                    </td>
                    <td>
                        {booking.userType}
                    </td>
                    <td>
                        {booking.status}
                    </td>
                    <td>
                        {booking.start}
                    </td>
                    <td>
                        {booking.end}
                    </td>
                    <td>
                        {booking.notes}
                    </td>
                    <td>
                        {booking.timestamp}
                    </td>
                </tr>
            )
        
    })
}
        </tbody>
      </table>
    </div>
  );
}