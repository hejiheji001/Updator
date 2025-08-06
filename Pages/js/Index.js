let init = false;
window.hintIndex = 3;

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
    requestData.urgency = urgencyFilter.value;
    requestData.paid = -1;
    
    return requestData;
};

$(function () {
    abp.notify.info(l("LoadingWorks"));
    
    workData.ajax = abp.libs.datatables.createAjax(works.dispatcher.works.work.getList, inputAction)
    const data = abp.libs.datatables.normalizeConfiguration(workData);

    let dataTable = $('#WorksTable').DataTable(data);

    $('#importOrderButton').click(function (e) {
        e.preventDefault();
        $('#importOrderFile').click();
    });

    $('#importOrderFile').change(function () {
        abp.notify.info(l("Running Task"));
        $('#importOrderForm').submit();
    });
    
    let checkboxInit = false;

    $('#batchEditButton').click(function (e) {
        e.preventDefault();

        $("#WorksTable button").hide();
        $(".edit").hide();
        $(".checkbox").show().css("width", "");
        if (!checkboxInit) {
            $("input.checkbox").click(function () {
                let totalPriceDom = "#totalPrice";
                let price = $(this).attr("data-price") * 1;
                let totalPrice = $(totalPriceDom).html() * 1;
                if(!this.checked){
                    price *= -1;
                }
                $(totalPriceDom).html((price + totalPrice).toFixed(2));
            });
            checkboxInit = true;
        }

        $('.normal').hide();
        $('.batch').show();
        $('.totalPrice').attr("hidden", false).show();
    });
    
    $('#batchFinishButton').click(function (e) {
        e.preventDefault();

        $("#WorksTable button").show();
        $(".edit").show();
        $(".checkbox").hide();
        $('.totalPrice').hide();
        $('#totalPrice').html(0);
        $("input.checkbox").prop("checked", false)

        $('.normal').show();
        $('.batch').hide();
    });
    
    $('#batchDeleteButton').click(function (e) {
        e.preventDefault();

        Swal.fire({
            title: 'Are you sure?',
            text: l('WorkDeletionConfirmationMessage'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(function (result) {
            if (result.value) {
                let ids = $("input.checkbox:checked").get().map(x => $(x).attr("data-work"));
                works.dispatcher.works.work.deleteMany(ids).then(function () {
                    abp.notify.info(l('SuccessfullyDeleted'));
                    dataTable.ajax.reload();
                });
                return true;
            }
        });
    });

    $('#batchCompleteButton').click(function (e) {
        e.preventDefault();
        //$('#completeOrderFile').click();
        let checked = $(".checkbox:checked").get().map(x => $(x).attr("data-work"));
        if (checked.length > 0) {
            $("#checkedWorks").val(checked);
            $("#completeOrderForm").submit();
        } else {
            promptError('Please Select Works!');
        }
    });

    $('#completeOrderFile').change(function () {
        $('#completeOrderForm').submit();
    });
    
    let filter = $('.filter');

    filter.change(function () {
        dataTable.draw();
    });
    
    $('#WorksTable_filter').append(filter);

    $("#lpx-sidebar > nav > div > i").click();
    
    init = true;
});