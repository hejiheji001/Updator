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
    let force = getSearch("force");
    
    requestData.forceUpdate = force ? force : false;
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
    const batchPayment = abp.appPath + 'Works/BatchPaymentInvoice';

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
                data: "reference",
                className: "checkbox non-selection select-all",
                orderable: false,
                render: function (data) {
                    let paid = data[7];
                    let extra = '';
                    if (paid === "True") {
                        extra = `<span class="dot_True"><a style="color: #${data[6].substring(0, 6)}" href="${batchPayment}?id=${data[6]}">Ref:${data[9]}</a></span>`;
                    }
                    return `${extra}<input type='checkbox' class='checkbox batchPayment paid_${data[7]}' data-batchId="${data[6]}" data-name="${data[3]}" value='${data[4]}' data-price='${data[5]}'/>`;
                }
            },
            {
                title: l('View'),
                className: "view non-selection",
                data: "reference",
                orderable: false,
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
                className: "non-selection",
                orderable: false,
                render: function (data) {
                    return `INV-${data[0]}/<a href="/Works/WorkDetail?id=${data[8]}">${data[1]}</a>-${data[2]}_${data[3]}`;
                }
            },
            {
                title: l('Date'),
                data: "createdDate",
                render: function (data) {
                    return getDate(data);
                }
            },
            {
                title: l('Paid'),
                data: "paid",
                render: function (data) {
                    return `<div class="left padding-left-10">${data}</div>`
                }
            },
            {
                title: l('Due'),
                data: "contractorPrice",
                render: function (data) {
                    return `<div class="left padding-left-10">${data}</div>`
                }
            }
        ],
        drawCallback: function (settings, json) {
            $("#PaymentsTable tbody tr").each((index, element) => {
                let dom = $(element)
                let color = dom.find("span[data-color]").attr("data-color");
                dom.addClass(color);
            });

            $("input.checkbox").on("change", function () {
                let totalPriceDom = "#totalPrice";
                let price = $(this).attr("data-price") * 1;
                let totalPrice = $(totalPriceDom).html() * 1;
                if(!this.checked){
                    price *= -1;
                }
                $(totalPriceDom).html((price + totalPrice).toFixed(2));
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
    
    $("#batchPaymentButton").on("click", function (e) {
        e.preventDefault();
        let checkedContractors = $(".batchPayment:checked").get();

        let names = new Set(checkedContractors.map(x => $(x).attr("data-name")));
        if (names.size > 1) {
            promptError("You should only select single contractor");
            return;
        }
        
        let batchIds = new Set(checkedContractors.map(x => $(x).attr("data-batchId")));
        if (batchIds.size > 1) {
            promptError("You should not select different paid batch payments. (Hint: same batches shares same 'Paid' color)");
            return;
        }
        
        let checked = checkedContractors.map(x => x.value);
        if (checked.length > 0) {
            $("#checkedInvoices").val(checked);
            $("#batchPaymentForm").submit();
        } else {
            promptError('Please Select Invoices!');
        }
    });
    
    $(".select-all").on("click", function (e) {
        let unchecked = $(".batchPayment.paid_False:unchecked");
        if (unchecked.length > 0) {
            unchecked.click();
        } else {
            $(".batchPayment.paid_False").click();
        }
    });
    
    init = true;
});