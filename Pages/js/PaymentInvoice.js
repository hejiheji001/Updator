$(function () {
    $("#printButton").click(function () {
        $("#invoice").print();
    });
    
    $("#payButton").click(function () {
        let form = $("#payForm");
        form.ajaxForm({
            dataType: "json",
            contentType: "multipart/form-data",
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                promptOK("All Invoices Set To Paid.")
            }
        });

        form.submit();
    })

    $("#lpx-sidebar > nav > div > i").click();
});