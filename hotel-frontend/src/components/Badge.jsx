export default function Badge({ status }) {
    const map = {
        Available: 'green',
        Occupied: 'red',
        Maintenance: 'yellow',
        Confirmed: 'blue',
        'Checked Out': 'gray',
        Cancelled: 'red',
        Pending: 'yellow',
        Paid: 'green',
        Active: 'green',
        Inactive: 'gray',
        Standard: 'blue',
        Deluxe: 'purple',
        Suite: 'yellow',
        Presidential: 'yellow',
    };
    const color = map[status] || 'gray';
    return <span className={`badge badge-${color}`}>{status}</span>;
}
