const template = "template";
const container = "container";
const detail = "detail";
const item = "item";
const image = "image";
const file = "file";
const save = '<i class="lpx-icon fa fa-check" aria-hidden="true"></i>';
const edit = '<i class="lpx-icon fa fa-gear" aria-hidden="true"></i>';
const comment = "comment";
const disabled = "disabled";
const button = "Button";
const blink = "blink-border";
const spinner = "<i class='fa fa-spin fa-solid fa-spinner fa-spin-pulse'></i>";
const addButton = `add${button}`;
const exportButton = `export${button}`;
const saveButton = `save${button}`;
const saveAllButton = `saveAll${button}`;
const editButton = `edit${button}`;
const downloadButton = `download${button}`;
const groupDownloadButton = `groupDownload${button}`;
const updateButton = `update${button}`;
const assignButton = `assign${button}`;
const assignDoneButton = `assignDone${button}`;
const assignJobsFormId = `#assignJobsForm`;
const assignJobsValueId = `#assignJobIds`;
const addButtonClass = `.${addButton}`;
const saveButtonClass = `.${saveButton}`;
const saveAllButtonClass = `.${saveAllButton}`;
const editButtonClass = `.${editButton}`;
const downloadButtonClass = `.${downloadButton}`;
const groupDownloadButtonClass = `.${groupDownloadButton}`;
const updateButtonClass = `.${updateButton}`;
const assignButtonClass = `.${assignButton}`;
const assignDoneButtonClass = `.${assignDoneButton}`;
const exportButtonClass = `.${exportButton}`;
const assignCheckBoxClass = ".assignCheckbox";
const contractorListClass = ".contractorsList";
const editable = "editable";
const editableClass = `.${editable}`;
const editableAttr = `[${editable}]`;
const suffix = "suffix";
const source = "[source]";
const fileType = '[type="file"]';
const checkBox = "[name='item.IsConfirmed']:checkbox";
const updateForm = "#updateForm";
const updateFile = "[name='UploadFileDto.Files']";
const select = ".form-select";
const codeInitSelectId = "#codeInit";
const checkAll = "#checkAll";

const enableEditable = function (selector) {
    $(selector).attr("contenteditable", "true").removeAttr(disabled).addClass(blink);
};

const disableEditable = function (selector) {
    $(selector).attr("contenteditable", "false").attr(disabled, disabled).removeClass(blink);
};

const domShow = function (selector) {
    let dom = $(selector);
    dom.attr("hidden", false).show();
};

const domHide = function (selector) {
    let dom = $(selector);
    dom.attr("hidden", true).hide();
};

const initDownloadButton = function (e) {
    e.preventDefault();

    let dataFor = $(this).attr("data");
    let targetFor = $(this).attr("target");
    let general = `[target='${targetFor}'][data='${dataFor}']`
    $(`a${general}`)[0].click();
}

const initGroupDownloadButton = function (e) {
    e.preventDefault();
    let dataFor = $(this).attr("data");
    let targetFor = $(this).attr("target");
    let locationFor = $(this).attr("location");
    window.location.href = `/downloadAll?workId=${dataFor}&target=${targetFor}&location=${locationFor}`;
}
const initEditButton = function(e) {
    e.preventDefault();

    showAllColumns();

    let dataFor = $(this).attr("data");
    let targetFor = $(this).attr("target");
    let general = `[target='${targetFor}'][data='${dataFor}']`
    let suffixValue = $(this).attr(suffix);
    let suffixSelector = `[${suffix}='${suffixValue}']`;

    let targetUpdateButton = `${updateButtonClass}${general}`;
    let targetEditable = `${editableClass}${general}`;

    if(suffixValue) {
        targetUpdateButton += suffixSelector;
        targetEditable += suffixSelector;
    }

    domShow(targetUpdateButton);
    domHide(this);
    enableEditable(targetEditable);
    if (targetFor === item) {
        $($(targetEditable)[0]).on("click", function (d) {
            linkSearch(d.target);
        });
    }
}

