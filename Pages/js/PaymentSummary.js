const l = abp.localization.getResource('Dispatcher');
let init = false;

let specialOrders = [
    
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

    requestData.startDate = startDateFilter.value;
    requestData.endDate = endDateFilter.value;

    if (requestData.startDate === "") {
        requestData.startDate = "0001-01-01";
    }

    if (requestData.endDate === "") {
        requestData.endDate = "0001-01-01";
    }
    
    return requestData;
};

$(function () {
    const detailPage = abp.appPath + 'Works/PaymentInvoice';
    const isAdmin = abp.auth.isGranted("AbpIdentity.Roles.ManagePermissions");

    abp.notify.info(l("LoadingPayments"));
    const data = abp.libs.datatables.normalizeConfiguration({
        serverSide: true,
        paging: true,
        order: [[2, "asc"]],
        searching: true,
        scrollX: true,
        ajax: abp.libs.datatables.createAjax(works.dispatcher.works.work.getPaymentList, inputAction),
        columnDefs: [
            {
                title: l('Check'),
                data: "check",
                className: "checkbox",
                render: function (data) {
                    return `<input type='checkbox' class='checkbox'/>`;
                }
            },
            {
                title: l('View'),
                className: "view",
                data: "reference",
                render: function (data) {
                    return `<a class="fa fa-eye me-1 invoice" href="${detailPage}?id=${data[4]}"></a>`;
                }
            },
            {
                title: l('From'),
                data: "contractorName"
            },
            {
                title: l('Reference'),
                data: "reference",
                render: function (data) {
                    return `INV-${data[0]}/${data[1]}-${data[2]}_${data[3]}`;
                }
            },
            {
                title: l('Date'),
                data: "createdDate"
            },
            {
                title: l('Paid'),
                data: "paid"
            },
            {
                title: l('Due'),
                data: "contractorPrice"
            }
        ],
        drawCallback: function (settings, json) {
            $("#PaymentsTable tbody tr").each((index, element) => {
                let dom = $(element)
                let color = dom.find("span[data-color]").attr("data-color");
                dom.addClass(color);
            });
        }
    });

    let dataTable = $('#PaymentsTable').DataTable(data);

    let filter = $('.filter');

    filter.change(function () {
        dataTable.draw();
    });

    $('#PaymentsTable_filter').append(filter);

    startDateFilter.value = "";
    endDateFilter.value = "";
    
    init = true;
});