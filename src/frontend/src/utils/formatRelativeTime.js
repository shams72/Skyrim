export const formatRelativeTime = (isoDate) => {
    const now = new Date();
    const pastDate = new Date(isoDate);
    const diffInMilliseconds = now - pastDate;

    const minutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (months > 0) return rtf.format(-months, 'month');
    if (weeks > 0) return rtf.format(-weeks, 'week');
    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');

    return 'Just now';
};