const initAssignButton = function (e) {
    e.preventDefault();

    showAllColumns();
    domHide(editButtonClass);
    domHide(assignButtonClass);
    domShow(assignDoneButtonClass);
    domShow(assignCheckBoxClass);
    domShow(contractorListClass);
    domShow(codeInitSelectId);
    domShow(checkAll);
}

const initAssignDoneButton = function (e) {
    e.preventDefault();
    
    let contractor = $(contractorListClass).val();
    let jobChecks = $(assignCheckBoxClass + ":checked");
    let jobs = jobChecks.get().map(x => $(x).attr("data"));
    
    if (contractor !== "0" && jobs.length > 0) {
        let form = $(assignJobsFormId);
        $(assignJobsValueId).val(jobs);
        
        form.ajaxForm({
            dataType: "json",
            contentType: "multipart/form-data",
            headers: {
                "Accept": "application/json"
            },
            success: function (e) {
                jobChecks.get().forEach(check => {
                    let id = $(check).attr("data");
                    let contractorName = $(contractorListClass + " [selected]").text().split(" ")[0];
                    $(`tr[data='${id}'] td[data='contractor']`).html(contractorName);
                });

                promptOK('Job Assigned')
                $(assignJobsValueId).val("");
                jobChecks.click();
                jobChecks.attr("assigned", contractor);
                $(contractorListClass).val("0");
            },
            error: function (e){
                promptError('Job Not Assigned - Job Code Mismatch?')
                $(assignJobsValueId).val("");
                jobChecks.click();
            }
        });
        form.submit();

        $(codeInitSelectId).val("").trigger("change");
        domShow(editButtonClass);
        domShow(assignButtonClass);
        domHide(assignDoneButtonClass);
        domHide(assignCheckBoxClass);
        domHide(contractorListClass);
        domHide(codeInitSelectId);
        domHide(checkAll)
        
        $(`${editButtonClass}[suffix]`).click();
        hiddenColumns();
    }
}

const initUpdateButton = function(e) {
    e.preventDefault();
    let dom = $(this);
    dom.html(spinner);

    let dataFor = dom.attr("data");
    let targetFor = dom.attr("target");
    let general = `[target='${targetFor}'][data='${dataFor}']`
    let suffixValue = dom.attr(suffix);
    let suffixSelector = `[${suffix}='${suffixValue}']`;

    let targetEditButtonClass = `${editButtonClass}${general}`;
    let targetEditable = `${editableClass}${general}`;

    if(suffixValue) {
        targetEditButtonClass += suffixSelector;
        targetEditable += suffixSelector;
    } else {
        suffixSelector = "";
    }

    let isNew = $("#isNew").val() === "True";
    if (isNew) {
        let orderId = $("[name='work.OrderId']").val();
        if (orderId === '') {
            promptError('OrderId Not Assigned!')
            return;
        }
        
        let address = $("[name='work.Address']").val();
        if (address === '') {
            promptError('Address Not Assigned!')
            return;
        }

        let issued = $("[name='work.IssuedActual']").val();
        if (issued === '') {
            promptError('Issued Actual Time Not Assigned!')
            return;
        }
    }

    update(dom, function(e) {
        let target = dom.attr("target");
        
        dom.html(save);
        domShow(targetEditButtonClass);
        domHide(this);
        disableEditable(targetEditable);

        let updateButtons = $(`${updateButtonClass}:visible`).get();
        if (updateButtons.length === 0) {
            domHide(`${saveAllButtonClass}:visible`);
            if (target === item) {
                domShow(assignButtonClass);
            }
        }
        
        if (isNew) {
            $("#refresh")[0].click();
        } else {
            if (e && e.id) {
                $(`[data='${dataFor}']`).attr("data", e.id);
                $(`[name='${targetFor}.DataId']${suffixSelector}`).val(e.id);
                dataFor = e.id;
                let code = $(`input[data='${dataFor}'][name='item.TypeCode']`).val();
                $(`input[data='${dataFor}'][name='jobs']`).attr("code", code).addClass("assignCheckbox");
            }

            if (target === item) {
                let workId = getSearch("id");
                let refreshData = [workId, dataFor];
                let refreshPrice = works.dispatcher.works.work.getItemPrice;
                refreshPrice.apply(null, refreshData).then(function (e) {
                    let dom = $(`[data='${dataFor}']`);
                    Object.keys(e).forEach(x => e[x] = `$${e[x]}`);
                    dom.find(`${suffixSelector}[source='price']`).html(e.price);
                    dom.find(`${suffixSelector}[source='contractorPrice']`).html(e.contractorPrice);
                    $("[source='totalPrice']").html(e.totalPrice);
                    $("[source='contractorTotalPrice']").html(e.contractorTotalPrice);
                }).then(function () {
                    $(`${suffixSelector}`).removeAttr(suffix);
                });
            }

            if (target === file || target === image) {
                $(updateForm).find(fileType).remove();
                if (e) {
                    let ids = e.ids;
                    let templateSelector = `#${targetFor}-${template}`;
                    let templateContent = $(templateSelector).html().replaceAll("th", "td");
                    let templateGeneral = `class='${editable} form-control' data="${dataFor}"`;
                    ids.map(id => {
                        let dom = $(`<tr data="${id}">${templateContent}</td>`);
                        prepareDom(dom, targetFor, templateGeneral);
                        return dom;
                    });
                    promptOK('Complete!');
                }
            }
            
            if (target === comment || (target === detail)) {
                promptOK('Complete!');
            }
        }

        hideColums();
    }.bind(this));
}

