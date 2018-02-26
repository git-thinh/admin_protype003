function editCtrl($rootScope, $scope, API) {
    var moduleID = $scope.moduleID = 'edit';

    var para = $scope.getPara(moduleID);
    //console.log(moduleID, para);
    //console.log('callbackID', callbackID);

    var _kit_form = 'form_edit';

    var title = para['title'];
    var fields = para['fields'];
    var records = para['records'];
    var validate = para['validate'];

    $().w2form({
        name: _kit_form,
        header: title,
        fields: fields,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Save', type: 'button', caption: 'Save', icon: 'fa fa-save', checked: true }, 
                { id: 'Close', type: 'button', caption: 'Close', icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) { 
                if (event.target == 'Save') {
                    var vali = w2ui[_kit_form].validate();
                    if (vali != null && vali.length > 0) {
                        //w2alert('Vui lòng nhập chính xác dữ liệu!').ok(function () { console.log('ok'); });
                        return;
                    }

                    var data = w2ui[_kit_form].getChanges();

                    if (validate != null) {
                        var ok = validate(data);
                        if (ok == false) return;
                    }

                    if (data != null) {
                        for (var p in records) {
                            if (data[p])
                                _.extend(data[p], records[p]);
                            else
                                data[p] = records[p];
                        }
                    }
                    //console.log(data);

                    API.module_Callback(moduleID, { type: 'edit', item: data });
                    API.module_Close(moduleID, [_kit_form]);
                }
                if (event.target == 'Close') API.module_Close(moduleID, [_kit_form]);
            }
        },
        onRender: function (event) {
            event.onComplete = function () {

                for (var i = 0; i < fields.length; i++) {
                    var fi = fields[i]['field'];
                    w2ui[_kit_form].record[fi] = records[fi];
                }

                w2ui[_kit_form].refresh();
            }
        }
    });

    API.module_Render(moduleID, _kit_form);
}