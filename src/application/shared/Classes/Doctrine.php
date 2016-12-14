<?php namespace Shared\Classes;

use Doctrine\Common\ClassLoader,
    Doctrine\ORM\Configuration,
    Doctrine\ORM\EntityManager,
    Doctrine\Common\Cache\ArrayCache,
    Doctrine\DBAL\Logging\EchoSQLLogger;

/**
 * Class Doctrine
 * @author ntd1712
 */
class Doctrine
{
    /** @var EntityManager */
    public $em;

    public function __construct()
    {
        // Set up class loading. You could use different autoloaders, provided by your favorite framework,
        // if you want to.
        // require_once APPPATH . '/../vendor/libraries/Doctrine/Common/ClassLoader.php';

        $doctrineClassLoader = new ClassLoader('Doctrine', APPPATH . 'libraries');
        $doctrineClassLoader->register();
        $entitiesClassLoader = new ClassLoader('entities', rtrim(APPPATH, "/"));
        $entitiesClassLoader->register();
        $proxiesClassLoader = new ClassLoader('Proxies', APPPATH . 'cache/doctrine/proxies');
        $proxiesClassLoader->register();

        // Create EntityManager
        $this->em = EntityManager::create($this->getConnection(), $this->getConfig(), $this->getEventManager());
    }

    /**
     * @return  array
     */
    protected function getConnection()
    {
        global $active_group, $db;
        require_once APPPATH . 'config/database.php';

        switch ($db[$active_group]['dbdriver'])
        {
            case 'oci8':
                $driver = 'oci8';
                break;
            case 'mysql':
            case 'mysqli':
            default:
                $driver = 'pdo_mysql';
        }

        return [
            'driver' => $driver,
            'host' => $db[$active_group]['hostname'],
            'user' => $db[$active_group]['username'],
            'password' => $db[$active_group]['password'],
            'dbname' => $db[$active_group]['database']
        ];
    }

    /**
     * @return  \Doctrine\ORM\Configuration
     */
    protected function getConfig()
    {
        $config = new Configuration;
        $cache = new ArrayCache;
        $config->setMetadataCacheImpl($cache);
        $driverImpl = $config->newDefaultAnnotationDriver([APPPATH . 'shared/Modules/Account/Entities']);
        $config->setMetadataDriverImpl($driverImpl);
        $config->setQueryCacheImpl($cache);

        $config->setQueryCacheImpl($cache);

        // Proxy configuration
        $config->setProxyDir(APPPATH . 'cache/doctrine/proxies');
        $config->setProxyNamespace('Proxies');

        // Set up logger
        $logger = new EchoSQLLogger;
        $config->setSQLLogger($logger);

        $config->setAutoGenerateProxyClasses(true);

        return $config;
    }

    /**
     * @return  \Doctrine\Common\EventManager
     */
    protected function getEventManager()
    {
        return null;
    }
}