const initCheckBox = function () {
    $(this).val($(this).prop("checked"));
}

const update = function (dom, callback) {
    let allowSubmit = true;
    let target = dom.attr("target");
    let suffixValue = dom.attr(suffix);
    let suffixSelector = "";
    if (suffixValue) {
        suffixSelector = `[${suffix}='${suffixValue}']`;
    }
    let targetData = {
        name: "work.Target",
        value: target,
        type: "hidden"
    };

    let formData = [];
    let submitForm = function (formData, targetData, allowSubmit) {
        let form = $("#updateForm");
        form.ajaxForm({
            beforeSubmit: function (data) {
                data.push(targetData);
                return allowSubmit;
            },
            data: formData,
            dataType: "json",
            contentType: "multipart/form-data",
            headers: {
                "Accept": "application/json"
            },
            success: callback
        });
        
        form.submit();
    };
    
    let getData = function () {
        let data = dom.attr("data");
        let domList = $(`tr[data=${data}] ${editableClass}${suffixSelector}`).clone();
        let tempForm = $("<form id='tmpForm'></form>").append(domList);
        let files = [];
        if (target === file || target === image) {
            let fileDomList = tempForm.find(fileType);
            files = fileDomList.get().flatMap(x => Object.values(x.files));
            $(updateForm).append(fileDomList);
            fileDomList.hide();
        }
        return tempForm.serializeArray().concat(files);
    }

    let withIssued = $("[name='work.IssuedActual']").val();
    if (target === item) {
        formData = getData();

        let quantity = formData.find(x => x.name === `${target}.Quantity`).value;
        if (!Number.isFinite(quantity * 1)) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("QuantityNotNumber"));
            return;
        }

        let typeCode = formData.find(x => x.name === `${target}.TypeCode`).value;
        if (!typeCode) {
            dom.html(save);
            abp.message.error(l("TypeCodeError"));
            return;
        }
        
        let findTypeInfo = works.dispatcher.works.work.findJobTypeInfo;
        findTypeInfo(typeCode).then(function (e) {
            if (!e) {
                allowSubmit = false;
                dom.html(save);
                abp.message.error(l("NoSuchTypeCode"));
            } else {
                $(dom.parents()[1]).find(`[source='desc']`).html(e.shortDescription);
            }
        }).then(function () {
            submitForm(formData, targetData, allowSubmit);
        });
    } else if (target === image) {
        formData = getData();

        let content = formData.find(x => x.constructor.name === "File");
        if (!content) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("FilesAreEmpty"));
        }
        
        if (!withIssued) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("IssuedActualTimeNotAssigned"));
        }
        submitForm(formData, targetData, allowSubmit);
    } else if (target === file) {
        formData = getData();
        
        let content = formData.find(x => x.constructor.name === "File");
        if (!content) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("FilesAreEmpty"));
            return;
        }

        if (!withIssued) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("IssuedActualTimeNotAssigned"));
        }
        submitForm(formData, targetData, allowSubmit);
    } else if (target === comment) {
        formData = getData();
        
        let content = formData.find(x => x.name === `${target}.Comment`).value;
        if (!content) {
            allowSubmit = false;
            dom.html(save);
            abp.message.error(l("CommentIsEmpty"));
            return;
        }
        
        submitForm(formData, targetData, allowSubmit);
    } else {
        submitForm(formData, targetData, allowSubmit);
    }
}

