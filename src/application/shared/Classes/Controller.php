<?php namespace Shared\Classes;

use Doctrine\DBAL\Logging\DebugStack,
    Chaos\Common\AbstractCodeIgniterRestController;

require __DIR__ . '/../../../vendor/chriskacerguis/codeigniter-restserver/application/libraries/REST_Controller.php';

/**
 * Class Controller
 * @author ntd1712
 */
abstract class Controller extends AbstractCodeIgniterRestController
{
    /** {@inheritdoc} */
    public function __construct()
    {
        global $active_group, $db;
        require_once APPPATH . 'config/database.php';

        parent::__construct(
            array_replace_recursive([
                'app' => $config = get_config([
                    'key' => env('APP_KEY')
                ]),
                'db' => [
                    'driver' => $db[$active_group]['dbdriver'],
                    'user' => $db[$active_group]['username'],
                    'host' => $db[$active_group]['hostname'],
                    'dbname' => $db[$active_group]['database'],
                    'charset' => $db[$active_group]['char_set']
                ] + $db[$active_group],
                'orm' => [
                    'cache' => [
                        'provider' => env('CACHE_DRIVER', 'array'),
                        'filesystem' => [
                            'directory' => APPPATH . 'cache',
                            'extension' => '.' . $config['cookie_prefix'] . '.data'
                        ]
                    ],
                    'metadata' => [
                        'driver' => 'annotation',
                        'paths' => require_once __DIR__ . '/../Modules/doctrine.paths.php',
                        'simple' => false
                    ],
                    'proxy' => [
                        'auto_generate' => $db[$active_group]['db_debug'] ? 2 : 0,
                        'dir' => APPPATH . 'cache/proxies',
                        'namespace' => null,
                    ],
                    'default_repository' => 'Doctrine\ORM\EntityRepository',
                    'is_dev_mode' => $db[$active_group]['db_debug'],
                    'sql_logger' => $db[$active_group]['db_debug'] ? new DebugStack : null,
                ],
                'mail' => [
                    'driver' => env('MAIL_DRIVER'),
                    'host' => env('MAIL_HOST'),
                    'port' => env('MAIL_PORT'),
                    'encryption' => env('MAIL_ENCRYPTION'),
                    'username' => env('MAIL_USERNAME'),
                    'password' => env('MAIL_PASSWORD')
                ],
                'session' => [
                    'cookie' => $config['sess_cookie_name'],
                    'expires' => $config['sess_expiration'],
                    'path' => $config['cookie_path'],
                    'domain' => $config['cookie_domain'],
                    'secure' => $config['cookie_secure'],
                    'http_only' => $config['cookie_httponly']
                ],
                'paths' => ['config' => $configPath = __DIR__ . '/../Modules/config.params.php'],
            ], require_once $configPath),
            require_once __DIR__ . '/../Modules/config.services.php'
        );
    }
}