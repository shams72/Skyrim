import { connections } from '../data/connections';

// takes in a path and returns the number of days it would take to walk that path

// might be better to handle this on the backend and return the path and distances
export const calculateWalkingDays = (path) => {
    if (!path || path.length === 0) return null;

    const totalDistance = path.reduce((sum, segment) => {
        const connection = connections.find(
            (conn) =>
                (conn.parent === segment.parent &&
                    conn.child === segment.child) ||
                (conn.parent === segment.child && conn.child === segment.parent)
        );
        return sum + (connection?.dist || 0);
    }, 0);

    return Math.ceil(totalDistance);
};
