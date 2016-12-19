<?php

use Firebase\JWT\JWT,
    Chaos\Common\Exceptions\ValidateException;

/**
 * Class Auth
 * @author ntd1712
 *
 * @method array|string|NULL post($key = NULL, $xss_clean = NULL)
 * @property-read \CI_Session $session
 */
class Auth extends \Shared\Classes\Controller
{
    /** {@inheritdoc} */
    public function index_get()
    {
        throw new \BadMethodCallException('Unknown method ' . __METHOD__);
    }

    /**
     * The "login" action
     *
     * @throws  ValidateException
     */
    public function login_post()
    {
        // are we logging out, or doing something else?
        if (true === (bool)$this->post('logout'))
        {
            return $this->logout_post();
        }

        // do some checks
        if (empty($this->post('email')) || false === filter_var($this->post('email'), FILTER_VALIDATE_EMAIL))
        {
            throw new ValidateException('Email is empty or invalid');
        }

        if (empty($this->post('password')))
        {
            throw new ValidateException('Password is empty');
        }

        /** @var \Account\Entities\User $entity */
        $entity = $this->getService('User')->getByEmail($this->post('email'));

        if (null === $entity || !password_verify($this->post('password'), $entity->getPassword()))
        {
            throw new ValidateException('Invalid credentials');
        }

        // prepare data
        $user = $entity->toSimpleArray();
        $user['Roles'] = $user['Permissions'] = [];

        if (0 !== count($roles = $entity->getRoles()))
        {   /** @var \Account\Entities\UserRole $userRole */
            foreach ($roles as $userRole)
            {
                $user['Roles'][strtolower($userRole->getRole()->getName())] = $userRole->getRole()->getId();

                if (0 !== count($permissions = $userRole->getRole()->getPermissions()))
                {   /** @var \Account\Entities\Permission $permission */
                    foreach ($permissions as $permission)
                    {
                        $user['Permissions'][strtolower($permission->getName())] = $permission->getId();
                    }
                }
            }
        }

        $ts = (new DateTime)->getTimestamp();
        $token = JWT::encode([
            'res' => $user,
            'sub' => 2,
            'iss' => 'http://kintai.local/api/auth/login',
            'iat' => $ts,
            'exp' => $ts + 60 * 60 * 5,
            'nbf' => $ts,
            'jti' => md5(sprintf('jti.%s.%s', 2, $ts))
        ], $this->getConfig()->get('app.key'));

        // save into session
        $this->session->set_userdata('locale', $this->post('locale') ?: @$user['Locale']);
        $this->session->set_userdata('loggedName', $user['Name']);
        $this->session->set_userdata('loggedUser', $user);

        // bye!
        $this->set_response(compact('token'));
    }

    /**
     * The "logout" action
     */
    public function logout_post()
    {
        // try
        // {
        //     \JWTAuth::invalidate(\JWTAuth::getToken());
        // }
        // catch (JWTException $e) {}

        $this->session->unset_userdata(['locale', 'loggedName', 'loggedUser']);
        $this->response(['success' => true]);
    }
}