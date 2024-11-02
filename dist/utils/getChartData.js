export const getChartData = ({ length, docArr, today, property }) => {
    const data = new Array(length).fill(0);
    docArr.forEach(i => {
        const creationDate = i.createdAt;
        const monthsDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthsDiff < length) {
            data[length - monthsDiff - 1] += property ? i[property] : 1;
        }
    });
    return data;
};
