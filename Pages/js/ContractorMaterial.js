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
    // `d` is the original data object for the row
    console.log(d.materials);
    return 1;
}

$(function () {
    const detailPage = abp.appPath + 'Works/MaterialDetail';
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
                title: l('Reference'),
                data: "materialInfo",
                render: function (data) {
                    return `<a href="${detailPage}?id=${data[1]}" target="_blank">${data[0]}</a>`;
                }
            },
            {
                title: l('Price'),
                data: "priceStr"
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
                        window.open(`/Works/ContractorMaterialDetail?id=${result.value}&create=true`);
                    }
                })
            }
        });
        
        $(".swal2-confirm").click();
    });
    
    init = true;
});