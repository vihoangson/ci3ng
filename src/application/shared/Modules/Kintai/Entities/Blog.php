<?php namespace Kintai\Entities;

use Chaos\Common\AbstractBaseEntity;
use Chaos\Common\Traits\AuditEntityTrait;
use Chaos\Common\Traits\IdentityEntityTrait;

/**
 * Class Blog
 * @author ntd1712
 *
 * @Doctrine\ORM\Mapping\Entity(repositoryClass="Kintai\Repositories\BlogRepository")
 * @Doctrine\ORM\Mapping\EntityListeners({ "Kintai\Events\BlogListener" })
 * @Doctrine\ORM\Mapping\Table(name="blog")
 */
class Blog extends AbstractBaseEntity
{
    use IdentityEntityTrait, AuditEntityTrait;

    /**
     * @Doctrine\ORM\Mapping\Column(name="name", type="string")
     * [NotEmpty|HtmlEntities]
     */
    protected $Name;
    /**
     * @Doctrine\ORM\Mapping\Column(name="page", type="string")
     * [NotEmpty|HtmlEntities]
     */
    protected $Page;
}