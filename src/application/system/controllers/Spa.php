<?php

/**
 * Class Spa
 */
class Spa extends \Shared\Classes\Controller
{
    /**
     * Single-page application
     */
    public function index_get()
    {
        $this->load->view($this->getConfig()->get('app.theme') . '/app', ['config' => $this->getConfig()]);
    }
}