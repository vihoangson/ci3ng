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
        'title' => 'D&#39;Artistry Hair Salon',
        'theme' => 'homer', // inspinia, homer, classic
        'defaultRoute' => 'calendar',
        'imageAllowedExt' => 'gif,jpeg,jpg,png',
        'imageMaxSize' => 2097152, // 2MB
        'sendBookingEmail' => 1,
        'showAddEventLink' => 1,
        'bookingEmailTitle' => 'Booking Conformation',
        'eventLocation' => 'New Star Hairdressing Saloon, Singapore'
    ],
    'paths' => [
        'api' => __DIR__ . '/../../../public/api',
        'upload' => __DIR__ . '/../../../public/uploads'
    ],
    'urls' => [
        'reset' => '/#/reset?k=',
    ]
];