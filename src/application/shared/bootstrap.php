<?php

// register Composer autoload
require ($srcPath = __DIR__ . '/../../') . 'vendor/autoload.php';

// load .env
(new Dotenv\Dotenv($srcPath))->load();