const showCodeDialog = function (dom) {
    Swal.fire({
        title: "Find The Code",
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Look up",
        showLoaderOnConfirm: true,
        preConfirm: async (code) => {
            return works.dispatcher.works.work.lookupCode(code);
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then(result => {
        if (result.isConfirmed) {
            let info = result.value;
            let options = {};
            info.forEach(d => {
                options[d.code] = `${d.code}, $${d.price}, ${d.shortDescription}`
            })
            Swal.fire({
                title: "Please Select Code",
                input: "select",
                inputOptions: options,
                inputPlaceholder: "Select A Code",
                showCancelButton: true,
            }).then(result => {
                if (result.isConfirmed) {
                    dom.value = result.value;
                } else {
                    showCodeDialog(dom);
                }
            })
        }
    });
}

const linkSearch = function (dom) {
    let search = $("#CodeTable_filter > label > input");
    let position = $(dom).offset();
    position.left += 100;
    position.top -= 100;

    $(dom).on("input", function(e) {
        let codeTableData = $("#CodeTableData");
        codeTableData.show();
        
        let value = e.target.value;
        search.val(value);
        search.trigger("input");
        let data = $("#CodeTable tbody").get()[0];
        if (data) {
            data.id = "CodeTableDataBody";
            codeTableData.append($(data));
        }
        
        let height = codeTableData.height;
        if (height < 200) {
            position.top += height;
        }
        
        codeTableData.offset(position);
        
        setTimeout(function () {
            $("#CodeTableDataBody").find("tr").on("click", function (e) {
                dom.value = $($(e.currentTarget).find("td")[0]).text();
                $("#CodeTableData").hide();
            });
        }, 1000);
    });
}

const prepareDom = function (dom, targetFor, general) {
    dom.find("td").text("");

    dom.find(`${editableAttr}`).append(function () {
        return `<input class=${editable} type="hidden" name="${targetFor}.DataId"/>`;
    });

    dom.find(`${editableAttr}[tag]`).append(function () {
        let tag = $(this).attr("tag");
        let type = $(this).attr("type");
        let name = $(this).attr("name");
        let options = '';
        if (tag === "select") {
            options = $("[template-name='item.JobLocation.Location']").html();
            general = general.replace("form-control", "form-select");
        }else {
            general = general.replace("form-select", "form-control");
        }
        
        if (type) {
            if (type === "checkbox") {
                general = general.replace("form-control", "");
            }

            if (targetFor === image) {
                general += ` accept="image/*"`;
            }
            
            return `<${tag} type="${type}" ${general} name="${name}">${options}</${tag}>`;
        }
        return `<${tag} ${general}" name="${name}">${options}</${tag}>`;
    }).removeAttr(editable);

    dom.find(`${editableAttr}`).append(function () {
        let name = $(this).attr("name");
        return `<input ${general} name="${name}"/>`
    });
    
    dom.find("select").on("change", function (d) {
        $(this).find("option").removeAttr("selected");
        $(this.selectedOptions[0]).attr("selected", "selected");
    });
    
    dom.find(":checkbox").on("change", initCheckBox);

    dom.find(`${editableAttr}`).removeAttr(editable);

    dom.find("[default]").text(function() {
        return $(this).attr("default");
    }).removeAttr("default");
    
    dom.find("[dialog]").on("click", function (d) {
        linkSearch(d.target);
    })
}

const hideColums = function () {
    var arr = localStorage['hiddenColumns'].split(",");
    var adminCodes = $("#adminCodes").get()[0];

    if (!adminCodes) return;

    var adminCols = adminCodes.getElementsByTagName('col');
    var contractorCols = contractorCodes.getElementsByTagName('col');

    showAllColumns();

    arr.forEach(i => {
        var a = adminCols[i - 1];
        var b = contractorCols[i - 1];

        if (a) {
            a.style.visibility = "collapse";
        }

        if (b) {
            b.style.visibility = "collapse";
        }
    });
    
}

const showAllColumns = function () {
    var adminCodes = $("#adminCodes").get()[0];

    if (!adminCodes) return;
    var adminCols = adminCodes.getElementsByTagName('col');
    var contractorCols = contractorCodes.getElementsByTagName('col');
    Object.values(adminCols).concat(Object.values(contractorCols)).forEach(x => x.style.visibility = "");
}

$(function () {
    $(editButtonClass).click(initEditButton);

    $(updateButtonClass).click(initUpdateButton);

    $(downloadButtonClass).click(initDownloadButton);
    
    $(groupDownloadButtonClass).click(initGroupDownloadButton);

    $(assignButtonClass).click(initAssignButton);
    
    $(assignDoneButtonClass).click(initAssignDoneButton);

    $(addButtonClass).click(function (e) {
        e.preventDefault();

        showAllColumns();

        let targetFor = $(this).attr("target");
        let targetAttr = `target='${targetFor}'`;
        let type = $(this).attr("for");

        if (targetFor === file || targetFor === image) {
            if ($(`${updateFile}[${targetAttr}]:visible`).length) {
                $(`${editButtonClass}[target='${targetFor}']`).click();
                return;
            }
        }
        
        let dataFor = $(this).attr("data");
        let templateSelector = `#${targetFor}-${template}`;
        let containerSelector = `#${targetFor}-${container}[data='${type}']`;
        let general = `class='${editable} form-control' ${targetAttr} data="${dataFor}" multiple`;
        let dom = $(`<tr class="addedContent" data="${dataFor}">${$(templateSelector).html().replaceAll("th", "td")}</td>`);
        prepareDom(dom, targetFor, general);

        $(containerSelector).prepend(dom);
        
        let targetEditable = `${editableClass}[${targetAttr}][data='${dataFor}']`;

        domShow(`${saveAllButtonClass}[${targetAttr}]`);
        domHide(assignButtonClass);
        enableEditable(targetEditable);
        $(`${saveButtonClass}[${targetAttr}]`).click();

        let target = $(targetEditable);
        if (target.attr("type") == "file") {
            target.removeAttr("contenteditable");
        }

    });

    $(saveButtonClass).click(function (e) {
        e.preventDefault();

        let targetFor = $(this).attr("target");
        let targetAttr = `target='${targetFor}'`;
        let dataFor = $(this).attr("data");

        let targetAddButton = `${addButtonClass}[${targetAttr}]`;

        let dom = $(`.addedContent[data="${dataFor}"]`);

        let suffixValue = (new Date()).getTime();

        dom.find("[modify]").append(function () {
            let generalClass = "btn btn-sm";
            let generalInfo = `${targetAttr} data="${dataFor}" ${suffix}="${suffixValue}"`;
            return `<input name="jobs" ${generalInfo} class="hidden" type="checkbox"/>
                    <${button} ${generalInfo} type=${button} class="${editButton} btn-primary ${generalClass}">${edit}</${button}>
                    <${button} ${generalInfo} type=${button} class="${updateButton} btn-success ${generalClass}" for-detail="${dataFor}" hidden="hidden">${save}</${button}>`
        }).removeAttr("modify");

        dom.find(editableClass).attr(suffix, suffixValue);
        dom.find(source).attr(suffix, suffixValue);

        dom.find(editButtonClass).click(initEditButton);
        dom.find(updateButtonClass).click(initUpdateButton);

        domShow(targetAddButton);
        domHide(this);

        $(".addedContent").removeAttr("class");
        dom.find(editButtonClass).click();

        $(`${saveAllButtonClass}:visible`).off().click(function () {
            let updates = $(`${updateButtonClass}:visible`);
            updates.get().forEach(x => x.click());
            let success = updates.html() === save && (new Set(updates.get().map(x => $(x).html()))).size === 1;
            let interval = self.setInterval(function () {
                if (success) {
                    domShow(editButtonClass);
                    disableEditable(editableClass);
                    window.clearInterval(interval);
                    hideColums();
                }
                success = updates.html() === save && (new Set(updates.get().map(x => $(x).html()))).size === 1;
            }, 200);
        });
    });
    
    $(exportButtonClass).click(function (e){
        e.preventDefault();
        let dataFor = $(this).attr("workId");
        window.location.href = `/export?workId=${dataFor}`;
    });
    
    $(".toggleAdminButton").click(function (e) {
        $("#item-container[data='admin']").toggle("slow");
    });

    $(".toggleContractorButton").click(function (e) {
        $("#item-container[data='contractor']").toggle("slow");
    });
    
    $(checkBox).get().forEach(x => {
        $(x).prop("checked", $(x).val() === "True");
    });

    $(checkBox).on("change", initCheckBox);

    $(select).change(function() {
        $(this).find("option").removeAttr("selected");
        $(this.selectedOptions[0]).attr("selected", "selected");
    });
    
    $(contractorListClass).change(function () {
        let id = $(this).val();
        $("[name='jobs']").get().forEach(x => {
            let assigned = $(x).attr("assigned");
            x.checked = assigned === id;
        });
    });
    
    $(".toggle_hidden_text").click(function() {
       let target = $(this).attr("target");
       $(`.hidden_text[toggle='${target}']`).toggle();
    });
    
    $("#nav-files-tab").click(function() {
       let containers = $(".imgContainer").get();
       for (let i = 0; i < containers.length; i++) {
           let imgs = $(containers[i]).find(".imgContent").val().split(",").map(x => `<img src="/download/${x}" class="rounded"/>`);
           $(containers[i]).find("img").remove();
           $(containers[i]).append(imgs);
       }
    });

    const codeTable = $('#nav-tasks > table').DataTable({
        info: false,
        paging: false,
        searching: true,
        ordering: false
    });

    $(codeInitSelectId).change(function () {
        let capital = $(this).val();
        codeTable.columns(1).search("^" + capital, true, true).draw();
    });
    
    $(checkAll).click(function () {
        let checked = $(this).prop("checked");
        $(`#item-container ${assignCheckBoxClass}`).prop("checked", checked);
    });

    $("#setupheader").click(function () {
        promptInput("Setup Header Display", `Input the <b>Index of Headers</b> you want to display or show by default.</br></br>For example, if you enter 1,2,4, then the 1st, 2nd and 4th columns will be invisible, if you enter 1, 3 again, the 2nd and 4th columns will show up but 1st and 3rd column will disappear.</br></br> Enter 0 to display all columns</br></br>Current ${(localStorage['hiddenColumns'] ? localStorage['hiddenColumns'] : "NO")} columns are hidden`, function (info) {
            localStorage['hiddenColumns'] = info;
            hideColums();
        });

    });

    $("#attachButton").on("click", function (e) {
        e.preventDefault();
        $('#attachFile').click();
    });

    $('#attachFile').change(function () {
        abp.notify.info(l("Running Task"));
        let form = $('#attachForm');
        form.ajaxForm({
            dataType: "json",
            contentType: "multipart/form-data",
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                if (data === "Error") {
                    promptError("File Not Correct!");
                }
                else {
                    promptOK();
                    $("#mailAttachment").html(data).attr("href", `/download/${data}`);
                    $('#attachFile').val(null);
                }
            }
        });

        form.submit();
    });

    const isAdmin = abp.auth.isGranted("AbpIdentity.Roles.ManagePermissions");
    const data = abp.libs.datatables.normalizeConfiguration({
        serverSide: true,
        paging: true,
        searching: true,
        sorting: false,
        scrollX: true,
        ajax: abp.libs.datatables.createAjax(works.dispatcher.works.work.getCodes),
        columnDefs: [
            {
                title: l('Code'),
                data: "code"
            },
            {
                title: l('Price'),
                data: isAdmin ? "price" : "contractorPrice"
            },
            {
                title: l('Description'),
                data: "shortDescription"
            },
        ]
    });
    $('#CodeTable').DataTable(data);

    hideColums();
});