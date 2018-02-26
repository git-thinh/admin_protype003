function manager_userCtrl($rootScope, $scope, API) {
    var moduleID = $scope.moduleID = 'manager_user';

    var _field_grid = [
                { field: 'username', caption: 'Tài khoản', size: '30%' },
                { field: 'password', caption: 'Mật khẩu', hidden: true },
                { field: 'fullname', caption: 'Họ tên', size: '40%' },
    ];
    var _field_form_add = [
        { field: 'username', type: 'text', required: true, html: { caption: 'Tài khoản', attr: '' } },
        { field: 'password', type: 'password', required: true, html: { caption: 'Mật khẩu' } },
        { field: 'fullname', type: 'text', required: true, html: { caption: 'Họ tên' } }
    ];
    var _field_form_edit = [
        { field: 'username', type: 'text', required: true, html: { caption: 'Tài khoản', attr: 'disabled' } },
        { field: 'password', type: 'password', required: true, html: { caption: 'Mật khẩu' } },
        { field: 'fullname', type: 'text', required: true, html: { caption: 'Họ tên' } }
    ];

    var _kit_grid = 'grid_user';

    /***************************************************/

    var m_listData = [
                { recid: 1, username: 'admin', password: 'admin', fullname: 'Mr Thinh' },
                { recid: 2, username: 'member', password: 'member', fullname: 'Mr Member' },
    ];

    /***************************************************/

    if (w2ui[_kit_grid] != null) w2ui[_kit_grid].destroy();
    $().w2grid({
        name: _kit_grid,
        header: 'Quản lý tài khoản',
        show: {
            header: true,
            toolbar: true,
            footer: true,
            lineNumbers: true,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: $rootScope.device != 'mobile',
            columnHeaders: true,
        },
        multiSearch: false,
        multiSelect: $rootScope.device != 'mobile',
        searches: [
            { field: 'name', caption: 'Tìm kiếm', type: 'text' },
        ],
        columns: _field_grid,
        records: [],
        toolbar: {
            items: [
                { id: 'btn_add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'btn_edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'btn_remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { type: 'spacer' },
                { id: 'btn_save', type: 'button', caption: '', icon: 'fa fa-save', checked: true },
                { id: 'btn_close', type: 'button', caption: '', icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                switch (event.target) {
                    case 'btn_add':
                        API.plugin_Load('add', moduleID, {
                            title: 'Thêm mới tài khoản',
                            property: { pid: 0 },
                            fields: _field_form_add
                        });
                        break;
                    case 'btn_edit':
                        var itemSel = w2ui[_kit_grid].getSelection();
                        if (itemSel.length != 1) {
                            w2alert('Vui lòng chọn duy nhất 1 bản ghi để cập nhật');
                            return;
                        }

                        var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                        console.log('edit = ', mn_edit);

                        API.plugin_Load('edit', moduleID, {
                            title: 'Cập nhật tài khoản',
                            fields: _field_form_edit,
                            records: mn_edit[0],
                        });
                        break;
                    case 'btn_remove':
                        var itemSel = w2ui[_kit_grid].getSelection();
                        if (itemSel.length == 0) {
                            w2alert('Vui lòng chọn 1 bản ghi để xóa');
                            return;
                        }

                        var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                        //console.log('SELECT = ', mn_remove);

                        API.plugin_Load('remove', moduleID, {
                            title: 'Bạn đồng ý xóa tài khoản?',
                            fields: _field_grid,
                            records: mn_remove,
                        });

                        break;
                    case 'btn_save':
                        w2confirm('Bạn chắc chắn muốn lưu lại các thay đổi?')
                           .yes(function () {
                               $scope.submit();
                           }).no(function () { });
                        break;
                    case 'btn_close':
                        w2confirm('Bạn chắc chắn muốn thoát?')
                           .yes(function () {
                               API.module_Close(moduleID, [_kit_grid]);
                           }).no(function () { });
                        break;
                }
            }
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    });

    /***************************************************/

    $scope.bindData = function () {
        if (w2ui[_kit_grid] != null) {
            w2ui[_kit_grid].clear();
            w2ui[_kit_grid].records = m_listData;
            w2ui[_kit_grid].total = m_listData.length;
            w2ui[_kit_grid].refresh();
        }
    };

    $scope.submit = function () {
        console.log('SUBMIT = ', m_listData);
    }

    $scope.callback = function (data) {
        console.log('callback = ', data);
        var item = data['item'];
        var type = data['type'];
        if (item == null || item.length == 0) return;
        switch (type) {
            case 'add':
                var recid = (_.max(m_listData, function (it) { return it.recid; }))['recid'] + 1;
                var pid = parseInt(item['pid']);
                item['recid'] = recid;
                item['pid'] = pid;
                m_listData.push(item);

                $scope.bindData();

                console.log('ADD item = ', item);
                console.log('ADD = ', m_listData);
                break;
            case 'edit':
                var aNew = [];
                for (var i = 0; i < m_listData.length; i++) {
                    if (item['recid'] == m_listData[i]['recid'])
                        aNew.push(item);
                    else
                        aNew.push(m_listData[i]);
                }
                m_listData = aNew;

                $scope.bindData();
                break;
            case 'remove':
                var keys = _.pluck(item, 'recid');
                m_listData = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });

                console.log('REMOVE = ', keys);
                console.log('REMOVE = ', m_listData);

                $scope.bindData();
                break;
        }
    };

    API.module_Render(moduleID, _kit_grid);
}