const l = abp.localization.getResource('Dispatcher');
$(function () {
    abp.log.debug('Main.js initialized!');
});

const getDate = function (str) {
    if (str === null || str === "0" || str.includes("0001") || !str) return "Not Available";
    return (new Date(str)).toLocaleString("en-NZ", {
        year: "numeric",
        month: "long",
        day: "2-digit",
    });
};

const getSearch = function (param) {
    let params = new URLSearchParams(location.search);
    return params.get(param);
}

const promptError = function (message) {
    Swal.fire({
        title: 'Error',
        text: l(message),
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
    });
}

const promptOK = function (message) {
    Swal.fire({
        title: 'Success',
        text: l(message),
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
    });
}