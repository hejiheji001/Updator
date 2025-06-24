let init = false;

let specialOrders = [
    {
        "data": "materialInfo",
        "target": "contractor"
    },
    {
        "data": "priceStr",
        "target": "price"
    },
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

const format = function(d) {
    let materials = d.materials.map(material => 
        `<td>${material.creator}</td><td>${material.description}</td><td>${material.price}</td><td class="center">${getDate(material.dateTime)}</td><td class="center">${material.isPaid}</td><td class="center">${material.fileName != null ? `<a target="_blank" href="/Works/PDFViewer?fileName=${material.fileName}">Invoice</a>` : 'None'}</td>
        ${(isAdmin ? `<td><button class="btn btn-primary btn-sm deleteMaterial" type="button" data="${material.id}">Delete</button></td>` : '')}
        `);
    return `
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Creator</th>
                <th>Description</th>
                <th>Price</th>
                <th>Time</th>
                <th>Reference</th>
                <th>Attachment</th>
                ${(isAdmin ? '<th>Edit</th>' : '')}
            </tr>
        </thead>
        <tbody>
            <tr>
                ${materials.join("</tr><tr>")}
            </tr>
        </tbody>
    </table>`;
}

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
                        html: 'No Works to select? Click <a class="btn btn-tiny btn-primary btn-sm" href="/Works/WorkDetail?create=true" target="_blank">CREATE</a> for a new Work.',
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
    abp.notify.info(l("LoadingContractorMaterials"));
    const data = abp.libs.datatables.normalizeConfiguration({
        serverSide: true,
        paging: true,
        order: [[1, "asc"]],
        searching: true,
        scrollX: true,
        ajax: abp.libs.datatables.createAjax(works.dispatcher.works.work.getContractorMaterials, inputAction),
        columnDefs: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: ''
            },
            {
                title: l('Contractor'),
                data: "materialInfo",
                className: 'left',
                render: function (data) {
                    return data[0];
                    // return `<a class="padding-left-10" href="${detailPage}?id=${data[1]}" target="_blank">${data[0]}</a>`;
                }
            },
            {
                title: l('Material Price'),
                className: 'left',
                data: "priceStr",
                render: function (data) {
                    return `<div class="padding-left-10">${data}</div>`;
                }
            }
        ],
        drawCallback: function (settings, json) {
            $("#MaterialsTable tbody tr").each((index, element) => {
                let dom = $(element)
                let color = dom.find("span[data-color]").attr("data-color");
                dom.addClass(color);
            });
        }
    });

    let dataTable = $('#MaterialsTable').DataTable(data);

    $('#MaterialsTable tbody').on('click', 'td.dt-control', function () {
        let tr = $(this).closest('tr');
        let row = dataTable.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
        }
        else {
            row.child(format(row.data())).show();
            $(".deleteMaterial").click(function () {
                let id = $(this).attr("data");
                works.dispatcher.works.work.deleteMaterial(id).then(function () {
                    promptOK(l('SuccessfullyDeleted'));
                    dataTable.ajax.reload();
                });
            });
        }
    });

    let filter = $('.filter');

    filter.change(function () {
        dataTable.draw();
    });

    $('#MaterialsTable_filter').append(filter);

    startDateFilter.value = "";
    endDateFilter.value = "";
    
    $("#createOrderButton").click(function () {
        Swal.fire({
            showCancelButton: true,
            showConfirmButton: true,
            showLoaderOnConfirm: true,
            showLoading: true,
            title: 'Now loading',
            preConfirm: async () => {
                return works.dispatcher.works.work.getContractorLookup();
            },
        }).then(result => {
            if (result.isConfirmed) {
                let info = result.value.items;
                let options = {};

                info.forEach(d => {
                    options[d.id] = `${d.normalizedUserName}`
                });
                
                Swal.fire({
                    title: "Please Select Contractor",
                    input: "select",
                    inputOptions: options,
                    inputPlaceholder: "Select A Contractor",
                    showCancelButton: true,
                }).then(result => {
                    if (result.isConfirmed) {
                        let productCreateModal = new abp.ModalManager({
                            viewUrl: `/Works/ContractorMaterialCreateModal?id=${result.value}`
                        });
                        productCreateModal.open();
                        productCreateModal.onResult(function(){
                            if (arguments[1].responseText === true) {
                                dataTable.ajax.reload();
                            }
                        });
                    }
                })
            }
        });
        $(".swal2-confirm").click();
    });

    $("#paymentFileButton").click(function () {
        $("#paymentFile").click();
    });
    
    $('#paymentFile').change(function () {
        abp.notify.info(l("Running Task"));
        let form = $('#uploadPaymentForm');
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
                    
                    $('#paymentFile').val(null);
                }
            }
        });

        form.submit();
    });
    
    init = true;
});