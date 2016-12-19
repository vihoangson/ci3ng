<?php

/**
 * Class Auth
 * @author ntd1712
 */
class Auth extends \Shared\Classes\Controller
{
    /** {@inheritdoc} */
    public function index_get()
    {
        throw new \BadMethodCallException('Unknown method ' . __METHOD__);
    }

    public function login_post()
    {
        var_dump($this);die;
    }
}