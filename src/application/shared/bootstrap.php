<?php

define('CI_START', microtime(true));

// register the composer auto loader
require ($srcPath = __DIR__ . '/../../') . 'vendor/autoload.php';

// load environment file
(new Dotenv\Dotenv($srcPath))->load();