function manager_articleCtrl($rootScope, $scope, $controller, API) {
    /***************************************************/
    /* VARIABLE */

    var module = $scope.module;
    var moduleID = module.id;
    console.log(module);

    var _hideMobile = $rootScope.device != 'mobile';

    var _lookupID_selectImage = $rootScope.lookupID({
        code: 'manager_image',
        backID: module.id,
        backEvent: function (v_module, v_value) { 
            var arrayPhoto = [];
            for (var propertyName in v_value)
                arrayPhoto.push(v_value[propertyName]);
            var data = arrayPhoto.join(';');

            var backTarget = v_module['backTarget'];
            backTarget.value = data;

            //console.log('_lookupID_selectImage module = ', v_module);
            //console.log('_lookupID_selectImage data = ',data);

            API.module_Close(v_module.id);
        },
        para: {
            title: 'Chọn hình ảnh',
            fields: []
        }
    });
    $rootScope.regKit(moduleID, _lookupID_selectImage);

    //$rootScope.regKit(moduleID, _lookupID_selectImage);
    var _kit_grid = 'grid_' + moduleID;
    $rootScope.regKit(moduleID, _kit_grid);

    var _field_grid = [
                { field: 'url', caption: 'Liên kết', hidden: true },
                { field: 'title', caption: 'Tiêu đề', size: '90%' },
                { field: 'active', caption: 'OK', size: '33px', editable: { type: 'checkbox', style: 'text-align: center;pointer-events: none;' } },
                { field: 'tag', caption: 'Tag', hidden: true },
                { field: 'image', caption: 'Hình ảnh', hidden: true },
                { field: 'image_position', caption: 'Vị trí ảnh', hidden: true },
                { field: 'description', caption: 'Mô tả', hidden: true },
                { field: 'content', caption: 'Nội dung', hidden: true },
    ];
    var _field_form_add = [
        { field: 'url', type: 'text', required: true, html: { caption: 'URL', attr: '' } },
        { field: 'title', type: 'text', required: true, html: { caption: 'Tiêu đề', attr: '' }, page: 99, column: 99 },
        { field: 'active', type: 'checkbox', required: true, html: { caption: 'Kích hoạt', attr: '' } },
        { field: 'tag', type: 'text', required: true, html: { caption: 'Tag', attr: '' } },
        {
            field: 'image', type: 'text', html: {
                caption: 'Hình ảnh', attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectImage + '\', event)" '
            }
        },
        {
            field: 'image_position', type: 'select', required: true, html: { caption: 'Vị trí ảnh', attr: '' },
            options: {
                items: [{ id: 1, text: 'Ngẫu nhiên' }, { id: 2, text: 'Đầu bài viết' }, { id: 3, text: 'Cuối bài viết' }],
            },
        },
        { field: 'description', type: 'textarea', required: true, html: { caption: 'Mô tả', attr: '' } },
        { field: 'content', type: 'textarea', required: true, html: { caption: 'Nội dung', attr: '' } },
    ];
    var _field_form_edit = [
        { field: 'url', type: 'text', required: true, html: { caption: 'URL', attr: '' } },
        { field: 'title', type: 'text', required: true, html: { caption: 'Tiêu đề', attr: '' }, page: 99, column: 99 },
        { field: 'active', type: 'checkbox', required: true, html: { caption: 'Kích hoạt', attr: '' } },
        { field: 'tag', type: 'text', required: true, html: { caption: 'Tag', attr: '' } },
        {
            field: 'image', type: 'text', html: {
                caption: 'Hình ảnh', attr: ' readonly="readonly" onclick="module_Load(\'' + _lookupID_selectImage + '\', event)" '
            }
        },
        {
            field: 'image_position', type: 'select', required: true, html: { caption: 'Vị trí ảnh', attr: '' },
            options: {
                items: [{ id: 1, text: 'Ngẫu nhiên' }, { id: 2, text: 'Đầu bài viết' }, { id: 3, text: 'Cuối bài viết' }],
            },
        },
        { field: 'description', type: 'textarea', required: true, html: { caption: 'Mô tả', attr: '' } },
        { field: 'content', type: 'textarea', required: true, html: { caption: 'Nội dung', attr: '' } },
    ];

    var m_listData = [
                { recid: 1, title: 'Cụm danh từ và một số cấu trúc câu tiếng anh phổ biến', active: true, tag: '', image: '', url: '', description: '', content: '' },
                { recid: 2, title: 'Sở hữu cách trong tiếng Anh', active: true, tag: '', image: '', url: '', description: '', content: '' },
                { recid: 3, title: 'Cách sử dụng How much, How many trong tiếng Anh', active: true, tag: '', image: '', url: '', description: '', content: '' },
    ];

    var _config_grid = {
        name: _kit_grid,
        header: 'Quản lý bài viết',
        show: {
            header: true,
            toolbar: true,
            footer: true,
            lineNumbers: true,
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
                { id: 'add', type: 'button', caption: '', icon: 'fa fa-plus', checked: true },
                { id: 'edit', type: 'button', caption: '', icon: 'fa fa-edit', checked: true },
                { id: 'remove', type: 'button', caption: '', icon: 'fa fa-trash', checked: true },
                { type: 'spacer' },
                { id: 'close', type: 'button', caption: '', icon: 'fa fa-close', checked: true },
            ],
            onClick: function (event) {
                scope(module.id).toolbarClick(event);
            },
        },
        onRender: function (event) {
            event.onComplete = function () {
                $scope.bindData();
            }
        }
    };

    if (module.mode == 'select')
        _config_grid = {
            name: _kit_grid,
            header: 'Chọn bài viết',
            show: {
                header: true,
                toolbar: true,
                footer: true,
                lineNumbers: true,
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
                    { type: 'spacer' },
                    { id: 'select', type: 'button', caption: '', icon: 'fa fa-save', checked: true },
                    { id: 'close', type: 'button', caption: '', icon: 'fa fa-close', checked: true },
                ],
                onClick: function (event) {
                    scope(module.id).toolbarClick(event);
                },
            },
            onRender: function (event) {
                event.onComplete = function () {
                    $scope.bindData();
                }
            }
        };

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

    /***************************************************/
    /* EVENT */

    $scope.toolbarClick = function (event) {
        switch (event.target) {
            case 'add':
                API.module_Load({
                    code: 'add',
                    backID: module.id,
                    para:
                    {
                        title: 'Thêm mới bài viết',
                        property: { pid: 0 },
                        fields: _field_form_add,
                        config: {
                            record: {
                                image_position: 1
                            },
                        }
                    }
                });
                break;
            case 'edit':
                var itemSel = w2ui[_kit_grid].getSelection();
                if (itemSel.length != 1) {
                    w2alert('Vui lòng chọn duy nhất 1 bản ghi để cập nhật');
                    return;
                }

                var mn_edit = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                console.log('edit = ', mn_edit);

                API.module_Load({
                    code: 'edit',
                    backID: module.id,
                    para:
                    {
                        title: 'Cập nhật bài viết',
                        property: { pid: 0 },
                        fields: _field_form_edit,
                        records: mn_edit[0],
                        config: {
                            record: {
                                image_position: 1
                            },
                        }
                    }
                }); 
                break;
            case 'remove':
                var itemSel = w2ui[_kit_grid].getSelection();
                if (itemSel.length == 0) {
                    w2alert('Vui lòng chọn 1 bản ghi để xóa');
                    return;
                }

                var mn_remove = _.filter(m_listData, function (mn) { return itemSel.indexOf(mn.recid) != -1; });
                //console.log('SELECT = ', mn_remove);

                API.plugin_Load('remove', module.id, {
                    title: 'Bạn đồng ý xóa bài viết?',
                    fields: _field_grid,
                    records: mn_remove,
                });

                break;
            case 'select':
                API.module_Callback(module.backID, { type: 'select', item: m_listData });
                scope(module.id).close();
                break;
            case 'close':
                scope(module.id).close();
                break;
        }
    };

    /***************************************************/
    /* VIEW */

    $().w2grid(_config_grid);

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
                var keys = _.pluck(item, 'recid');
                m_listData = _.filter(m_listData, function (mn) { return keys.indexOf(mn.recid) == -1; });

                console.log('REMOVE = ', keys);
                console.log('REMOVE = ', m_listData);

                $scope.bindData();
                break;
        }
    };

    API.module_Render(module.id, _kit_grid);
}