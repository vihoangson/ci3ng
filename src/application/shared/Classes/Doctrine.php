<?php namespace Shared\Classes;

use Doctrine\Common\Cache\ArrayCache,
    Doctrine\Common\Cache\CacheProvider,
    Doctrine\Common\Cache\FilesystemCache,
    Doctrine\Common\Cache\MemcacheCache,
    Doctrine\Common\Cache\RedisCache,
    Doctrine\Common\EventManager,
    Doctrine\Common\Persistence\Mapping\Driver\StaticPHPDriver,
    Doctrine\DBAL\Logging\DebugStack,
    Doctrine\ORM\Configuration,
    Doctrine\ORM\EntityManager,
    Doctrine\ORM\Event\LoadClassMetadataEventArgs,
    Doctrine\ORM\Events,
    Doctrine\ORM\Mapping\ClassMetadataInfo,
    Doctrine\ORM\Mapping\Driver\XmlDriver,
    Doctrine\ORM\Mapping\Driver\YamlDriver,
    Doctrine\ORM\Tools\Setup;

/**
 * Class Doctrine
 * @author ntd1712
 */
class Doctrine
{
    /** @var array */
    protected static $__config__;
    /** @var EntityManager */
    private static $__entityManager__;

    /**
     * @return  EntityManager
     */
    public static function getEntityManager()
    {
        if (null === self::$__entityManager__)
        {
            global $active_group, $db;
            require_once APPPATH . 'config/database.php';

            self::$__config__ = ['app' => get_config(), 'db' => $db[$active_group], 'orm' => [
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
                'sql_logger' => $db[$active_group]['db_debug'] ? new DebugStack : null,
            ]];

            self::$__entityManager__ = EntityManager::create(self::getDbParams(), self::getConfig(self::getCache()),
                self::getEventManager());
        }

        return self::$__entityManager__;
    }

    /**
     * @return  array
     */
    protected static function getDbParams()
    {
        $db = self::$__config__['db'];
        $dbParams = [
            'driver' => $db['dbdriver'],
            'user' => $db['username'],
            'password' => $db['password'],
            'host' => $db['hostname'],
            'port' => @$db['port'],
            'dbname' => $db['database'],
            'charset' => $db['char_set']
        ];

        switch ($dbParams['driver'])
        {
            case 'mysqli':
            case 'pdo_mysql':
                return $dbParams + [
                    'unix_socket' => @$db['unix_socket'],
                    'driverOptions' => isset($db['driverOptions']) ? $db['driverOptions'] : []
                ];
            case 'oci8':
            case 'pdo_oci':
                return $dbParams + [
                    'servicename' => @$db['servicename'],
                    'service' => @$db['service'],
                    'pooled' => @$db['pooled'],
                    'instancename' => @$db['instancename'],
                    'connectstring' => @$db['connectstring']
                ];
                break;
            default:
                throw new \RuntimeException(sprintf('Unsupported driver: %s', $dbParams['driver']));
        }
    }

    /**
     * @return  CacheProvider
     */
    protected static function getCache()
    {
        switch (env('CACHE_DRIVER', 'array'))
        {
            case 'array':
                return new ArrayCache;
            case 'filesystem':
                return new FilesystemCache(APPPATH . self::$__config__['app']['cache_path'],
                    '.' . self::$__config__['app']['cookie_prefix'] . '.data');
            case 'redis':
                global $config;
                require_once APPPATH . 'config/redis.php';

                $redis = new \Redis;
                $redis->connect($config['default']['hostname'], $config['default']['port']);
                $redis->select($config['default']['dbindex']);

                $cache = new RedisCache;
                $cache->setRedis($redis);

                return $cache;
            case 'memcached':
                global $config;
                require_once APPPATH . 'config/memcached.php';

                $memcache = new \Memcache;
                $memcache->connect($config['default']['hostname'], $config['default']['port'], $config['default']['weight']);

                $cache = new MemcacheCache;
                $cache->setMemcache($memcache);

                return $cache;
            default:
                return null;
        }
    }

