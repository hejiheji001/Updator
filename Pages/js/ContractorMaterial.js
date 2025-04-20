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

const format = function(d) {
    let materials = d.materials.map(material => `<td>${material.creator}</td><td>${material.description}</td><td>${material.price}</td><td class="center">${getDate(material.dateTime)}</td><td class="center">${material.isPaid}</td>`);
    console.log(materials);
    return `
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Creator</th>
                <th>Description</th>
                <th>Price</th>
                <th>Time</th>
                <th>Paid</th>
            </tr>
        </thead>
        <tbody>
            <tr>${materials.join("</tr><tr>")}</tr>
        </tbody>
    </table>`;
}

$(function () {
    const detailPage = abp.appPath + 'Works/ContractorMaterialDetail';
    const isAdmin = abp.auth.isGranted("AbpIdentity.Roles.ManagePermissions");

    // abp.appPath = "https://localhost:44312/"
    // window.abp = abp;

    abp.notify.info(l("LoadingContractorMaterials"));
    const data = abp.libs.datatables.normalizeConfiguration({
        serverSide: true,
        paging: true,
        order: [[2, "asc"]],
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
                title: l('Price'),
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
                                console.log(1);
                            }
                        });
                    }
                })
            }
        });
        $(".swal2-confirm").click();
    });
    
    init = true;
});