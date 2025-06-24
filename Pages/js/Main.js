const l = abp.localization.getResource('Dispatcher');
const isAdmin = abp.auth.isGranted("AbpIdentity.Roles.ManagePermissions");
const detailPage = abp.appPath + 'Works/WorkDetail';
$(function () {
    abp.log.debug('Main.js initialized!');
    $(".lpx-brand-logo").html("BYDH Construction Ltd");
});

const workData = {
    serverSide: true,
    paging: true,
    order: [[9, "asc"]],
    searching: true,
    scrollX: true,
    columnDefs: [
        {
            title: l('Order'),
            data: "orderInfo",
            className: "freeze",
            render: function (data) {
                let index = window.hintIndex;
                return `<div class="left"><span class="dot_${data[index]}">$</span><a href="${detailPage}?id=${data[1]}" >${data[0]}</br>${isAdmin ? data[2] : data[3]}</a></div>`;
            }
        },
        {
            title: l('Location'),
            data: "workLocation",
            className: "freeze freeze_2",
            render: function (data) {
                let location = data.address;
                return formatLocation(location);
            }
        },
        {
            title: l('Priority'),
            data: "priorityCode",
            render: function (data) {
                return `<div class="left">${data}</div>`
            }
        },
        {
            title: l('Tel'),
            data: "tel",
            render: function (data) {
                return `<a href="tel:${data}">${data}</a>`;
            }
        },
        {
            title: l('IssuedActual'),
            data: "issuedActual",
            render: function (data) {
                return `<div class="left padding-left-10">${getDate(data)}</div>`;
            }
        },
        {
            title: l('AppointmentTime'),
            data: "appointmentTime",
            render: function (data) {
                return `<div class="left padding-left-10">${getDate(data)}</div>`;
            }
        },
        {
            title: l('Due Next'),
            data: "workStatusInfo",
            render: function (data) {
                return `<div class="left">Attending: ${getDate(data.attendingDate)}</br>Completing: ${getDate(data.completingDate)}<span data-color="${data.color}"></span></div>`;
            }
        },
        {
            title: l('Requested For'),
            data: "workRequesterName"
        },
        {
            title: l('Status'),
            data: "status",
            render: function (data) {
                let progress = `${data.progress}`;
                let rest = data.total - data.elapsed;
                return `
                    <div>${data.status}</div>
                    <div class="progress">
                        <p style="position: absolute;width: 66px;">${rest} Days</p>
                        <div class="progress-bar progress-bar-striped" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>`;
            }
        },
        {
            title: l('Edit'),
            className: "edit",
            orderable: false,
            rowAction: {
                items:
                    [
                        {
                            text: null,
                            icon: 'trash',
                            visible: abp.auth.isGranted('Dispatcher.Works.Delete'),
                            confirmMessage: function (data) {
                                return l('WorkDeletionConfirmationMessage', data.record.name);
                            },
                            action: function (data) {
                                works.dispatcher.works.work.delete(data.record.id).then(function () {
                                    abp.notify.info(l('SuccessfullyDeleted'));
                                    dataTable.ajax.reload();
                                });
                            }
                        }
                    ]
            }
        },
        {
            title: l('Check'),
            data: "workInfo",
            className: "checkbox",
            orderable: false,
            render: function (data) {
                return `<input type='checkbox' class='checkbox' data-work='${data.id}' data-price='${data.totalPrice}'/>`;
            }
        }
    ],
    drawCallback: function (settings, json) {
        $("#WorksTable tbody tr").each((index, element) => {
            let dom = $(element)
            let color = dom.find("span[data-color]").attr("data-color");
            dom.addClass(color);
        });
    }
};

const formatLocation = function(location) {
    let tmp = location.split("");
    let words = 25
    let index = Math.floor(tmp.length / words);
    for (let i = 1; i <= index; i++) {
        tmp[i * words] += "</br>";
    }
    return `<div class='left'>${tmp.join("")}</div>`;
}
const getDate = function (str) {
    if (str === null || str === "0" || str.includes("0001") || !str) return "Not Available";
    return (new Date(str)).toLocaleString("en-NZ", {
        year: "numeric",
        month: "short",
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

const promptHTML = function (message, title, callback) {
    Swal.fire({
        title: title,
        html: `<div class="swalInfo">${message}</div>`,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
    }).then(callback);
}