let init = false;
window.hintIndex = 4;

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
    setupData(requestData);
    
    requestData.priority = priorityFilter.value;
    requestData.urgency = 0;
    requestData.paid = paymentFilter.value;

    return requestData;
};

const bindForcePaid = function(finalStr) {
    $(".btn-tiny").unbind("click").click(function () {
        let workOrder = $(this).attr("data");

        if (workOrder.split('-')[1] === "1") {
            promptHTML(`Work ${workOrder} is a RootWork (ID ends with "-1"). <br/> You need to create/import a NORMAL work for it. <br/> Click <a class="btn btn-tiny btn-primary btn-sm" href="/Works/WorkDetail?create=true" target="_blank">CREATE</a> for a new Work. <br/> Click <a class="btn btn-tiny btn-primary btn-sm" href="/Works/Index" target="_blank">IMPORT</a> to import a new Work.`, "", result => {
                promptHTML(finalStr, `Info`);
                bindForcePaid(finalStr);
            });
        } else {
            Swal.fire({
                showCancelButton: true,
                showConfirmButton: true,
                showLoaderOnConfirm: true,
                showLoading: true,
                title: 'Now loading',
                preConfirm: async () => {
                    return works.dispatcher.works.work.getBifWorks(workOrder);
                },
            }).then(result => {
                if (result.isConfirmed) {
                    let info = result.value.items;
                    let options = {};

                    info.forEach(d => {
                        options[`${d.id},${d.orderId}`] = `${d.orderId}`
                    });

                    Swal.fire({
                        title: `Please Select Parent Work for ${workOrder}`,
                        input: "select",
                        inputOptions: options,
                        inputPlaceholder: "Select A Work",
                        showCancelButton: true,
                        html: 'No Works to select? Click <a class="btn btn-tiny btn-primary btn-sm" href="/Works/WorkDetail?create=true" target="_blank">CREATE</a> for a new Work. And re-enter here to select.',
                    }).then(result => {
                        if (result.isConfirmed) {
                            let info = result.value.split(",");
                            let parentWorkId = info[0];
                            let parentWorkOrder = info[1];

                            Swal.fire({
                                showCancelButton: true,
                                showConfirmButton: true,
                                showLoaderOnConfirm: true,
                                showLoading: true,
                                title: 'Are You Sure',
                                html: `Bind ${workOrder} to <a href="/Works/WorkDetail?id=${parentWorkId}" target="_blank">${parentWorkOrder}</a> and set FORCE PAID`,
                                preConfirm: async () => {
                                    return works.dispatcher.works.work.bindBifWork(workOrder, parentWorkId);
                                },
                            }).then(result => {
                                if (result.isConfirmed) {
                                    promptOK(result.value);
                                } else {
                                    promptHTML(finalStr, `Info`);
                                    bindForcePaid(finalStr);
                                }
                            });
                        } else {
                            promptHTML(finalStr, `Info`);
                            bindForcePaid(finalStr);
                        }
                    })
                } else {
                    promptHTML(finalStr, `Info`);
                    bindForcePaid(finalStr);
                }
            });
            $(".swal2-confirm").click();
        }
    });
}

$(function () {
    abp.notify.info(l("Loading Archived Works"));
    
    workData.ajax = abp.libs.datatables.createAjax(works.dispatcher.works.work.getArchivedList, inputAction)
    const data = abp.libs.datatables.normalizeConfiguration(workData);

    $('#batchPaidButton').click(function (e) {
        e.preventDefault();
        $('#paidOrderFile').click();
    });

    $('#paidOrderFile').change(function () {
        abp.notify.info(l("Running Task"));
        let form = $('#paidOrderForm');
        form.ajaxForm({
            dataType: "json",
            contentType: "multipart/form-data",
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                if (data === "Error") {
                    promptError("Payment File Not Correct!");
                }
                else {
                    let mismatched = data.mismatched;
                    let matched = data.matched;
                    let forcePaid = data.forcePaid;
                    let separator = '<div style="border-bottom: solid">data</div>';

                    let mismatchedStr = mismatched.map(x => `<button type="button" data="${x.orderId}" class="btn btn-primary btn-sm btn-tiny">Force Paid</button> ${x.orderId}: Actual ${x.actual}, Upstream ${x.upstream}`).join("</br>");
                    let matchedStr = matched.map(x => `${x.orderId}: Actual ${x.actual}, Upstream ${x.upstream}`).join("</br>");
                    let forcePaidStr = forcePaid.map(x => `${x.orderId}: Parent <a href="/Works/WorkDetail?id=${x.parentId}" target="_blank" class="btn btn-primary btn-sm btn-tiny">${x.parentOrderId}</a>`).join("</br>");
                    let finalStr = separator.replace('data', `Mismatched Works: ${mismatched.length} Items`) + mismatchedStr + "<p/>" + separator.replace('data', `Matched Works: ${matched.length} Items`) + matchedStr + "<p/>" + separator.replace('data', `Force Paid Works: ${forcePaid.length} Items`) + forcePaidStr;

                    promptHTML(finalStr, `Info`);
                    bindForcePaid(finalStr);

                    $('#paidOrderFile').val(null);
                }
            }
        });

        form.submit();
    });

    window.dataTable = $('#WorksTable').DataTable(data);
    let filter = $('.filter');
    filter.change(function () {
        dataTable.draw();
    });
    $('#WorksTable_filter').append(filter);
    init = true;
});