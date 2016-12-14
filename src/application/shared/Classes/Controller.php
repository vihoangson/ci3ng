<?php namespace Shared\Classes;

use Chaos\Common\AbstractCodeIgniterRestController;

/**
 * Class Controller
 * @author ntd1712
 */
abstract class Controller extends AbstractCodeIgniterRestController
{
    /** {@inheritdoc} */
    public function __construct()
    {
        parent::__construct(
            array_replace_recursive([
                'app' => ($config = get_config()) + [
                    'key' => env('APP_KEY')
                ],
                'session' => [
                    'cookie' => $config['sess_cookie_name'],
                    'expires' => $config['sess_expiration'],
                    'path' => $config['cookie_path'],
                    'domain' => $config['cookie_domain'],
                    'secure' => $config['cookie_secure'],
                    'http_only' => $config['cookie_httponly']
                ],
                'mail' => [
                    'driver' => env('MAIL_DRIVER'),
                    'host' => env('MAIL_HOST'),
                    'port' => env('MAIL_PORT'),
                    'encryption' => env('MAIL_ENCRYPTION'),
                    'username' => env('MAIL_USERNAME'),
                    'password' => env('MAIL_PASSWORD')
                ],
                'paths' => ['config' => $configPath = APPPATH . '/../shared/Modules/config.params.php'],
            ], require_once $configPath),
            require_once APPPATH . '/../shared/Modules/config.services.php'
        );
    }
}