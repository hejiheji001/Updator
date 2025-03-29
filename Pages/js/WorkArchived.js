const l = abp.localization.getResource('Dispatcher');
let init = false;
const getDate = function (str) {
    if (str === null || str === "0" || str.includes("0001") || !str) return "Not Available";
    return (new Date(str)).toLocaleDateString();
};

let specialOrders = [
    {
        "data": "workRequesterName",
        "target": "WorkRequester.Name"
    },
    {
        "data": "job",
        "target": "WorkContent"
    },
    {
        "data": "status",
        "target": "WorkStatus.WorkType"
    },
    {
        "data": "remainingDays",
        "target": "WorkDueNext.CompletingDate"
    },
    {
        "data": "issuedActual",
        "target": "WorkActualTime.Issued"
    },
    {
        "data": "workLocation",
        "target": "WorkLocation.Address"
    },
    {
        "data": "tel",
        "target": "WorkContactor.Tel"
    },
    {
        "data": "workStatusInfo",
        "target": "WorkDueNext.CompletingDate"
    },
    {
        "data": "orderInfo",
        "target": "OrderId"
    }
];

const inputAction = function (requestData) {
    if (!init) {
        requestData.order = {};
        requestData.sorting = "creationTime desc";
    } else {
        let sort = requestData.order[0];
        let data = requestData.columns[sort.column].data;

        specialOrders.forEach(o => {
            if (o.data === data) {
                requestData.order = {};
                requestData.sorting = `${o.target} ${sort.dir}`;
                console.log(requestData.sorting)
            }
        });
    }

    requestData.priority = priorityFilter.value;
    requestData.urgency = urgencyFilter.value;
    requestData.paid = paymentFilter.value;

    return requestData;
};

$(function () {
    const detailPage = abp.appPath + 'Works/EditModal';
    const isAdmin = abp.auth.isGranted("AbpIdentity.Roles.ManagePermissions");

    // abp.appPath = "https://localhost:44312/"
    // window.abp = abp;

    abp.notify.info(l("LoadingWorks"));
    const data = abp.libs.datatables.normalizeConfiguration({
        serverSide: true,
        paging: true,
        order: [[9, "asc"]],
        searching: true,
        scrollX: true,
        ajax: abp.libs.datatables.createAjax(works.dispatcher.works.work.getArchivedList, inputAction),
        columnDefs: [
            {
                title: l('Order'),
                data: "orderInfo",
                //visible: abp.auth.isGranted('Dispatcher.Works.Edit'),
                render: function (data) {
                    return `<a href="${detailPage}?id=${data[1]}">${data[0]}</br>${isAdmin ? data[2] : data[3]}</a>`;
                }
            },
            {
                title: l('Requested For'),
                data: "workRequesterName"
            },
            {
                title: l('Tel'),
                data: "tel",
                render: function (data) {
                    return `<a href="tel:${data}">${data}</a>`;
                }
            },
            {
                title: l('AppointmentTime'),
                data: "appointmentTime",
                render: function (data) {
                    return getDate(data);
                }
            },
            {
                title: l('Priority'),
                data: "priorityCode"
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
                title: l('Due Next'),
                data: "workStatusInfo",
                render: function (data) {
                    return `Attending: ${getDate(data.attendingDate)}</br>Completing: ${getDate(data.completingDate)}<span data-color="${data.color}"></span>`;
                }
            },
            {
                title: l('Location'),
                data: "workLocation",
                render: function (data) {
                    let location = data.address;
                    if (location.length >= 48) {
                        let tmp = location.split("");
                        tmp.length = 45;
                        location = tmp.join("");
                        location += "...";
                    }
                    return location;
                    // let status = data.workType;
                    // let days = data.remainingDays;
                    // return `${status}</br>(${Math.abs(days)} calendar days ${days > 0 ? 'remaining' : 'overdue'})`;
                }
            },
            {
                title: l('IssuedActual'),
                data: "issuedActual",
                render: function (data) {
                    return getDate(data);
                }
            },
            {
                title: l('Edit'),
                className: "edit",
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
    });

    let dataTable = $('#WorksTable').DataTable(data);
    let filter = $('.filter');
    filter.change(function () {
        dataTable.draw();
    });
    $('#WorksTable_filter').append(filter);
    init = true;
});