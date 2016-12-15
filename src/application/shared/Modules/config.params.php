<?php return [
    'app' => [
        'datetimeFormat' => 'Y-m-d H:i:s',
        'dateFormat' => 'Y-m-d',
        'timeFormat' => 'H:i:s',
        'itemsPerPage' => 10,
        'maxItemsPerPage' => 100,
        'minSearchChars' => 4,
        // specific
        'copyright' => '&copy; 2016 My Company',
        'title' => 'Admin Panel',
        'theme' => 'homer', // inspinia, homer, classic
        'defaultRoute' => 'setting.index',
        'imageAllowedExt' => 'gif,jpeg,jpg,png',
        'imageMaxSize' => 2097152 // 2MB
    ],
    'paths' => [
        'api' => __DIR__ . '/../../../public/api',
        'upload' => __DIR__ . '/../../../public/uploads'
    ],
    'urls' => [
        'reset' => '/#/reset?k=',
    ]
];