    /**
     * @param   CacheProvider $cache
     * @return  Configuration
     */
    protected static function getConfig(CacheProvider $cache = null)
    {
        $orm = self::$__config__['orm'];
        $configuration = Setup::createConfiguration(self::$__config__['db']['db_debug'], $orm['proxy']['dir'], $cache);

        $configuration->setMetadataDriverImpl(self::getMetadataDriver($configuration, $orm['metadata']));
        $configuration->setCustomNumericFunctions([
            'ACOS' => 'DoctrineExtensions\Query\Mysql\Acos',
            'ASIN' => 'DoctrineExtensions\Query\Mysql\Asin',
            'ATAN' => 'DoctrineExtensions\Query\Mysql\Atan',
            'ATAN2' => 'DoctrineExtensions\Query\Mysql\Atan2',
            'COS' => 'DoctrineExtensions\Query\Mysql\Cos',
            'COT' => 'DoctrineExtensions\Query\Mysql\Cot',
            'DEGREES' => 'DoctrineExtensions\Query\Mysql\Degrees',
            'RADIANS' => 'DoctrineExtensions\Query\Mysql\Radians',
            'SIN' => 'DoctrineExtensions\Query\Mysql\Sin',
            'TAN' => 'DoctrineExtensions\Query\Mysql\Tan'
        ]);

        if (null !== $cache)
        {
            $configuration->setMetadataCacheImpl($cache);
            $configuration->setQueryCacheImpl($cache);
            $configuration->setResultCacheImpl($cache);
        }

        if (isset($orm['proxy']['namespace']))
        {
            $configuration->setProxyNamespace($orm['proxy']['namespace']);
        }

        $configuration->setAutoGenerateProxyClasses($orm['proxy']['auto_generate']);
        $configuration->setDefaultRepositoryClassName($orm['default_repository']);
        $configuration->setSQLLogger($orm['sql_logger']);

        return $configuration;
    }

    /**
     * @param   Configuration $config
     * @param   array $metadata
     * @return  \Doctrine\Common\Persistence\Mapping\Driver\MappingDriver
     */
    protected static function getMetadataDriver(Configuration $config, $metadata)
    {
        switch ($metadata['driver'])
        {
            case 'annotation':
                return $config->newDefaultAnnotationDriver($metadata['paths'], $metadata['simple']);
            case 'yaml':
                return new YamlDriver($metadata['paths']);
            case 'xml':
                return new XmlDriver($metadata['paths']);
            case 'static':
                return new StaticPHPDriver($metadata['paths']);
            default:
                throw new \RuntimeException(sprintf('Unsupported driver: %s', $metadata['driver']));
        }
    }

    /**
     * @return  EventManager
     */
    protected static function getEventManager()
    {
        $eventManager = new EventManager;

        if ($prefix = self::$__config__['db']['dbprefix'])
        {
            $eventManager->addEventListener(Events::loadClassMetadata, new TablePrefix($prefix));
        }

        return $eventManager;
    }
}

/**
 * Class TablePrefix
 * @author vittee
 */
class TablePrefix
{
    /** @var string */
    protected $prefix;

    /**
     * Constructor
     */
    public function __construct($prefix)
    {
        $this->prefix = $prefix;
    }

    /**
     * @param   LoadClassMetadataEventArgs $eventArgs
     */
    public function loadClassMetadata(LoadClassMetadataEventArgs $eventArgs)
    {
        /** @var \Doctrine\ORM\Mapping\ClassMetadataInfo $classMetadata */
        $classMetadata = $eventArgs->getClassMetadata();
        $classMetadata->setPrimaryTable(['name' => $this->prefix . $classMetadata->getTableName()]);

        foreach ($classMetadata->getAssociationMappings() as $fieldName => $mapping)
        {
            if (ClassMetadataInfo::MANY_TO_MANY == $mapping['type'])
            {
                $classMetadata->associationMappings[$fieldName]['joinTable']['name'] = $this->prefix
                    . $classMetadata->associationMappings[$fieldName]['joinTable']['name'];
            }
        }
    }
}