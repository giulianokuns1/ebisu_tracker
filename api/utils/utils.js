const { MONTHLY_ID, SCHEDULED_ID } = require('../models/expenseType');
const moment = require('moment');

/**
 * Returns the due day formatted
 * @param expense
 * @param month
 * @return {string}
 */
exports.expenseFormattedDueDate = (expense, month) => {
    let dueDateResult;
    let options;
    let date;
    let currentMonth;
    options = { month: 'long' };
    date = new Date();
    currentMonth = !month ? date.toLocaleDateString(undefined, options) : month;
    if (currentMonth.length <= 1) {
        currentMonth = '0' + currentMonth;
    }
    if (expense.type_id === MONTHLY_ID) {
        options = { day: 'numeric' };
        if (expense.due_date_day) {
            dueDateResult = String(expense.due_date_day);
        } else {
            date = new Date(expense.due_date);
            dueDateResult = date.toLocaleDateString(undefined, options);
        }
        dueDateResult = currentMonth + ' ' + dueDateResult;
    } else if (expense.type_id === SCHEDULED_ID && expense.due_date_day) {
        options = { month: 'long', day: 'numeric' };
        date = new Date();
        date.setDate(expense.due_date_day);
        dueDateResult = date.toLocaleDateString(undefined, options);
    } else {
        options = { month: 'long', day: 'numeric' };
        date = new Date(expense.due_date);
        dueDateResult = date.toLocaleDateString(undefined, options);
    }
    return dueDateResult;
}
/**
 * Returns the due day formatted for grid
 * @param expense
 * @param month
 * @return {string}
 */
exports.expenseFormattedGridDueDate = (expense, month) => {
    let dueDateResult;
    let options;
    let date;
    let currentMonth;
    options = { month: '2-digit' };
    date = new Date();
    currentMonth = !month ? date.toLocaleDateString(undefined, options) : month;
    if (currentMonth.length <= 1) {
        currentMonth = '0' + currentMonth;
    }
    if ((expense.type_id === MONTHLY_ID || expense.type_id === SCHEDULED_ID) && expense.due_date_day) {
        options = { day: 'numeric' };
        date = new Date();
        date.setDate(expense.due_date_day);
        dueDateResult = date.toLocaleDateString(undefined, options);
    } else {
        options = { day: 'numeric' };
        date = new Date(expense.due_date);
        dueDateResult = date.toLocaleDateString(undefined, options);
    }
    dueDateResult = dueDateResult + '/' + currentMonth;
    return dueDateResult;
}
/**
 * Returns the next due day
 * @param dueDay
 * @param month
 * @return {string}
 */
exports.creditExpenseFormattedDueDate = (dueDay, month = null) => {
    let dueDateResult;
    let options;
    let date;
    let currentMonth;
    options = { month: 'long' };
    date = new Date();
    if (month !== undefined && month >= 1 && month <= 12) {
        date.setMonth(month - 1);
    }
    currentMonth = date.toLocaleDateString(undefined, options);
    options = { day: 'numeric' };
    date = new Date();
    date.setDate(dueDay);
    dueDateResult = date.toLocaleDateString(undefined, options);
    dueDateResult = currentMonth + ' ' + dueDateResult;
    return dueDateResult;
}
/**
 * Returns the next due day
 * @param day
 * @return {string}
 */
exports.getNextDay = (day) => {
    let today = moment();
    let nextDueDay;
    if (today.date() >= day) {
        nextDueDay = today.add(1, 'months').date(day);
    } else {
        nextDueDay = today.date(day);
    }
    return nextDueDay.format('YYYY-MM-DD');
}
/**
 * Auxiliary method to add a field to an object
 * @param obj
 * @param field
 * @param value
 * @return {*}
 */
exports.addFieldToObject = (obj, field, value) => {
    if (value) {
        obj[field] = value;
    }
    return obj;
}
/**
 * Auxiliary method to add fields to an object
 * @param obj
 * @param fields
 * @return {*}
 */
exports.addFieldsToObject = (obj, fields) => {
    Object.keys(fields).forEach((key) => {
        obj[key] = fields[key];
    });
    return obj;
};
/**
 * Returns the last month range based on the due day
 * @param day
 * @param month
 * @return {string}
 */
exports.getLastMonthBasedOnDueDay = (day, month = null) => {
    let currentDate = moment();
    let currentYear = currentDate.year();
    let currentMonth = (month !== null && month >= 1 && month <= 12) ? month - 1 : currentDate.month();

    let endDate = moment([currentYear, currentMonth, Math.min(day, moment([currentYear, currentMonth]).daysInMonth())]);
    let startDate = endDate.clone().subtract(1, 'months');

    if (currentDate.isBefore(endDate)) {
        endDate = startDate;
        startDate = startDate.clone().subtract(1, 'months');
    }

    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
    };
};

/**
 * Returns the last year month range
 * @param month
 * @return {{endDate, startDate}}
 */
exports.getLastYearMonthRange = (month = null) => {
    const endDate = moment();
    if (month) {
        endDate.setMonth(month - 1);
    }
    const startDate = endDate.clone().subtract(1, 'years');
    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
    };
};
/**
 * Returns the last month range based on the due day
 * @param month
 * @return {{endDate, startDate}}
 */
exports.getMonthMonthRange = (month) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let currentMonth;
    if (month !== undefined && month >= 1 && month <= 12) {
        currentMonth = month - 1;
    } else {
        currentMonth = currentDate.getMonth();
    }
    const startYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const startMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastDayOfStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(startYear, startMonth, lastDayOfStartMonth);
    const formatDate = (date) => date.toISOString().substring(0, 10);
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};
/**
 * Returns the next month (1-based: 1-12)
 * @param {String|Number} month
 * @return {Number}
 */
exports.getNextMonth = (month) => {
    const currentMonth = parseInt(month, 10);
    // If December (12), wrap around to January (1)
    if (currentMonth === 12) {
        return 1;
    }
    return currentMonth + 1;
};
exports.getMonthText = (month) => {
    const currentMonth = parseInt(month, 10);
    return currentMonth === 11 ? 'November' : currentMonth === 10 ? 'October' : currentMonth === 9 ? 'September' : currentMonth === 8 ? 'August' : currentMonth === 7 ? 'July' : currentMonth === 6 ? 'June' : currentMonth === 5 ? 'May' : currentMonth === 4 ? 'April' : currentMonth === 3 ? 'March' : currentMonth === 2 ? 'February' : currentMonth === 1 ? 'January' : 'December';
};
