let init = false;

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
    requestData.urgency = 0;
    requestData.paid = paymentFilter.value;

    return requestData;
};

$(function () {
    abp.notify.info(l("Loading Archived Works"));
    
    workData.ajax = abp.libs.datatables.createAjax(works.dispatcher.works.work.getArchivedList, inputAction)
    const data = abp.libs.datatables.normalizeConfiguration(workData);

    $('#batchPaidButton').click(function (e) {
        e.preventDefault();
        $('#paidOrderFile').click();
    });

    $('#paidOrderFile').change(function () {
        $('#paidOrderForm').submit();
    });

    let dataTable = $('#WorksTable').DataTable(data);
    let filter = $('.filter');
    filter.change(function () {
        dataTable.draw();
    });
    $('#WorksTable_filter').append(filter);
    init = true;
});