function manager_menuCtrl($rootScope, $scope, API) {
    /***************************************************/
    /* VARIABLE */

    var moduleID = $scope.moduleID = 'manager_menu';
    var _hideMobile = $rootScope.device != 'mobile';

    var _field_grid = [
                { field: 'name', caption: 'Chuyên mục', size: '50%' },
                { field: 'link', caption: 'Liên kết', size: '50%' }
    ];
    var _field_form_add = [
        { field: 'pid', type: 'int', required: true, html: { caption: 'Mã nhóm', attr: 'disabled' } },
        { field: 'name', type: 'text', required: true, html: { caption: 'Chuyên mục' } },
        { field: 'link', type: 'text', required: true, html: { caption: 'Liên kết' } }
    ];
    var _field_form_edit = [
        { field: 'pid', type: 'int', required: true, html: { caption: 'Mã nhóm', attr: 'disabled' } },
        { field: 'name', type: 'text', required: true, html: { caption: 'Chuyên mục' } },
        { field: 'link', type: 'text', required: true, html: { caption: 'Liên kết' } }
    ];

    var _kit_grid = 'grid_menu_edit';
    if (w2ui[_kit_grid] != null) w2ui[_kit_grid].destroy();

    var m_listData = [
                { recid: 2, pid: 0, name: 'keywords', link: '' },
                { recid: 21, pid: 2, name: 'computer', link: '' },
                { recid: 22, pid: 2, name: 'ads', link: '' },
                { recid: 23, pid: 2, name: 'online', link: '' },
                { recid: 3, pid: 0, name: 'sale', link: '' },
    ];

    /***************************************************/
    /* FUNCTION */

    $scope.close = function () {
        if (module.mode == 'select') {
            API.module_Close(moduleID);
        } else {
            w2confirm('Bạn chắc chắn muốn thoát?')
               .yes(function () {
                   API.module_Close(moduleID);
               }).no(function () { });
        }
    }

    $scope.bindData = function () {
        var mn_root = _.filter(m_listData, function (mn) { return mn.pid == 0; });
        if (mn_root == null || mn_root.length == 0) mn_root = [];
        if (w2ui[_kit_grid] != null) {
            w2ui[_kit_grid].clear();
            w2ui[_kit_grid].records = mn_root;
            w2ui[_kit_grid].total = mn_root.length;
            w2ui[_kit_grid].refresh();
        }
    };

    $scope.submit = function () {
        console.log('SUBMIT = ', m_listData);
    }

    /***************************************************/
    /* EVENT */

    $scope.toolbar_RootClick = function (event) {
        switch (event.target) {
            case 'btn_add':
                API.plugin_Load('add', moduleID, {
                    title: 'Thêm mới chuyên mục',
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
                    title: 'Cập nhật chuyên mục',
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
                    title: 'Bạn đồng ý xóa chuyên mục?',
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
                scope(module.id).close();
                break;
        }
    }

    $scope.toolbar_SubClick = function (event, _pid) {
        switch (event.target) {
            case 'btn_add':
                API.plugin_Load('add', moduleID, {
                    title: 'Thêm mới chuyên mục',
                    property: { pid: _pid },
                    fields: _field_form_add,
                });
                break;
            case 'btn_edit':
                var itemSel = w2ui[_kit_grid_sub].getSelection();
                if (itemSel.length != 1) {
                    w2alert('Vui lòng chọn duy nhất 1 bản ghi để cập nhật');
                    return;
                }
                var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                console.log('edit = ', mn_edit);

                API.plugin_Load('edit', moduleID, {
                    title: 'Cập nhật chuyên mục',
                    fields: _field_form_edit,
                    records: mn_edit[0],
                });
                break;
            case 'btn_remove':
                var itemSel = w2ui[_kit_grid_sub].getSelection();
                if (itemSel.length == 0) {
                    w2alert('Vui lòng chọn 1 bản ghi để xóa');
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.plugin_Load('remove', moduleID, {
                    title: 'Bạn đồng ý xóa chuyên mục?',
                    fields: _field_grid,
                    records: mn_remove,
                });

                break;
        }
    }

    /***************************************************/
    /* VIEW */

    $().w2grid({
        name: _kit_grid,
        header: 'Quản lý chuyên mục',
        show: {
            header: true,
            toolbar: true,
            footer: true,
            lineNumbers: _hideMobile,
            toolbarReload: false,
            toolbarColumns: false,
            selectColumn: _hideMobile,
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
                scope(module.id).toolbar_RootClick(event);
            }
        },
        onExpand: function (event) {

            if (w2ui.hasOwnProperty('subgrid-' + event.recid)) w2ui['subgrid-' + event.recid].destroy();
            $('#' + event.box_id).css({ margin: '0px', padding: '0px', width: '100%' }).animate({ height: '205px' }, 100);

            setTimeout(function () {
                var _pid = event.recid;
                var _kit_grid_sub = 'subgrid-' + _pid;

                if (w2ui[_kit_grid_sub] != null) w2ui[_kit_grid_sub].destroy();

                var mn_sub = _.filter(m_listData, function (mn) { return mn.pid == _pid; });
                if (mn_sub == null || mn_sub.length == 0) mn_sub = [];

                $('#' + event.box_id)
                    .w2grid({
                        name: _kit_grid_sub,
                        show: {
                            toolbar: true,
                            footer: true,
                            lineNumbers: _hideMobile,
                            toolbarReload: false,
                            toolbarColumns: false,
                            selectColumn: _hideMobile,
                            columnHeaders: true,
                        },
                        multiSearch: false,
                        multiSelect: $rootScope.device != 'mobile',
                        searches: [
                            { field: 'name', caption: 'Tìm kiếm', type: 'text' },
                        ],
                        fixedBody: true,
                        columns: _field_grid,
                        records: mn_sub,
                        toolbar: {
                            items: [
                                { type: 'spacer' },
                                { id: 'btn_add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                                { id: 'btn_edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                                { id: 'btn_remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true }
                            ],
                            onClick: function (event) {
                                scope(module.id).toolbar_SubClick(event, _pid);
                            }
                        },
                    });

                w2ui['subgrid-' + event.recid].resize();

            }, 300);
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    });

    /***************************************************/
    /* END MODULE */

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
                var pid = item[0]['pid'];
                var keys = _.pluck(item, 'recid');
                console.log('REMOVE = ', keys);
                console.log('REMOVE pid = ', pid);

                var rs = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });
                m_listData = _.filter(rs, function (mn) { return keys.indexOf(mn.pid) == -1; });

                console.log('REMOVE = ', m_listData);

                $scope.bindData();
                break;
        }
    };

    API.module_Render(moduleID, _kit_grid);
}