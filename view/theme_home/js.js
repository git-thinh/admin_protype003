function theme_homeCtrl($rootScope, $scope, API) {
    var moduleID = $scope.moduleID = 'theme_home';

    var m_objectData = { recid: 1, html: 'ưerewrwr' };

    var _field_form = [
        {
            field: 'html', type: 'textarea', required: true, html: {
                caption: '&nbsp;',
                attr: ' style="position: fixed;left: 0;top: 71px;bottom: 3px;width: 100%;min-height: 50%;overflow-x: hidden;overflow-y: auto;" '
            }
        },
    ];

    var _kit_form = '_form_theme_home';

    /***************************************************/

    $().w2form({
        name: _kit_form,
        header: 'Cập nhật giao diện trang chủ',
        fields: _field_form,
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
                        return;
                    }

                    //var data = w2ui[_kit_form].getChanges();
                    m_objectData['html'] = w2ui[_kit_form].record.html;
                    console.log(' m_objectData = ', m_objectData);

                    w2confirm('Bạn chắc chắn muốn lưu thay đổi?')
                    .yes(function () {
                        API.module_Close(moduleID, [_kit_form]);
                    })
                    .no(function () {
                        API.module_Close(moduleID, [_kit_form]);
                    });

                }
                if (event.target == 'Close') API.module_Close(moduleID, [_kit_form]);
            }
        }, 
        onRender: function (event) {
            event.onComplete = function () { 
            }
        }
    });

    /***************************************************/


    $scope.submit = function () {
        console.log('SUBMIT = ', m_objectData);
    }

    $scope.callback = function (data) {
    };

    API.module_Render(moduleID, _kit_form);
}