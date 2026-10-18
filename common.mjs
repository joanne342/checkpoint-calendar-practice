const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

const occurrenceNumbers = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5
};

export function getDateForOccurrence(year, month, weekday, occurrence) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const matchingDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
        if (new Date(year, month, day).getDay() === weekday) {
            matchingDays.push(day);
        }
    }

    if (occurrence === "last") {
        return matchingDays[matchingDays.length - 1];
    }

    const occurrenceNumber = occurrenceNumbers[occurrence];

    if (!occurrenceNumber) {
        throw new Error(`Invalid occurrence: ${occurrence}`);
    }

    return matchingDays[occurrenceNumber - 1];
}

export function getCommemorativeDayDate(day, year) {
    const month = months.indexOf(day.monthName);
    const weekday = weekdays.indexOf(day.dayName);

    if (month === -1 || weekday === -1) {
        throw new Error(`Invalid month or weekday for ${day.name}`);
    }

    return getDateForOccurrence(
        year,
        month,
        weekday,
        day.occurrence
    );
}

export function getDaysForDate(days, year, month, date) {
    return days.filter((day) => {
        if (months.indexOf(day.monthName) !== month) {
            return false;
        }

        return getCommemorativeDayDate(day, year) === date;
    });
}
