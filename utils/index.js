exports.filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (allowFields.includes(key)) newObj[key] = obj[key];
    });
    return newObj;
};
