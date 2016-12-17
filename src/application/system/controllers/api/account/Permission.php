<?php

/**
 * Class Permission
 * @author ntd1712
 */
class Permission extends \Shared\Classes\Controller
{
    public function id_get()
    {
        $response = $this->getService()->readAll($this->getFilterParams(), $this->getPagerParams());
        $this->response($response);
    }
}