function removeCtrl($rootScope, $scope, API) {
    var moduleID = $scope.moduleID = 'remove';

    var para = $scope.getPara(moduleID); 
    //console.log(moduleID, para);
    //console.log('callbackID', callbackID);

    var _kit_form = 'form_remove';

    var title = para['title'];
    var fields = para['fields'];
    var records = para['records'];

    $().w2grid({
        name: _kit_form,
        header: title,
        show: {
            header: true,
            toolbar: true,
            footer: true,
            lineNumbers: true,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: true,
            columnHeaders: true,
        },
        multiSearch: false,
        multiSelect: true,
        searches: [
            { field: 'name', caption: 'Tìm kiếm', type: 'text' },
        ],
        columns: fields,
        records: records,
        toolbar: {
            items: [
                { type: 'spacer' },
                { id: 'Remove', type: 'button', caption: 'Remove', icon: 'fa fa-trash', checked: true },
                { id: 'Close', type: 'button', caption: 'Close', icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) { 
                if (event.target == 'Remove') {

                    var itemSel = w2ui[_kit_form].getSelection();
                    if (itemSel.length == 0) return;

                    var a_remove = _.filter(records, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                    //console.log('a_remove = ', a_remove);
                    if (a_remove.length > 0) 
                        API.module_Callback(moduleID, { type: 'remove', item: a_remove });
                    API.module_Close(moduleID, [_kit_form]);
                }
                if (event.target == 'Close') API.module_Close(moduleID, [_kit_form]);
            }
        },
        onRender: function (event) {
            event.onComplete = function () {
                w2ui[_kit_form].selectAll();
            }
        }
    });

    API.module_Render(moduleID, _kit_form);
}