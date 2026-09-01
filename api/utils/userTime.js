const getParts = (timezone, options) => new Intl.DateTimeFormat('en', { timeZone: timezone || 'UTC', ...options }).formatToParts(new Date());

exports.getCurrentPeriod = (timezone) => {
    const parts = getParts(timezone, { month: 'numeric', year: 'numeric' });
    return {
        month: Number(parts.find((part) => part.type === 'month')?.value),
        year: Number(parts.find((part) => part.type === 'year')?.value),
    };
};

exports.getCurrentDate = (timezone) => {
    const parts = getParts(timezone, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const value = (type) => parts.find((part) => part.type === type)?.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
};

exports.getPeriod = (timezone, offset = 0) => {
    const { month, year } = exports.getCurrentPeriod(timezone);
    const date = new Date(year, month - 1 - offset, 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
};

exports.getMonthFromDate = (date, timezone) => Number(new Intl.DateTimeFormat('en', { timeZone: timezone || 'UTC', month: 'numeric' }).format(new Date(date)));
