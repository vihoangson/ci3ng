<?php

use Doctrine\DBAL\Logging\DebugStack,
    Chaos\Doctrine\EntityManagerFactory;

define('ENVIRONMENT', isset($_SERVER['CI_ENV']) ? $_SERVER['CI_ENV'] : env('APP_ENV'));
define('BASEPATH', true);
define('APPPATH', __DIR__ . '/application/system/');

global $active_group, $db;
require_once __DIR__ . '/application/shared/bootstrap.php';
require_once APPPATH . 'config/config.php';
require_once APPPATH . 'config/database.php';

$config = [
    'db' => $db[$active_group] + [
        'driver' => $db[$active_group]['dbdriver'],
        'user' => $db[$active_group]['username'],
        'host' => $db[$active_group]['hostname'],
        'dbname' => $db[$active_group]['database'],
        'prefix' => $db[$active_group]['dbprefix'],
        'charset' => $db[$active_group]['char_set']
    ],
    'orm' => [
        'cache' => [
            'provider' => env('CACHE_DRIVER'),
            'file' => [
                'directory' => APPPATH . 'cache/',
                'extension' => '.' . env('COOKIE_PREFIX') . '.data'
            ]
        ],
        'metadata' => [
            'driver' => 'annotation',
            'paths' => require_once __DIR__ . '/application/shared/Modules/doctrine.paths.php',
            'simple' => false
        ],
        'proxy_classes' => [
            'auto_generate' => $db[$active_group]['db_debug'] ? 2 : 0,
            'directory' => APPPATH . 'cache/proxies/',
            'namespace' => null,
        ],
        'debug' => $db[$active_group]['db_debug'],
        'default_repository' => DOCTRINE_ENTITY_REPOSITORY,
        'sql_logger' => $db[$active_group]['db_debug'] ? new DebugStack : null,
    ]
];

$entityManager = (new EntityManagerFactory)->setConfig($config)->getEntityManager();
return \Doctrine\ORM\Tools\Console\ConsoleRunner::createHelperSet($entityManager);